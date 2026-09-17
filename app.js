const STORAGE_KEY = 'meyers-thanksgiving-v2';
const HOST_PASSWORD = '0810'; // Change this before publishing your site.
const HOST_DISPLAY_NAME = 'The Host';
const DEFAULT_EVENT_DATE = '2026-11-28';
const DEFAULT_CHRISTMAS_DATE = '2026-12-25';
const CHRISTMAS_MENU_VERSION = 2;
const ACCOUNT_RESET_VERSION = 1;
const DEFAULT_QUANTITY_UNITS = [
  { id: 'item', label: 'Item', locked: true },
  { id: 'dozen', label: 'Dozen' }
];

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
const GUEST_ACCOUNTS = [];

const EVENT_DETAILS = {
  thanksgiving: { name: 'Thanksgiving', theme: 'thanksgiving', header: 'https://i.postimg.cc/JnFX8pPS/Website-Header-Thanksgiving.png' },
  christmas: { name: 'Christmas', theme: 'christmas', header: 'https://i.postimg.cc/rmMy7x1t/Website-Header-Christmas.png' }
};

function christmasItems() {
  return [
    { id: 'cocktail-meatballs', name: 'Cocktail Meatballs', category: 'Appetizers', needed: 1, claims: [] },
    { id: 'jalapeno-poppers', name: 'Jalapeño Poppers', category: 'Appetizers', needed: 1, claims: [] },
    { id: 'charcuterie-board', name: 'Charcuterie Board', category: 'Appetizers', needed: 1, claims: [] },
    { id: 'crudite-platter', name: 'Fresh Vegetable Crudité Platter', category: 'Appetizers', needed: 1, claims: [] },
    { id: 'shrimp-cocktail-platter', name: 'Shrimp Cocktail Platter', category: 'Appetizers', needed: 1, claims: [] },
    { id: 'dips', name: 'Dips', category: 'Appetizers', needed: 1, claims: [] },
    { id: 'potato-dish', name: 'Potato Dish — mashed, roasted, etc.', category: 'Sides', needed: 1, claims: [] },
    { id: 'broccoli-salad', name: 'Broccoli Salad', category: 'Sides', needed: 1, claims: [] },
    { id: 'black-forest-cheesecake', name: 'Black Forest Cheesecake', category: 'Desserts', needed: 1, claims: [] },
    { id: 'cookies', name: 'Cookies', category: 'Desserts', needed: 1, claims: [] },
    { id: 'pie', name: 'Pie', category: 'Desserts', needed: 1, claims: [] },
    { id: 'banana-bread', name: 'Banana Bread', category: 'Desserts', needed: 1, claims: [] },
    { id: 'water', name: 'Water', category: 'Drinks', needed: 1, claims: [] },
    { id: 'soda', name: 'Soda', category: 'Drinks', needed: 1, claims: [] },
    { id: 'beer', name: 'Beer', category: 'Drinks', needed: 1, claims: [] },
    { id: 'whiskey', name: 'Whiskey', category: 'Drinks', needed: 1, claims: [] },
    { id: 'wine', name: 'Wine', category: 'Drinks', needed: 1, claims: [] },
    { id: 'mulled-wine', name: 'Mulled Wine', category: 'Drinks', needed: 1, claims: [] }
  ];
}
function makeEvent(items, eventDate, menuVersion) { return { items, rsvps: [], eventDate, accountSelectionResetFor: '', menuVersion, quantityUnits: structuredClone(DEFAULT_QUANTITY_UNITS) }; }
function initialAppState() {
  return {
    activeEventId: 'thanksgiving',
    accountResetVersion: ACCOUNT_RESET_VERSION,
    accounts: structuredClone(GUEST_ACCOUNTS),
    events: {
      thanksgiving: makeEvent(structuredClone(defaultItems), DEFAULT_EVENT_DATE),
      christmas: makeEvent(christmasItems(), DEFAULT_CHRISTMAS_DATE, CHRISTMAS_MENU_VERSION)
    }
  };
}

