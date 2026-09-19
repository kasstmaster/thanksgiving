import AnyListModule from 'anylist';
import { addMissingAccounts, convertCategory } from './anylist-accounts.js';

const required = name => { if (!process.env[name]) throw new Error(`${name} is not configured.`); return process.env[name]; };
const ownerRepo = required('STATE_REPOSITORY').split('/');
if (ownerRepo.length !== 2) throw new Error('STATE_REPOSITORY must be owner/repository.');
const [owner, repo] = ownerRepo;
const branch = process.env.STATE_BRANCH || 'main';
const statePath = process.env.STATE_PATH || 'data/app-state.json';
const syncId = required('SYNC_ID');
const token = required('STATE_REPOSITORY_TOKEN');
const apiHeaders = { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'User-Agent': 'thanksgiving-anylist-sync', 'X-GitHub-Api-Version': '2022-11-28' };

async function github(path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, { ...options, headers: { ...apiHeaders, ...options.headers } });
  if (!response.ok) throw new Error(`GitHub ${options.method || 'GET'} failed (${response.status}).`);
  return response.status === 204 ? null : response.json();
}
const contentUrl = path => `/repos/${owner}/${repo}/contents/${path.split('/').map(encodeURIComponent).join('/')}`;
async function getFile(path) {
  const file = await github(`${contentUrl(path)}?ref=${encodeURIComponent(branch)}`);
  return { sha: file.sha, value: JSON.parse(Buffer.from(file.content, 'base64').toString('utf8')) };
}
async function putFile(path, value, message, sha) {
  return github(contentUrl(path), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, content: Buffer.from(`${JSON.stringify(value, null, 2)}\n`).toString('base64'), branch, ...(sha ? { sha } : {}) }) });
}
async function writeStatus(status) {
  const path = `.anylist-sync/${syncId}.json`;
  let sha;
  try { sha = (await getFile(path)).sha; } catch (error) { if (!error.message.includes('(404)')) throw error; }
  await putFile(path, status, `Record AnyList sync ${syncId}`, sha);
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value instanceof Map) return [...value.values()];
  return value && typeof value === 'object' ? Object.values(value) : [];
}
function structuredLists(client, loginResult) {
  const candidates = [loginResult?.lists, client.lists, loginResult];
  return asArray(candidates.find(value => asArray(value).length));
}
function itemCategoryName(item, categories) {
  const direct = item?.category?.name ?? item?.categoryName ?? (typeof item?.category === 'string' ? item.category : '');
  if (direct) return String(direct).trim();
  const categoryId = item?.categoryId ?? item?.category?.id;
  return String(categories.find(category => (category?.id ?? category?.identifier) === categoryId)?.name ?? '').trim();
}

async function run() {
  console.log('AnyList sync started.');
  const email = required('ANYLIST_EMAIL');
  const password = required('ANYLIST_PASSWORD');
  const listName = process.env.ANYLIST_LIST_NAME || 'Address Book';
  const AnyList = AnyListModule.AnyList || AnyListModule.default || AnyListModule;
  const client = AnyList.length >= 2 ? new AnyList(email, password) : new AnyList({ email, password });
  let loginResult;
  try { loginResult = await client.login(); console.log('AnyList authentication succeeded.'); }
  catch (error) { console.error('AnyList authentication failed.'); throw error; }
  let lists = structuredLists(client, loginResult);
  if (!lists.length && typeof client.getLists === 'function') {
    const loadedLists = await client.getLists();
    lists = asArray(loadedLists).length ? asArray(loadedLists) : structuredLists(client, loginResult);
  }
  const list = lists.find(candidate => String(candidate.name).trim().toLocaleLowerCase() === listName.toLocaleLowerCase());
  if (!list) throw new Error(`AnyList list “${listName}” was not found.`);
  let loadedItems;
  if (typeof list.getItems === 'function' && !asArray(list.items).length) loadedItems = await list.getItems();
  const items = asArray(list.items).length ? asArray(list.items) : asArray(loadedItems);
  const categoryObjects = asArray(list.categories);
  const categories = categoryObjects.map(category => String(category?.name ?? category).trim()).filter(Boolean);
  for (const item of items) { const category = itemCategoryName(item, categoryObjects); if (category && !categories.includes(category)) categories.push(category); }
  console.log(`Address Book found: ${categories.length} categories, ${items.length} actual items, ${items.filter(item => item.notes || item.note || item.description).length} item notes ignored.`);
  const accounts = [];
  let skipped = 0;
  for (const category of categories) {
    const categoryItems = items.filter(item => itemCategoryName(item, categoryObjects).toLocaleLowerCase() === category.toLocaleLowerCase());
    const converted = convertCategory(category, categoryItems.map(item => ({ name: item.name })));
    skipped += converted.skipped.length;
    if (converted.account) accounts.push(converted.account); else skipped += 1;
  }
  console.log(`${accounts.length} accounts converted; ${skipped} ambiguous/empty entries skipped.`);
  let added = [];
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const current = await getFile(statePath);
    const state = current.value;
    if (!Array.isArray(state.accounts)) throw new Error('Current state has no accounts array.');
    const before = state.accounts.length;
    added = addMissingAccounts(state, accounts);
    console.log(`${accounts.length - added.length} converted accounts already exist; ${added.length} will be added.`);
    if (!added.length) break;
    try { await putFile(statePath, state, `Add ${added.length} account(s) from AnyList`, current.sha); console.log('Account state saved successfully.'); break; }
    catch (error) { if (!error.message.includes('(409)') || attempt === 2) throw error; console.log('State changed concurrently; retrying against the latest SHA.'); }
  }
  await writeStatus({ state: 'complete', added: added.length, skipped, finishedAt: new Date().toISOString() });
}

run().catch(async error => {
  console.error(`AnyList sync failed: ${error.message}`);
  try { await writeStatus({ state: 'failed', finishedAt: new Date().toISOString() }); } catch (statusError) { console.error(`Could not save failure status: ${statusError.message}`); }
  process.exitCode = 1;
});
