const STORAGE_KEY = 'meyers-thanksgiving-v2';
const HOST_PASSWORD = 'meyer'; // Change this before publishing your site.
const DEFAULT_EVENT_DATE = '2026-11-28';

const defaultItems = [
  { id: 'ham', name: 'Ham', category: 'Main Table', needed: 1, claims: [] },
  { id: 'turkey', name: 'Turkey', category: 'Main Table', needed: 1, claims: [] },
  { id: 'turkey-gravy', name: 'Turkey Gravy', category: 'Sides', needed: 1, claims: [] },
  { id: 'mashed-potatoes', name: 'Mashed Potatoes', category: 'Sides', needed: 1, claims: [] },
  { id: 'stuffing', name: 'Stuffing', category: 'Sides', needed: 1, claims: [] },
  { id: 'green-bean-casserole', name: 'Green Bean Casserole', category: 'Sides', needed: 1, claims: [] },
  { id: 'mac-n-cheese', name: 'Mac n Cheese', category: 'Sides', needed: 1, claims: [] },
  { id: 'candied-yams', name: 'Candied Yams', category: 'Sides', needed: 1, claims: [] },
  { id: 'cranberry-sauce', name: 'Cranberry Sauce', category: 'Sides', needed: 1, claims: [] },
  { id: 'dinner-rolls', name: 'Dinner Rolls', category: 'Sides', needed: 1, claims: [] },
  { id: 'deviled-eggs', name: 'Deviled Eggs', category: 'Appetizers', needed: 1, claims: [] },
  { id: 'chips', name: 'Chips', category: 'Appetizers', needed: 1, claims: [] },
  { id: 'veggie-tray', name: 'Veggie Tray', category: 'Appetizers', needed: 1, claims: [] },
  { id: 'dips', name: 'Dips', category: 'Appetizers', needed: 1, claims: [] },
  { id: 'pumpkin-pie', name: 'Pumpkin Pie', category: 'Desserts', needed: 1, claims: [] },
  { id: 'cherry-pie', name: 'Cherry Pie', category: 'Desserts', needed: 1, claims: [] },
  { id: 'apple-pie', name: 'Apple Pie', category: 'Desserts', needed: 1, claims: [] },
  { id: 'water', name: 'Water', category: 'Drinks', needed: 1, claims: [] },
  { id: 'soda', name: 'Soda', category: 'Drinks', needed: 1, claims: [] },
  { id: 'beer', name: 'Beer', category: 'Drinks', needed: 1, claims: [] },
  { id: 'whiskey', name: 'Whiskey', category: 'Drinks', needed: 1, claims: [] },
  { id: 'wine', name: 'Wine', category: 'Drinks', needed: 1, claims: [] }
];
// Add one entry per invited household. The account name is also their sign-in name.
const GUEST_ACCOUNTS = [
  { name: 'Raudman', selected: true }
];

let state = loadState();
let guestName = '';
let pendingAccountAction = null;
let hostAuthenticated = false;
let hostToolsRequested = false;
const singleColumnMenu = window.matchMedia('(max-width: 800px)');

function initialState() { return { items: structuredClone(defaultItems), accounts: structuredClone(GUEST_ACCOUNTS), rsvps: [], eventDate: DEFAULT_EVENT_DATE, accountSelectionResetFor: '' }; }
function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function resetAccountSelectionAfterEvent(currentState) {
  if (currentState.eventDate >= localDateString() || currentState.accountSelectionResetFor === currentState.eventDate) return false;
  currentState.accounts.forEach(account => { account.selected = false; });
  currentState.accountSelectionResetFor = currentState.eventDate;
  return true;
}
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const loaded = saved ? { ...saved, accounts: (saved.accounts || structuredClone(GUEST_ACCOUNTS)).map(account => ({ ...account, selected: account.selected !== false })), rsvps: saved.rsvps || [], eventDate: saved.eventDate || DEFAULT_EVENT_DATE, accountSelectionResetFor: saved.accountSelectionResetFor || '' } : initialState();
    if (resetAccountSelectionAfterEvent(loaded)) localStorage.setItem(STORAGE_KEY, JSON.stringify(loaded));
    return loaded;
  } catch { return initialState(); }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); render(); }
