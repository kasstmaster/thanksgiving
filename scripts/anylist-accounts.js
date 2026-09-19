function clean(value) { return String(value ?? '').trim().replace(/\s+/g, ' '); }
function key(value) { return clean(value).toLocaleLowerCase('en-US'); }

export function categoryHouseholds(categoryName) {
  return clean(categoryName).split(/\s+-\s+/, 1)[0].split('/').map(clean).filter(Boolean);
}

export function convertCategory(categoryName, items) {
  const householdNames = categoryHouseholds(categoryName);
  const households = householdNames.map(lastName => ({ lastName, people: [] }));
  const skipped = [];
  for (const item of items) {
    // Deliberately read only the structured item name. notes/details are never candidates.
    const fullName = clean(item?.name);
    const matches = householdNames
      .map((lastName, index) => ({ lastName, index }))
      .filter(({ lastName }) => key(fullName).endsWith(` ${key(lastName)}`));
    if (matches.length !== 1) { skipped.push(fullName || '(unnamed item)'); continue; }
    const match = matches[0];
    const givenName = clean(fullName.slice(0, fullName.length - match.lastName.length));
    if (!givenName || /[,/]/.test(givenName)) { skipped.push(fullName); continue; }
    // Keep the person's spelling/capitalization rather than replacing it with the header hint.
    const displayedLastName = clean(fullName.slice(fullName.length - match.lastName.length));
    households[match.index].lastName = displayedLastName;
    households[match.index].people.push(givenName);
  }
  const populated = households.filter(household => household.people.length);
  return {
    account: populated.length ? populated.map(({ lastName, people }) => `${people.join(',')} ${lastName}`).join('/') : null,
    skipped
  };
}

export function normalizedAccountPeople(accountName) {
  const people = clean(accountName).split('/').flatMap(part => {
    const household = clean(part);
    const boundary = household.lastIndexOf(' ');
    if (boundary < 1) return [key(household)];
    const lastName = clean(household.slice(boundary + 1));
    return household.slice(0, boundary).split(',').map(first => key(`${clean(first)} ${lastName}`));
  }).filter(Boolean);
  return [...new Set(people)].sort().join('|');
}

export function addMissingAccounts(state, convertedAccounts) {
  const existing = new Set(state.accounts.map(account => normalizedAccountPeople(account.name)));
  const added = [];
  for (const name of convertedAccounts) {
    const normalized = normalizedAccountPeople(name);
    if (!normalized || existing.has(normalized)) continue;
    state.accounts.push({ name, selected: false });
    existing.add(normalized);
    added.push(name);
  }
  return added;
}