let appState = loadState();
let state = appState.events[appState.activeEventId];
let guestName = '';
let pendingAccountAction = null;
let pendingClaimItemId = null;
let hostAuthenticated = false;
let hostToolsRequested = false;
const singleColumnMenu = window.matchMedia('(max-width: 800px)');

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return initialAppState();
    if (saved.events) {
      const fresh = initialAppState();
      const loaded = {
        ...fresh,
        ...saved,
        activeEventId: saved.events[saved.activeEventId] ? saved.activeEventId : 'thanksgiving',
        accounts: (saved.accounts || fresh.accounts).map(account => ({ ...account, selected: account.selected !== false })),
        events: { ...fresh.events, ...saved.events }
      };
      if (loaded.events.christmas.menuVersion !== CHRISTMAS_MENU_VERSION) {
        const previousClaims = new Map(loaded.events.christmas.items.map(item => [item.id, item.claims]));
        loaded.events.christmas.items = christmasItems().map(item => ({ ...item, claims: previousClaims.get(item.id) || [] }));
        loaded.events.christmas.menuVersion = CHRISTMAS_MENU_VERSION;
      }
      if (saved.accountResetVersion !== ACCOUNT_RESET_VERSION) {
        loaded.accounts = [];
        Object.values(loaded.events).forEach(eventState => {
          eventState.items.forEach(item => { item.claims = item.claims.filter(name => name === HOST_DISPLAY_NAME); });
          eventState.rsvps = eventState.rsvps.filter(rsvp => rsvp.name === HOST_DISPLAY_NAME);
        });
        loaded.accountResetVersion = ACCOUNT_RESET_VERSION;
      }
      Object.values(loaded.events).forEach(eventState => {
        eventState.quantityUnits = eventState.quantityUnits?.length ? eventState.quantityUnits : structuredClone(DEFAULT_QUANTITY_UNITS);
      });
      return loaded;
    }
    // Upgrade the original single-Thanksgiving data while retaining host entries.
    const upgraded = initialAppState();
    upgraded.events.thanksgiving = {
      items: (saved.items || structuredClone(defaultItems)).map(item => ({ ...item, claims: item.claims.filter(name => name === HOST_DISPLAY_NAME) })),
      rsvps: (saved.rsvps || []).filter(rsvp => rsvp.name === HOST_DISPLAY_NAME),
      eventDate: saved.eventDate || DEFAULT_EVENT_DATE, accountSelectionResetFor: saved.accountSelectionResetFor || '',
      quantityUnits: structuredClone(DEFAULT_QUANTITY_UNITS)
    };
    return upgraded;
  } catch { return initialAppState(); }
}
function saveState() {
  appState.events[appState.activeEventId] = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  render();
}
function escapeHtml(value) { const el = document.createElement('div'); el.textContent = value; return el.innerHTML; }
function escapeAttribute(value) { return escapeHtml(value).replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }
function amountOptions(item = {}) {
  return `<option value="optional" ${item.optional ? 'selected' : ''}>Optional</option>${Array.from({ length: 50 }, (_, index) => {
    const amount = index + 1;
    return `<option value="${amount}" ${!item.optional && item.needed === amount ? 'selected' : ''}>${amount}</option>`;
  }).join('')}`;
}
function unitOptions(item = {}) {
  const selectedUnit = state.quantityUnits.some(unit => unit.id === item.unit) ? item.unit : 'item';
  return state.quantityUnits.map(unit => `<option value="${escapeAttribute(unit.id)}" ${unit.id === selectedUnit ? 'selected' : ''}>${escapeHtml(unit.label)}${unit.id === 'item' ? '(s)' : ''}</option>`).join('');
}
function formatQuantity(quantity, item = {}) {
  if (!item.unit || item.unit === 'item') return String(quantity);
  const unit = state.quantityUnits.find(entry => entry.id === item.unit);
  if (!unit) return String(quantity);
  const label = unit.label.toLocaleLowerCase();
  let plural = label;
  if (quantity !== 1 && label !== 'dozen') {
    if (/[^aeiou]y$/i.test(label)) plural = `${label.slice(0, -1)}ies`;
    else if (/(s|x|z|ch|sh)$/i.test(label)) plural = `${label}es`;
    else plural = `${label}s`;
  }
  return `${quantity} ${plural}`;
}
document.querySelector('#adminNewAmount').innerHTML = amountOptions({ needed: 1 });
function normalizeAccountName(value) {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/^the\s+/, '')
    .replace(/\s/g, '');
}
function householdDisplayName(value) {
  const name = value.trim();
  if (!name || name === HOST_DISPLAY_NAME) return name;
  if (/^the\s+/i.test(name)) return name.replace(/^the\s+/i, 'The ');
  const firstHousehold = name.split('/')[0].trim();
  const lastName = firstHousehold.includes(' ')
    ? firstHousehold.slice(firstHousehold.lastIndexOf(' ') + 1)
    : firstHousehold;
  if (/['’]$/.test(lastName)) return `The ${lastName}`;
  return `The ${lastName}${/s$/i.test(lastName) ? "'" : 's'}`;
}
function accountSignInNames(accountName) {
  return accountName.split('/').flatMap(household => {
    const entry = household.trim();
    const lastSpace = entry.lastIndexOf(' ');
    if (lastSpace < 0) return [entry];
    const lastName = entry.slice(lastSpace + 1).trim();
    return entry.slice(0, lastSpace).split(',')
      .map(firstName => `${firstName.trim()} ${lastName}`)
      .filter(name => name.length > lastName.length + 1);
  });
}
function accountNameMatches(enteredName, accountName) {
  const normalizedEntry = normalizeAccountName(enteredName);
  return accountSignInNames(accountName).some(name => normalizeAccountName(name) === normalizedEntry);
}
function showToast(message) { const toast = document.querySelector('#toast'); toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2600); }
function updateHostToolsButton() { document.querySelector('#hostToolsButton').textContent = hostAuthenticated ? 'Host tools' : 'Settings'; }
function ensureAccount(callback) {
  if (guestName) return callback();
  if (hostAuthenticated) {
    guestName = HOST_DISPLAY_NAME;
    render();
    return callback();
  }
  pendingAccountAction = callback;
  hostToolsRequested = false;
  const dialog = document.querySelector('#passwordDialog');
  if (!dialog.open) dialog.showModal();
}

function render() {
  const event = EVENT_DETAILS[appState.activeEventId];
  document.body.className = `theme-${event.theme}`;
  document.title = `The Meyers ${event.name}`;
  document.querySelector('meta[name="description"]').content = `The Meyers ${event.name} potluck and RSVP page.`;
  const headerImage = document.querySelector('#eventHeaderImage');
  headerImage.src = event.header;
  headerImage.alt = `${event.name} celebration header`;
  headerImage.hidden = false;
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
  const needed = state.items.reduce((sum, item) => sum + (item.optional ? 0 : Math.max(0, item.needed - item.claims.length)), 0);
  const guests = state.rsvps.reduce((sum, rsvp) => sum + rsvp.adults + rsvp.children, 0);
  document.querySelector('#dishCount').textContent = claimed;
  document.querySelector('#guestCount').textContent = guests;
  document.querySelector('#remainingCount').textContent = needed;
  const guestListButton = document.querySelector('#guestListButton');
  guestListButton.disabled = !hostAuthenticated;
  guestListButton.title = hostAuthenticated ? 'View guest names and RSVP details' : 'Guest details are private to the host';
  guestListButton.setAttribute('aria-label', hostAuthenticated ? `${guests} guests attending; view private guest list` : `${guests} guests attending; details visible only to the host`);
  document.querySelectorAll('[data-claim]').forEach(button => button.addEventListener('click', () => claimItem(button.dataset.claim)));
  document.querySelectorAll('[data-custom-category]').forEach(button => button.addEventListener('click', () => openCustomItem(button.dataset.customCategory)));
}
function renderDish(item) {
  const mine = guestName && item.claims.includes(guestName);
  const remaining = Math.max(0, item.needed - item.claims.length);
  const claimants = hostAuthenticated
    ? `<span class="dish-claimants">${[...new Set(item.claims)].map(name => escapeHtml(householdDisplayName(name))).join(', ')}</span>`
    : '';
  const status = item.optional ? 'Optional' : (remaining ? `${formatQuantity(remaining, item)} of ${formatQuantity(item.needed, item)} still needed` : '');
  const details = [status, claimants].filter(Boolean).join(' · ');
  const unavailable = remaining === 0 && !mine;
  return `<div class="dish"><h4>${escapeHtml(item.name)}</h4>${details ? `<div class="dish-meta">${details}</div>` : ''}<button data-claim="${item.id}" ${unavailable ? 'disabled' : ''} class="${mine ? 'claimed' : ''}">${mine ? '✓ Bringing it' : (unavailable ? 'Claimed' : "I'll bring this")}</button></div>`;
}
function claimItem(id) {
  ensureAccount(() => {
    const item = state.items.find(entry => entry.id === id); if (!item) return;
    if (item.claims.includes(guestName)) {
      item.claims = item.claims.filter(name => name !== guestName);
      showToast(`Removed ${item.name} from your list.`);
      saveState();
      return;
    }
    const remaining = item.needed - item.claims.length;
    if (remaining < 1) return;
    if (item.needed > 1) {
      pendingClaimItemId = item.id;
      document.querySelector('#claimQuantityDescription').textContent = `${formatQuantity(remaining, item)} of ${formatQuantity(item.needed, item)} ${item.name} still needed.`;
      document.querySelector('#claimQuantity').innerHTML = Array.from({ length: remaining }, (_, index) => {
        const quantity = index + 1;
        return `<option value="${quantity}">${formatQuantity(quantity, item)}</option>`;
      }).join('');
      document.querySelector('#claimQuantityDialog').showModal();
      return;
    }
    item.claims.push(guestName);
    saveState();
    showToast(`Thanks, ${householdDisplayName(guestName)}! You're bringing ${item.unit === 'dozen' ? `a dozen of ${item.name}` : item.name}.`);
  });
}
function openCustomItem(category) {
  ensureAccount(() => {
    document.querySelector('#customItemCategory').value = category;
    document.querySelector('#customItemUnit').innerHTML = unitOptions();
    document.querySelector('#customItemDialog').showModal();
  });
}

document.querySelector('#passwordForm').addEventListener('submit', event => {
  event.preventDefault();
  const accountName = document.querySelector('#accountPassword').value;
  if (normalizeAccountName(accountName) === normalizeAccountName(HOST_PASSWORD)) {
    hostAuthenticated = true;
    guestName = HOST_DISPLAY_NAME;
    updateHostToolsButton();
    const action = pendingAccountAction;
    pendingAccountAction = null;
    const shouldOpenHostTools = hostToolsRequested;
    hostToolsRequested = false;
    document.querySelector('#passwordDialog').close();
    document.querySelector('#accountPasswordError').textContent = '';
    render();
    if (shouldOpenHostTools) document.querySelector('#hostToolsDialog').showModal();
    else if (action) action();
    else showToast('Host sign-in complete. You can RSVP and bring items as The Host.');
    return;
  }
  const account = appState.accounts.find(entry => accountNameMatches(accountName, entry.name));
  if (!account) { document.querySelector('#accountPasswordError').textContent = 'That first and last name is not recognized.'; return; }
  if (!account.selected) { document.querySelector('#accountPasswordError').textContent = 'This account is not currently invited.'; return; }
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
  const unit = document.querySelector('#customItemUnit').value;
  const category = document.querySelector('#customItemCategory').value;
  if (!name || !category || quantity < 1) return;
  state.items.push({ id: `custom-${Date.now()}`, name, category, needed: quantity, unit, claims: Array(quantity).fill(guestName) });
  event.target.reset(); document.querySelector('#customItemQuantity').value = 1;
  document.querySelector('#customItemDialog').close(); saveState(); showToast(`${name} was added to ${category}!`);
});
document.querySelector('#claimQuantityForm').addEventListener('submit', event => {
  event.preventDefault();
  if (event.submitter?.value === 'cancel') {
    document.querySelector('#claimQuantityDialog').close();
    return;
  }
  const item = state.items.find(entry => entry.id === pendingClaimItemId);
  const requestedQuantity = Number(document.querySelector('#claimQuantity').value);
  if (!item || item.claims.includes(guestName) || requestedQuantity < 1) return;
  const quantity = Math.min(requestedQuantity, Math.max(0, item.needed - item.claims.length));
  if (!quantity) return;
  item.claims.push(...Array(quantity).fill(guestName));
  pendingClaimItemId = null;
  document.querySelector('#claimQuantityDialog').close();
  saveState();
  showToast(`Thanks, ${householdDisplayName(guestName)}! You're bringing ${formatQuantity(quantity, item)} of ${item.name}.`);
});
document.querySelector('#claimQuantityDialog').addEventListener('close', () => { pendingClaimItemId = null; });
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
  if (!hostAuthenticated) return;
  const list = document.querySelector('#guestList');
  list.innerHTML = state.rsvps.length ? state.rsvps.map(rsvp => `<div class="guest-entry"><strong>${escapeHtml(householdDisplayName(rsvp.name))}</strong><span>${rsvp.adults} adult${rsvp.adults === 1 ? '' : 's'} · ${rsvp.children} child${rsvp.children === 1 ? '' : 'ren'}</span></div>`).join('') : '<p class="guest-empty">No guests have RSVP’d yet.</p>';
  document.querySelector('#guestListDialog').showModal();
});
function openAdmin() {
  document.querySelector('#adminEventDate').value = state.eventDate;
  document.querySelector('#adminNewUnit').innerHTML = unitOptions();
  renderQuantityUnits();
  document.querySelector('#adminItems').innerHTML = state.items.map(item => `<div class="admin-row" data-admin-id="${escapeAttribute(item.id)}"><input value="${escapeAttribute(item.name)}" aria-label="Dish name"><select aria-label="Category">${['Appetizers','Main Table','Sides','Desserts','Drinks'].map(c => `<option ${c === item.category ? 'selected' : ''}>${c}</option>`).join('')}</select><select aria-label="Amount needed">${amountOptions(item)}</select><select aria-label="Quantity type">${unitOptions(item)}</select><button type="button" aria-label="Delete">×</button></div>`).join('');
  document.querySelectorAll('.admin-row').forEach(row => {
    const [name, category, amount, unit, remove] = row.children;
    [name, category, amount, unit].forEach(input => input.addEventListener('change', () => { const item = state.items.find(i => i.id === row.dataset.adminId); item.name = name.value.trim() || item.name; item.category = category.value; item.optional = amount.value === 'optional'; item.unit = unit.value; if (!item.optional) item.needed = Number(amount.value); saveState(); }));
    remove.addEventListener('click', () => { state.items = state.items.filter(i => i.id !== row.dataset.adminId); saveState(); openAdmin(); });
  });
  const dialog = document.querySelector('#adminDialog'); if (!dialog.open) dialog.showModal();
}
function renderQuantityUnits() {
  document.querySelector('#adminUnitError').textContent = '';
  document.querySelector('#adminUnits').innerHTML = state.quantityUnits.map(unit => `<div class="admin-unit-row" data-unit-id="${escapeAttribute(unit.id)}"><input value="${escapeAttribute(unit.label)}" maxlength="30" aria-label="Quantity type name" ${unit.locked ? 'disabled' : ''}><button type="button" ${unit.locked ? 'disabled' : ''} aria-label="Remove ${escapeAttribute(unit.label)} quantity type">Remove</button></div>`).join('');
  document.querySelectorAll('.admin-unit-row').forEach(row => {
    const [name, remove] = row.children;
    name.addEventListener('change', () => {
      const unit = state.quantityUnits.find(entry => entry.id === row.dataset.unitId);
      const label = name.value.trim();
      const duplicate = state.quantityUnits.some(entry => entry.id !== unit.id && entry.label.toLocaleLowerCase() === label.toLocaleLowerCase());
      if (!label || duplicate) {
        name.value = unit.label;
        document.querySelector('#adminUnitError').textContent = duplicate ? 'That quantity type already exists.' : 'Quantity type names cannot be empty.';
        return;
      }
      unit.label = label;
      saveState(); openAdmin();
    });
    remove.addEventListener('click', () => {
      if (state.quantityUnits.find(unit => unit.id === row.dataset.unitId)?.locked) return;
      state.quantityUnits = state.quantityUnits.filter(unit => unit.id !== row.dataset.unitId);
      state.items.forEach(item => { if (item.unit === row.dataset.unitId) item.unit = 'item'; });
      saveState(); openAdmin();
    });
  });
}
function openAccountsAdmin() {
  document.querySelector('#adminAccountError').textContent = '';
  document.querySelector('#adminAccounts').innerHTML = appState.accounts.length ? appState.accounts.map((account, index) => `<div class="account-row" data-account-index="${index}"><label class="account-selection"><input type="checkbox" ${account.selected ? 'checked' : ''}><span>Can sign in</span></label><input value="${escapeAttribute(account.name)}" maxlength="120" aria-label="Account name"><button type="button" aria-label="Delete ${escapeAttribute(account.name)} account">×</button></div>`).join('') : '<p class="guest-empty">No guest accounts yet.</p>';
  document.querySelectorAll('.account-row').forEach(row => {
    const [selection, name, remove] = row.children;
    selection.querySelector('input').addEventListener('change', event => {
      appState.accounts[Number(row.dataset.accountIndex)].selected = event.target.checked;
      if (!event.target.checked && guestName === appState.accounts[Number(row.dataset.accountIndex)].name) guestName = '';
      saveState();
    });
    name.addEventListener('change', () => renameAccount(Number(row.dataset.accountIndex), name));
    remove.addEventListener('click', () => {
      const [removed] = appState.accounts.splice(Number(row.dataset.accountIndex), 1);
      Object.values(appState.events).forEach(eventState => {
        eventState.items.forEach(item => { item.claims = item.claims.filter(name => name !== removed.name); });
        eventState.rsvps = eventState.rsvps.filter(rsvp => rsvp.name !== removed.name);
      });
      if (guestName === removed.name) guestName = '';
      saveState(); openAccountsAdmin(); showToast('Account removed.');
    });
  });
  const dialog = document.querySelector('#accountsDialog'); if (!dialog.open) dialog.showModal();
}
function renameAccount(index, input) {
  const oldName = appState.accounts[index]?.name;
  const newName = input.value.trim();
  const duplicate = appState.accounts.some((account, accountIndex) => accountIndex !== index && normalizeAccountName(account.name) === normalizeAccountName(newName));
  if (!newName || duplicate) {
    input.value = oldName || '';
    document.querySelector('#adminAccountError').textContent = duplicate ? 'That account already exists.' : 'Account names cannot be empty.';
    return;
  }
  appState.accounts[index].name = newName;
  Object.values(appState.events).forEach(eventState => {
    eventState.items.forEach(item => { item.claims = item.claims.map(name => name === oldName ? newName : name); });
    eventState.rsvps.forEach(rsvp => { if (rsvp.name === oldName) rsvp.name = newName; });
  });
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
function openEventsAdmin() {
  document.querySelector('#eventChoices').innerHTML = Object.entries(EVENT_DETAILS).map(([id, event]) => {
    const active = id === appState.activeEventId;
    const date = new Date(`${appState.events[id].eventDate}T12:00:00`);
    const formatted = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
    return `<div class="event-choice"><div><strong>${event.name}</strong><span>${formatted}${active ? ' · Visible to guests' : ' · Hidden'}</span></div><button type="button" data-activate-event="${id}" ${active ? 'disabled' : ''}>${active ? 'Active' : 'Activate'}</button></div>`;
  }).join('');
  document.querySelectorAll('[data-activate-event]').forEach(button => button.addEventListener('click', () => {
    appState.events[appState.activeEventId] = state;
    appState.activeEventId = button.dataset.activateEvent;
    state = appState.events[appState.activeEventId];
    guestName = '';
    saveState();
    openEventsAdmin();
    showToast(`${EVENT_DETAILS[appState.activeEventId].name} is now live.`);
  }));
  const dialog = document.querySelector('#eventsDialog');
  if (!dialog.open) dialog.showModal();
}
document.querySelector('#manageEventsButton').addEventListener('click', () => { document.querySelector('#hostToolsDialog').close(); openEventsAdmin(); });
document.querySelector('#editItemsButton').addEventListener('click', () => { document.querySelector('#hostToolsDialog').close(); openAdmin(); });
document.querySelector('#editAccountsButton').addEventListener('click', () => { document.querySelector('#hostToolsDialog').close(); openAccountsAdmin(); });
document.querySelector('#adminAddAccountButton').addEventListener('click', () => {
  const input = document.querySelector('#adminNewAccount');
  const name = input.value.trim();
  if (!name) { document.querySelector('#adminAccountError').textContent = 'Enter a last name.'; return; }
  if (appState.accounts.some(account => normalizeAccountName(account.name) === normalizeAccountName(name))) { document.querySelector('#adminAccountError').textContent = 'That account already exists.'; return; }
  appState.accounts.push({ name, selected: false }); input.value = ''; saveState(); openAccountsAdmin(); showToast(`${householdDisplayName(name)} account added. Enable it to allow sign-in.`);
});
document.querySelector('#adminEventDate').addEventListener('change', event => { if (!event.target.value) return; state.eventDate = event.target.value; state.accountSelectionResetFor = ''; saveState(); showToast('Event date updated.'); });
document.querySelector('#adminAddUnitButton').addEventListener('click', () => {
  const input = document.querySelector('#adminNewUnitName');
  const label = input.value.trim();
  if (!label) { document.querySelector('#adminUnitError').textContent = 'Enter a quantity type name.'; return; }
  if (state.quantityUnits.some(unit => unit.label.toLocaleLowerCase() === label.toLocaleLowerCase())) { document.querySelector('#adminUnitError').textContent = 'That quantity type already exists.'; return; }
  state.quantityUnits.push({ id: `unit-${Date.now()}`, label });
  input.value = ''; saveState(); openAdmin();
});
document.querySelector('#adminAddButton').addEventListener('click', () => {
  const name = document.querySelector('#adminNewItem').value.trim(); if (!name) return;
  const amount = document.querySelector('#adminNewAmount').value;
  const unit = document.querySelector('#adminNewUnit').value;
  state.items.push({ id: `host-${Date.now()}`, name, category: document.querySelector('#adminNewCategory').value, needed: amount === 'optional' ? 1 : Number(amount), optional: amount === 'optional', unit, claims: [] });
  document.querySelector('#adminNewItem').value = ''; saveState(); openAdmin();
});

render();
singleColumnMenu.addEventListener('change', render);
setTimeout(() => document.querySelector('#passwordDialog').showModal(), 450);