function escapeHtml(value) { const el = document.createElement('div'); el.textContent = value; return el.innerHTML; }
function escapeAttribute(value) { return escapeHtml(value).replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }
function normalizeAccountName(value) { return value.replace(/\s/g, '').toLocaleLowerCase(); }
function showToast(message) { const toast = document.querySelector('#toast'); toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2600); }
function updateHostToolsButton() { document.querySelector('#hostToolsButton').textContent = hostAuthenticated ? 'Host tools' : 'Settings'; }
function ensureAccount(callback) {
  if (guestName) return callback();
  pendingAccountAction = callback;
  hostToolsRequested = false;
  const dialog = document.querySelector('#passwordDialog');
  if (!dialog.open) dialog.showModal();
}

function render() {
  const eventDate = new Date(`${state.eventDate}T12:00:00`);
  const dateElement = document.querySelector('#eventDate');
  dateElement.dateTime = state.eventDate;
  dateElement.textContent = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(eventDate);
  const categories = [...new Set(state.items.map(item => item.category))];
  const categoryCard = category => `
    <article class="category-card">
      <div class="category-title"><h3>${escapeHtml(category)}</h3></div>
      ${state.items.filter(item => item.category === category).map(renderDish).join('')}
      <button class="category-other" type="button" data-custom-category="${escapeHtml(category)}">I'll bring something else</button>
    </article>`;
  const menuColumns = Array.from({ length: singleColumnMenu.matches ? 1 : 2 }, () => []);
  categories.forEach((category, index) => menuColumns[index % menuColumns.length].push(categoryCard(category)));
  document.querySelector('#menuGrid').innerHTML = menuColumns
    .filter(column => column.length)
    .map(column => `<div class="menu-column">${column.join('')}</div>`)
    .join('');
  const claimed = state.items.reduce((sum, item) => sum + item.claims.length, 0);
  const needed = state.items.reduce((sum, item) => sum + Math.max(0, item.needed - item.claims.length), 0);
  const guests = state.rsvps.reduce((sum, rsvp) => sum + rsvp.adults + rsvp.children, 0);
  document.querySelector('#dishCount').textContent = claimed;
  document.querySelector('#guestCount').textContent = guests;
  document.querySelector('#remainingCount').textContent = needed;
  document.querySelectorAll('[data-claim]').forEach(button => button.addEventListener('click', () => claimItem(button.dataset.claim)));
  document.querySelectorAll('[data-custom-category]').forEach(button => button.addEventListener('click', () => openCustomItem(button.dataset.customCategory)));
}
function renderDish(item) {
  const mine = guestName && item.claims.includes(guestName);
  const remaining = Math.max(0, item.needed - item.claims.length);
  const claimants = [...new Set(item.claims)].map(escapeHtml).join(', ');
  return `<div class="dish ${remaining === 0 && !mine ? 'filled' : ''}"><h4>${escapeHtml(item.name)}</h4><div class="dish-meta">${remaining ? `${remaining} of ${item.needed} still needed` : 'All set — thank you!'}${claimants ? ` · ${claimants}` : ''}</div><button data-claim="${item.id}" ${remaining === 0 && !mine ? 'disabled' : ''} class="${mine ? 'claimed' : ''}">${mine ? '✓ Bringing it' : "I'll bring this"}</button></div>`;
}
function claimItem(id) {
  ensureAccount(() => {
    const item = state.items.find(entry => entry.id === id); if (!item) return;
    if (item.claims.includes(guestName)) { item.claims = item.claims.filter(name => name !== guestName); showToast(`Removed ${item.name} from your list.`); }
    else if (item.claims.length < item.needed) { item.claims.push(guestName); showToast(`Thanks, ${guestName}! You're bringing ${item.name}.`); }
    saveState();
  });
}
function openCustomItem(category) {
  ensureAccount(() => {
    document.querySelector('#customItemCategory').value = category;
    document.querySelector('#customItemDialog').showModal();
  });
}

