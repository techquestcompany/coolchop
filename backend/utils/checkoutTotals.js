"use strict";

const calculateCheckoutTotals = (subtotalMinorUnits) => {
  if (!Number.isSafeInteger(subtotalMinorUnits) || subtotalMinorUnits < 0) {
    throw new TypeError("Checkout subtotal must be a non-negative safe integer.");
  }

  const serviceChargeMinorUnits = Number(
    (BigInt(subtotalMinorUnits) * 3n + 50n) / 100n
  );
  const totalMinorUnits = subtotalMinorUnits + serviceChargeMinorUnits;

  if (!Number.isSafeInteger(totalMinorUnits)) {
    throw new RangeError("Checkout total exceeds the supported amount.");
  }

  return {
    subtotalMinorUnits,
    serviceChargeMinorUnits,
    totalMinorUnits,
  };
};

module.exports = calculateCheckoutTotals;
