import {
  buildCheckoutPayload,
  normalizeCustomerOrders,
} from "../orderContracts";

describe("customer order API contract", () => {
  it("normalizes the current wrapped response and JSON-encoded items", () => {
    const orders = normalizeCustomerOrders({
      orders: [{
        id: 8,
        orderNumber: "ORD-8",
        items: JSON.stringify([{ id: "4", quantity: "2" }]),
        totalAmount: "25.5",
        status: "pending",
      }],
      totalOrders: 1,
    });

    expect(orders[0].items).toEqual([{ id: 4, quantity: 2 }]);
    expect(orders[0].totalAmount).toBe(25.5);
  });

  it("continues to accept legacy array responses and malformed item values", () => {
    const orders = normalizeCustomerOrders([
      { id: 9, items: "not-json", totalAmount: 0, status: "pending" },
    ]);

    expect(orders[0].items).toEqual([]);
  });

  it("rejects unexpected order response shapes", () => {
    expect(() => normalizeCustomerOrders({ data: [] })).toThrow(
      "Unexpected orders response from server"
    );
  });
});

describe("checkout payload", () => {
  it("uses the nested dish ID and normalizes quantities and notes", () => {
    expect(buildCheckoutPayload(
      [{ id: 99, Dish: { id: "7" }, quantity: "2" }],
      ["No onions", "extra"]
    )).toEqual({
      items: [{ id: 7, quantity: 2 }],
      note: "No onions",
    });
  });

  it("rejects empty or invalid carts before sending a payment request", () => {
    expect(() => buildCheckoutPayload([], undefined)).toThrow(
      "Your cart contains no valid items to check out."
    );
    expect(() => buildCheckoutPayload([{ id: 1, quantity: 100 }], undefined)).toThrow(
      "Your cart contains no valid items to check out."
    );
  });
});