import test from 'node:test';
import assert from 'node:assert/strict';
import { getAssignedPhones, getWhatsappNumber } from './storeContacts.js';

test('getAssignedPhones returns both assigned numbers in order', function () {
  assert.deepEqual(
    getAssignedPhones({ phone: '+213 555 000 001', phone2: '+213 555 000 002' }),
    ['+213 555 000 001', '+213 555 000 002'],
  );
});

test('getAssignedPhones hides unassigned and blank numbers', function () {
  assert.deepEqual(getAssignedPhones({ phone: '', phone2: null }), []);
  assert.deepEqual(getAssignedPhones({ phone: '   ', phone2: '  ' }), []);
  assert.deepEqual(getAssignedPhones({ phone: '+213 555 000 001', phone2: '' }), ['+213 555 000 001']);
  assert.deepEqual(getAssignedPhones(null), []);
});

test('getWhatsappNumber only returns an assigned WhatsApp number', function () {
  assert.equal(getWhatsappNumber({ whatsapp: ' +213 555 000 003 ' }), '+213 555 000 003');
  assert.equal(getWhatsappNumber({ phone: '+213 555 000 001' }), '');
  assert.equal(getWhatsappNumber(null), '');
});
