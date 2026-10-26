import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addItemToCart,
  cartItemCount,
  cartSubtotal,
  cartHasUnavailableItems,
  removeItemFromCart,
  sanitizeCartItems,
  updateItemQuantity,
} from './cart.js';

function product(overrides) {
  return {
    id: 1,
    name: 'Product',
    slug: 'product',
    price: '100.00',
    quantity: 5,
    adminId: 10,
    ...overrides,
  };
}

test('adds a product and merges duplicate lines', function () {
  var first = addItemToCart([], product(), 2);
  assert.equal(first.items.length, 1);
  assert.equal(first.items[0].quantity, 2);

  var second = addItemToCart(first.items, product({ stock: undefined }), 1);
  assert.equal(second.items.length, 1);
  assert.equal(second.items[0].quantity, 3);
});

test('caps quantities at available stock', function () {
  var result = addItemToCart([], product({ quantity: 4 }), 10);
  assert.equal(result.items[0].quantity, 4);
  assert.equal(result.error, null);

  var updated = updateItemQuantity(result.items, 1, 99);
  assert.equal(updated.items[0].quantity, 4);
  assert.equal(updated.error, 'maxStock');
});

test('rejects out of stock products and mixed stores', function () {
  var outOfStock = addItemToCart([], product({ quantity: 0 }), 1);
  assert.equal(outOfStock.error, 'outOfStock');
  assert.equal(outOfStock.items.length, 0);

  var first = addItemToCart([], product(), 1);
  var otherStore = addItemToCart(first.items, product({ id: 2, adminId: 11 }), 1);
  assert.equal(otherStore.error, 'differentStore');
  assert.equal(otherStore.items.length, 1);
});

test('prevents invalid quantities and removes items', function () {
  var result = addItemToCart([], product(), 2);
  var invalid = updateItemQuantity(result.items, 1, 0);
  assert.equal(invalid.error, 'invalidQuantity');
  assert.equal(invalid.items[0].quantity, 2);

  var removed = removeItemFromCart(result.items, 1);
  assert.equal(removed.length, 0);
});

test('calculates count and subtotal without unavailable items', function () {
  var items = sanitizeCartItems([
    { productId: 1, name: 'A', price: 10, quantity: 2, stock: 5, available: true },
    { productId: 2, name: 'B', price: 7.5, quantity: 3, stock: 3, available: false },
  ]);
  assert.equal(cartItemCount(items), 5);
  assert.equal(cartSubtotal(items), 20);
  assert.equal(cartHasUnavailableItems(items), true);
});
