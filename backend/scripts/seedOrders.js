"use strict";

const { Op } = require("sequelize");
const { Order, User, Dish, sequelize } = require("../models");

const fixtures = [
  {
    orderNumber: "SEED-ORD-001",
    status: "pending",
    ageHours: 1,
    note: "Sample pending order",
    items: [[0, 1]],
  },
  {
    orderNumber: "SEED-ORD-002",
    status: "preparing",
    ageHours: 2,
    note: "Please package the drinks separately",
    items: [[0, 2], [1, 1]],
  },
  {
    orderNumber: "SEED-ORD-003",
    status: "on_delivery",
    ageHours: 4,
    note: "Call on arrival",
    items: [[1, 1], [2, 2]],
  },
  {
    orderNumber: "SEED-ORD-004",
    status: "delivered",
    ageHours: 28,
    note: null,
    items: [[0, 1], [2, 1]],
  },
  {
    orderNumber: "SEED-ORD-005",
    status: "cancelled",
    ageHours: 52,
    note: "Sample cancelled order",
    items: [[1, 1]],
  },
];

const parseArgs = () => {
  const args = process.argv.slice(2);
  const confirm = args.includes("--confirm");
  const positionalArgs = args.filter((arg) => arg !== "--confirm");

  if (
    positionalArgs.length > 1 ||
    positionalArgs.some((arg) => !/^\d+$/.test(arg))
  ) {
    throw new Error(
      "Usage: npm run seed:orders -- --confirm [customer-id]"
    );
  }

  const customerId = positionalArgs.length ? Number(positionalArgs[0]) : null;
  if (customerId !== null && (!Number.isSafeInteger(customerId) || customerId < 1)) {
    throw new Error("customer-id must be a positive integer.");
  }

  if (!confirm) {
    throw new Error(
      "No data was changed. Confirm you are using a development database with: " +
        "npm run seed:orders -- --confirm [customer-id]"
    );
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed orders when NODE_ENV is production.");
  }

  return customerId;
};

const buildItems = (dishIndexes, dishes) => {
  const quantitiesByDishId = new Map();
  for (const [dishIndex, quantity] of dishIndexes) {
    const dish = dishes[dishIndex % dishes.length];
    quantitiesByDishId.set(
      Number(dish.id),
      (quantitiesByDishId.get(Number(dish.id)) || 0) + quantity
    );
  }

  return [...quantitiesByDishId].map(([id, quantity]) => ({ id, quantity }));
};

const run = async () => {
  const customerId = parseArgs();
  await sequelize.authenticate();

  const customer = customerId
    ? await User.findOne({ where: { id: customerId, role: "customer" } })
    : await User.findOne({
        where: { role: "customer" },
        order: [["id", "ASC"]],
      });

  if (!customer) {
    throw new Error(
      customerId
        ? `No customer with ID ${customerId} was found.`
        : "No customer account exists. Create a customer before seeding orders."
    );
  }

  const availableDishes = await Dish.findAll({
    attributes: ["id", "price", "restaurantId"],
    order: [["id", "ASC"]],
  });
  if (availableDishes.length === 0) {
    throw new Error("No dishes exist. Add at least one dish before seeding orders.");
  }

  const dishesByRestaurant = new Map();
  for (const dish of availableDishes) {
    const restaurantId = Number(dish.restaurantId);
    if (!dishesByRestaurant.has(restaurantId)) {
      dishesByRestaurant.set(restaurantId, []);
    }
    dishesByRestaurant.get(restaurantId).push(dish);
  }
  const sampleDishes = [...dishesByRestaurant.values()].sort(
    (left, right) => right.length - left.length
  )[0];

  const transaction = await sequelize.transaction();
  try {
    const existingOrders = await Order.findAll({
      attributes: ["orderNumber"],
      where: {
        orderNumber: { [Op.in]: fixtures.map(({ orderNumber }) => orderNumber) },
      },
      transaction,
    });
    const existingOrderNumbers = new Set(
      existingOrders.map(({ orderNumber }) => orderNumber)
    );
    const createdOrders = [];

    for (const fixture of fixtures) {
      if (existingOrderNumbers.has(fixture.orderNumber)) continue;

      const items = buildItems(fixture.items, sampleDishes);
      const totalAmount = items.reduce((total, item) => {
        const dish = sampleDishes.find(({ id }) => Number(id) === item.id);
        return total + Number(dish.price) * item.quantity;
      }, 0);
      const createdAt = new Date(Date.now() - fixture.ageHours * 60 * 60 * 1000);
      const order = await Order.create(
        {
          orderNumber: fixture.orderNumber,
          userId: customer.id,
          items,
          totalAmount: Number(totalAmount.toFixed(2)),
          status: fixture.status,
          note: fixture.note,
          createdAt,
          updatedAt: createdAt,
        },
        { transaction }
      );
      createdOrders.push(order.orderNumber);
    }

    await transaction.commit();
    console.log(
      createdOrders.length
        ? `Created ${createdOrders.length} sample orders for customer ${customer.id}: ${createdOrders.join(", ")}`
        : "Sample orders already exist; nothing was created."
    );
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

run()
  .catch((error) => {
    console.error("Order seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
