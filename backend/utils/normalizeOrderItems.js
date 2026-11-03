const normalizeOrderItems = (value) => {
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

    if (items && typeof items === "object") {
      if (items.items !== undefined) {
        items = items.items;
        continue;
      }
      if ("id" in items) {
        items = [items];
        break;
      }
    }

    return [];
  }

  if (!Array.isArray(items)) return [];

  return items
    .filter((item) =>
      item &&
      typeof item === "object" &&
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

module.exports = normalizeOrderItems;