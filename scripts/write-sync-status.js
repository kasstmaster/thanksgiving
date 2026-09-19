const [owner, repo] = (process.env.STATE_REPOSITORY || '').split('/');
const token = process.env.STATE_REPOSITORY_TOKEN;
const syncId = process.env.SYNC_ID;
const branch = process.env.STATE_BRANCH || 'main';
const state = process.argv[2];
if (!owner || !repo || !token || !syncId || !['running', 'failed'].includes(state)) throw new Error('Sync status configuration is incomplete.');
const path = `.anylist-sync/${syncId}.json`;
const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
const headers = { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'User-Agent': 'thanksgiving-anylist-sync', 'X-GitHub-Api-Version': '2022-11-28' };
const current = await fetch(`${url}?ref=${encodeURIComponent(branch)}`, { headers });
if (!current.ok && current.status !== 404) throw new Error(`GitHub status read failed (${current.status}).`);
const sha = current.ok ? (await current.json()).sha : undefined;
const value = { state, ...(state === 'failed' ? { finishedAt: new Date().toISOString() } : { startedAt: new Date().toISOString() }) };
const saved = await fetch(url, {
  method: 'PUT',
  headers: { ...headers, 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: `Record AnyList sync ${syncId}`, content: Buffer.from(`${JSON.stringify(value, null, 2)}\n`).toString('base64'), branch, ...(sha ? { sha } : {}) })
});
if (!saved.ok) throw new Error(`GitHub status write failed (${saved.status}).`);
