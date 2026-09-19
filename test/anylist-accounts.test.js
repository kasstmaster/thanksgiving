import test from 'node:test';
import assert from 'node:assert/strict';
import { addMissingAccounts, convertCategory } from '../scripts/anylist-accounts.js';

test('converts three households in category order and ignores notes', () => {
  const result = convertCategory('SYSWERDA / HEIL / STEGALL - 2897 Panzl St, Muskegon MI 49444', [
    { name: 'Eric Syswerda' }, { name: 'Vandy Syswerda' }, { name: 'Danielle Syswerda' },
    { name: 'Ian Heil' }, { name: 'Lexi Heil', notes: 'Sheridan' }, { name: 'Vanden Stegall' }
  ]);
  assert.equal(result.account, 'Eric,Vandy,Danielle Syswerda/Ian,Lexi Heil/Vanden Stegall');
  assert.doesNotMatch(result.account, /Sheridan/);
});

test('ignores a note and category address', () => {
  const result = convertCategory('SYLVESTRE / BENJAMIN - PO Box 89, 39 Heidt Place, Dillon SK', [
    { name: 'Buddy Sylvestre' }, { name: 'Deandra Benjamin', notes: 'Briette' }
  ]);
  assert.equal(result.account, 'Buddy Sylvestre/Deandra Benjamin');
  assert.doesNotMatch(result.account, /Briette|PO Box/);
});

test('converts one-person household', () => assert.equal(convertCategory('RAUDMAN', [{ name: 'Buddy Raudman' }]).account, 'Buddy Raudman'));

test('normalized people prevent spacing and case duplicates', () => {
  const state = { accounts: [{ name: 'Josh,Julie,Aiden Wickendoll', selected: false }] };
  assert.deepEqual(addMissingAccounts(state, [' josh, Julie, Aiden  WICKENDOLL ']), []);
  assert.equal(state.accounts.length, 1);
});

test('duplicate leaves enabled existing record untouched', () => {
  const original = { name: 'Josh,Julie,Aiden Wickendoll', selected: true, extra: 'preserved' };
  const state = { accounts: [original] };
  assert.deepEqual(addMissingAccounts(state, ['Josh, Julie, Aiden Wickendoll']), []);
  assert.strictEqual(state.accounts[0], original);
  assert.equal(state.accounts[0].selected, true);
});

test('ambiguous items are skipped rather than guessed', () => {
  const result = convertCategory('SMITH / JONES', [{ name: 'Prince' }, { name: 'Alex Smith' }]);
  assert.equal(result.account, 'Alex Smith');
  assert.deepEqual(result.skipped, ['Prince']);
});
