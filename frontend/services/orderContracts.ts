export interface CustomerOrderItem {
  id: number;
  quantity: number;
  dishName?: string;
  price?: number | string;
  profileImage?: string | null;
  unavailable?: boolean;
}

export interface CustomerOrder {
  id: number;
  orderNumber: string;
  items: CustomerOrderItem[];
  totalAmount: number;
  status: string;
  reference?: string | null;
}

export interface CheckoutCartItem {
  id?: number | string;
  Dish?: { id?: number | string };
  quantity: number | string;
}

export interface CheckoutPayload {
  items: { id: number; quantity: number }[];
  note: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const normalizeOrderItems = (value: unknown): CustomerOrderItem[] => {
  let items = value;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch {
        return [];
      }
      continue;
    }

    if (Array.isArray(items)) break;
    if (isRecord(items) && items.items !== undefined) {
      items = items.items;
      continue;
    }
    if (isRecord(items) && items.id !== undefined) {
      items = [items];
      break;
    }
    return [];
  }

  if (!Array.isArray(items)) return [];

  return items
    .filter((item) =>
      isRecord(item) &&
      Number.isInteger(Number(item.id)) &&
      Number(item.id) > 0 &&
      Number.isInteger(Number(item.quantity)) &&
      Number(item.quantity) > 0
    )
    .map((item) => ({
      ...item,
      id: Number(item.id),
      quantity: Number(item.quantity),
    }));
};

export const normalizeCustomerOrders = (response: unknown): CustomerOrder[] => {
  const orders = Array.isArray(response)
    ? response
    : isRecord(response) && Array.isArray(response.orders)
      ? response.orders
      : null;

  if (!orders) throw new Error("Unexpected orders response from server");

  return orders.filter(isRecord).map((order) => ({
    ...order,
    id: Number(order.id),
    orderNumber: String(order.orderNumber ?? order.id),
    items: normalizeOrderItems(order.items),
    totalAmount: Number(order.totalAmount) || 0,
    status: String(order.status ?? "unknown"),
  }));
};

export const buildCheckoutPayload = (
  cartItems: CheckoutCartItem[],
  note?: string | string[]
): CheckoutPayload => {
  const items = cartItems.map((item) => ({
    id: Number(item.Dish?.id ?? item.id),
    quantity: Number(item.quantity),
  }));

  if (
    items.length === 0 ||
    items.some(
      (item) =>
        !Number.isInteger(item.id) ||
        item.id < 1 ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 99
    )
  ) {
    throw new Error("Your cart contains no valid items to check out.");
  }

  return {
    items,
    note: (Array.isArray(note) ? note[0] : note) || "Checkout from mobile app",
  };
};