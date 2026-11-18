"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const calculateCheckoutTotals = require("../utils/checkoutTotals");

test("checkout totals include a rounded 3 percent charge", () => {
  assert.deepEqual(calculateCheckoutTotals(10000), {
    subtotalMinorUnits: 10000,
    serviceChargeMinorUnits: 300,
    totalMinorUnits: 10300,
  });
  assert.deepEqual(calculateCheckoutTotals(101), {
    subtotalMinorUnits: 101,
    serviceChargeMinorUnits: 3,
    totalMinorUnits: 104,
  });
});

test("checkout totals reject invalid or overflowing amounts", () => {
  assert.throws(() => calculateCheckoutTotals(-1), /non-negative/);
  assert.throws(() => calculateCheckoutTotals(1.5), /non-negative/);
  assert.throws(
    () => calculateCheckoutTotals(Number.MAX_SAFE_INTEGER),
    /supported amount/
  );
});
