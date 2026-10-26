import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDzd } from './money.js';

test('formatDzd formats numbers and numeric strings', function () {
  assert.equal(formatDzd(1234.5), '1234.50 DZD');
  assert.equal(formatDzd('99'), '99.00 DZD');
});

test('formatDzd falls back to zero for invalid values', function () {
  assert.equal(formatDzd(null), '0.00 DZD');
  assert.equal(formatDzd('abc'), '0.00 DZD');
});
