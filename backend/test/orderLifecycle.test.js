"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  isRestaurantTransitionAllowed,
  isRiderTransitionAllowed,
} = require("../utils/orderLifecycle");

test("restaurant can mark a preparing order ready for pickup", () => {
  assert.equal(isRestaurantTransitionAllowed("preparing", "ready_for_pickup"), true);
  assert.equal(isRestaurantTransitionAllowed("preparing", "on_delivery"), false);
  assert.equal(isRestaurantTransitionAllowed("ready_for_pickup", "delivered"), false);
});

test("rider delivery statuses must follow pickup and delivery order", () => {
  assert.equal(isRiderTransitionAllowed("ready_for_pickup", "on_delivery"), true);
  assert.equal(isRiderTransitionAllowed("on_delivery", "delivered"), true);
  assert.equal(isRiderTransitionAllowed("preparing", "on_delivery"), false);
  assert.equal(isRiderTransitionAllowed("ready_for_pickup", "delivered"), false);
});