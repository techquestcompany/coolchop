const RESTAURANT_TRANSITIONS = {
  preparing: "ready_for_pickup",
};

const RIDER_TRANSITIONS = {
  ready_for_pickup: "on_delivery",
  on_delivery: "delivered",
};

exports.isRestaurantTransitionAllowed = (currentStatus, nextStatus) =>
  RESTAURANT_TRANSITIONS[currentStatus] === nextStatus;

exports.isRiderTransitionAllowed = (currentStatus, nextStatus) =>
  RIDER_TRANSITIONS[currentStatus] === nextStatus;