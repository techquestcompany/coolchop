"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const normalizeOrderItems = require("../utils/normalizeOrderItems");
const createPaystackHttpError = require("../utils/paystackHttpError");

test("order items accepts arrays and JSON-encoded arrays", () => {
  const items = [{ id: 3, quantity: 2 }];

  assert.deepEqual(normalizeOrderItems(items), items);
  assert.deepEqual(normalizeOrderItems(JSON.stringify(items)), items);
  assert.deepEqual(normalizeOrderItems(JSON.stringify(JSON.stringify(items))), items);
});

test("order items accepts wrapped and single-item legacy values", () => {
  const items = [{ id: 3, quantity: 2 }];

  assert.deepEqual(normalizeOrderItems({ items }), items);
  assert.deepEqual(normalizeOrderItems({ id: 3, quantity: 2 }), items);
});

test("order items ignores malformed records and invalid item entries", () => {
  assert.deepEqual(normalizeOrderItems("not-json"), []);
  assert.deepEqual(normalizeOrderItems({ unexpected: true }), []);
  assert.deepEqual(
    normalizeOrderItems([
      { id: 3, quantity: 2 },
      { id: "bad-id", quantity: 1 },
      { id: 4, quantity: 0 },
      null,
    ]),
    [{ id: 3, quantity: 2 }]
  );
});

test("Paystack authorization failures are classified without exposing credentials", () => {
  const error = createPaystackHttpError(401);

  assert.equal(error.code, "PAYSTACK_UNAUTHORIZED");
  assert.equal(error.statusCode, 401);
  assert.match(error.message, /configured secret key/);
  assert.doesNotMatch(error.message, /sk_(test|live)_/);
});