document.querySelector('#passwordForm').addEventListener('submit', event => {
  event.preventDefault();
  const accountName = document.querySelector('#accountPassword').value;
  if (accountName.toLocaleLowerCase() === HOST_PASSWORD.toLocaleLowerCase()) {
    hostAuthenticated = true;
    updateHostToolsButton();
    pendingAccountAction = null;
    const shouldOpenHostTools = hostToolsRequested;
    hostToolsRequested = false;
    document.querySelector('#passwordDialog').close();
    document.querySelector('#accountPasswordError').textContent = '';
    if (shouldOpenHostTools) document.querySelector('#hostToolsDialog').showModal();
    else showToast('Host sign-in complete. Use Host tools when you are ready.');
    return;
  }
  const normalizedAccountName = normalizeAccountName(accountName);
  const account = state.accounts.find(entry => normalizeAccountName(entry.name) === normalizedAccountName);
  if (!account) { document.querySelector('#accountPasswordError').textContent = 'That last name is not recognized.'; return; }
  if (!account.selected) { document.querySelector('#accountPasswordError').textContent = 'This account is not selected for the current event.'; return; }
  guestName = account.name;
  document.querySelector('#accountPasswordError').textContent = '';
  document.querySelector('#passwordDialog').close();
  render();
  const action = pendingAccountAction; pendingAccountAction = null; action?.();
});
document.querySelector('#customItemForm').addEventListener('submit', event => {
  event.preventDefault();
  const name = document.querySelector('#customItemName').value.trim();
  const quantity = Number(document.querySelector('#customItemQuantity').value);
  const category = document.querySelector('#customItemCategory').value;
  if (!name || !category || quantity < 1) return;
  state.items.push({ id: `custom-${Date.now()}`, name, category, needed: quantity, claims: Array(quantity).fill(guestName) });
  event.target.reset(); document.querySelector('#customItemQuantity').value = 1;
  document.querySelector('#customItemDialog').close(); saveState(); showToast(`${name} was added to ${category}!`);
});
document.querySelector('#rsvpButton').addEventListener('click', () => ensureAccount(() => {
  const existing = state.rsvps.find(r => r.name === guestName);
  document.querySelector('#adults').value = existing?.adults ?? 1;
  document.querySelector('#children').value = existing?.children ?? 0;
  document.querySelector('#rsvpDialog').showModal();
}));
document.querySelectorAll('.stepper button').forEach(button => button.addEventListener('click', () => {
  const output = document.querySelector(`#${button.dataset.target}`);
  output.value = Math.max(0, Math.min(20, Number(output.value) + Number(button.dataset.step)));
}));
document.querySelector('#rsvpForm').addEventListener('submit', () => {
  const rsvp = { name: guestName, adults: Number(document.querySelector('#adults').value), children: Number(document.querySelector('#children').value) };
  const index = state.rsvps.findIndex(entry => entry.name === guestName);
  if (index >= 0) state.rsvps[index] = rsvp; else state.rsvps.push(rsvp);
  saveState(); showToast(`RSVP saved — we can't wait to see you!`);
});
document.querySelector('#guestListButton').addEventListener('click', () => {
  const list = document.querySelector('#guestList');
  list.innerHTML = state.rsvps.length ? state.rsvps.map(rsvp => `<div class="guest-entry"><strong>${escapeHtml(rsvp.name)}</strong><span>${rsvp.adults} adult${rsvp.adults === 1 ? '' : 's'} · ${rsvp.children} child${rsvp.children === 1 ? '' : 'ren'}</span></div>`).join('') : '<p class="guest-empty">No guests have RSVP’d yet.</p>';
  document.querySelector('#guestListDialog').showModal();
});
function openAdmin() {
  document.querySelector('#adminEventDate').value = state.eventDate;
  document.querySelector('#adminItems').innerHTML = state.items.map(item => `<div class="admin-row" data-admin-id="${escapeAttribute(item.id)}"><input value="${escapeAttribute(item.name)}" aria-label="Dish name"><select aria-label="Category">${['Appetizers','Main Table','Sides','Desserts','Drinks'].map(c => `<option ${c === item.category ? 'selected' : ''}>${c}</option>`).join('')}</select><input type="number" min="1" max="50" value="${item.needed}" aria-label="Amount"><button type="button" aria-label="Delete">×</button></div>`).join('');
  document.querySelectorAll('.admin-row').forEach(row => {
    const [name, category, amount, remove] = row.children;
    [name, category, amount].forEach(input => input.addEventListener('change', () => { const item = state.items.find(i => i.id === row.dataset.adminId); item.name = name.value.trim() || item.name; item.category = category.value; item.needed = Math.max(1, Number(amount.value)); saveState(); }));
    remove.addEventListener('click', () => { state.items = state.items.filter(i => i.id !== row.dataset.adminId); saveState(); openAdmin(); });
  });
  const dialog = document.querySelector('#adminDialog'); if (!dialog.open) dialog.showModal();
}
function openAccountsAdmin() {
  document.querySelector('#adminAccountError').textContent = '';
  document.querySelector('#adminAccounts').innerHTML = state.accounts.length ? state.accounts.map((account, index) => `<div class="account-row" data-account-index="${index}"><label class="account-selection"><input type="checkbox" ${account.selected ? 'checked' : ''}><span>Selected for event</span></label><input value="${escapeAttribute(account.name)}" maxlength="60" aria-label="Account name"><button type="button" aria-label="Delete ${escapeAttribute(account.name)} account">×</button></div>`).join('') : '<p class="guest-empty">No guest accounts yet.</p>';
  document.querySelectorAll('.account-row').forEach(row => {
    const [selection, name, remove] = row.children;
    selection.querySelector('input').addEventListener('change', event => {
      state.accounts[Number(row.dataset.accountIndex)].selected = event.target.checked;
      if (!event.target.checked && guestName === state.accounts[Number(row.dataset.accountIndex)].name) guestName = '';
      saveState();
    });
    name.addEventListener('change', () => renameAccount(Number(row.dataset.accountIndex), name));
    remove.addEventListener('click', () => {
      const [removed] = state.accounts.splice(Number(row.dataset.accountIndex), 1);
      state.items.forEach(item => { item.claims = item.claims.filter(name => name !== removed.name); });
      state.rsvps = state.rsvps.filter(rsvp => rsvp.name !== removed.name);
      if (guestName === removed.name) guestName = '';
      saveState(); openAccountsAdmin(); showToast('Account removed.');
    });
  });
  const dialog = document.querySelector('#accountsDialog'); if (!dialog.open) dialog.showModal();
}
function renameAccount(index, input) {
  const oldName = state.accounts[index]?.name;
  const newName = input.value.trim();
  const duplicate = state.accounts.some((account, accountIndex) => accountIndex !== index && normalizeAccountName(account.name) === normalizeAccountName(newName));
  if (!newName || duplicate) {
    input.value = oldName || '';
    document.querySelector('#adminAccountError').textContent = duplicate ? 'That account already exists.' : 'Account names cannot be empty.';
    return;
  }
  state.accounts[index].name = newName;
  state.items.forEach(item => { item.claims = item.claims.map(name => name === oldName ? newName : name); });
  state.rsvps.forEach(rsvp => { if (rsvp.name === oldName) rsvp.name = newName; });
  if (guestName === oldName) guestName = newName;
  document.querySelector('#adminAccountError').textContent = '';
  saveState(); showToast('Account updated.');
}
document.querySelector('#hostToolsButton').addEventListener('click', () => {
  pendingAccountAction = null;
  if (hostAuthenticated) document.querySelector('#hostToolsDialog').showModal();
  else if (!document.querySelector('#passwordDialog').open) {
    hostToolsRequested = true;
    document.querySelector('#passwordDialog').showModal();
  }
});
document.querySelector('#passwordDialog').addEventListener('close', () => { hostToolsRequested = false; });
document.querySelector('#editItemsButton').addEventListener('click', () => { document.querySelector('#hostToolsDialog').close(); openAdmin(); });
document.querySelector('#editAccountsButton').addEventListener('click', () => { document.querySelector('#hostToolsDialog').close(); openAccountsAdmin(); });
document.querySelector('#adminAddAccountButton').addEventListener('click', () => {
  const input = document.querySelector('#adminNewAccount');
  const name = input.value.trim();
  if (!name) { document.querySelector('#adminAccountError').textContent = 'Enter a last name.'; return; }
  if (state.accounts.some(account => normalizeAccountName(account.name) === normalizeAccountName(name))) { document.querySelector('#adminAccountError').textContent = 'That account already exists.'; return; }
  state.accounts.push({ name, selected: false }); input.value = ''; saveState(); openAccountsAdmin(); showToast(`${name} account added. Select it to allow sign-in.`);
});
document.querySelector('#adminEventDate').addEventListener('change', event => { if (!event.target.value) return; state.eventDate = event.target.value; state.accountSelectionResetFor = ''; resetAccountSelectionAfterEvent(state); saveState(); showToast('Event date updated.'); });
document.querySelector('#adminAddButton').addEventListener('click', () => {
  const name = document.querySelector('#adminNewItem').value.trim(); if (!name) return;
  state.items.push({ id: `host-${Date.now()}`, name, category: document.querySelector('#adminNewCategory').value, needed: Math.max(1, Number(document.querySelector('#adminNewAmount').value)), claims: [] });
  document.querySelector('#adminNewItem').value = ''; saveState(); openAdmin();
});

render();
singleColumnMenu.addEventListener('change', render);
setTimeout(() => document.querySelector('#passwordDialog').showModal(), 450);
setInterval(() => {
  if (!resetAccountSelectionAfterEvent(state)) return;
  guestName = '';
  saveState();
  showToast('The event has passed. Account selections have been reset.');
}, 60 * 1000);
