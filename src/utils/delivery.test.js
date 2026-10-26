import test from 'node:test';
import assert from 'node:assert/strict';
import { pickBestDeliveryOption } from './delivery.js';

var options = [
  {
    deliveryCompanyId: 1,
    deliveryCompanyName: 'Cheap',
    methods: [
      { type: 'home_delivery', price: 800 },
      { type: 'desk_delivery', price: 700 },
    ],
  },
  {
    deliveryCompanyId: 2,
    deliveryCompanyName: 'Expensive',
    methods: [
      { type: 'home_delivery', price: 900 },
      { type: 'desk_delivery', price: 750 },
    ],
  },
];

test('selects the highest price for the requested delivery type', function () {
  var home = pickBestDeliveryOption(options, 'home_delivery');
  assert.equal(home.option.deliveryCompanyId, 2);
  assert.equal(home.method.price, 900);

  var desk = pickBestDeliveryOption(options, 'desk_delivery');
  assert.equal(desk.option.deliveryCompanyId, 2);
  assert.equal(desk.method.price, 750);
});

test('does not compare other delivery types when the requested type exists', function () {
  var mixed = [
    { deliveryCompanyId: 1, methods: [{ type: 'home_delivery', price: 500 }] },
    { deliveryCompanyId: 2, methods: [{ type: 'desk_delivery', price: 1200 }] },
  ];
  var result = pickBestDeliveryOption(mixed, 'home_delivery');
  assert.equal(result.option.deliveryCompanyId, 1);
  assert.equal(result.method.type, 'home_delivery');
});

test('falls back to an available type only when the requested type is missing', function () {
  var onlyDesk = [
    { deliveryCompanyId: 1, methods: [{ type: 'desk_delivery', price: 650 }] },
    { deliveryCompanyId: 2, methods: [{ type: 'desk_delivery', price: 700 }] },
  ];
  var result = pickBestDeliveryOption(onlyDesk, 'home_delivery');
  assert.equal(result.option.deliveryCompanyId, 2);
  assert.equal(result.method.type, 'desk_delivery');
});

test('uses the lower company id when prices are equal', function () {
  var equal = [
    { deliveryCompanyId: 8, methods: [{ type: 'home_delivery', price: 900 }] },
    { deliveryCompanyId: 3, methods: [{ type: 'home_delivery', price: 900 }] },
  ];
  assert.equal(pickBestDeliveryOption(equal, 'home_delivery').option.deliveryCompanyId, 3);
});
