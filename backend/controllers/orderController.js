const { Order, Dish, Transaction, sequelize } = require("../models");

const ORDER_STATUSES = new Set(["preparing", "on_delivery", "delivered", "cancelled"]);
const RESTAURANT_TRANSITIONS = {
  preparing: "on_delivery",
  on_delivery: "delivered",
};

const orderItems = (order) =>
  Array.isArray(order.items) ? order.items : JSON.parse(order.items);

const isAdmin = (user) => user.isAdmin === true;

const withDishDetails = async (order) => {
  const items = orderItems(order);
  const dishes = await Dish.findAll({
    where: { id: items.map((item) => Number(item.id)) },
  });
  const dishesById = new Map(dishes.map((dish) => [Number(dish.id), dish]));

  return {
    ...order.toJSON(),
    items: items.map((item) => {
      const dish = dishesById.get(Number(item.id));
      return dish
        ? {
            id: dish.id,
            dishName: dish.dishName,
            price: dish.price,
            quantity: Number(item.quantity),
          }
        : { id: Number(item.id), quantity: Number(item.quantity), unavailable: true }
    }),
  };
};

exports.getAllOrders = async (req, res) => {
  try {
    const where = isAdmin(req.user) ? {} : { userId: req.user.id };
    const orders = await Order.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });
    const detailedOrders = await Promise.all(orders.map(withDishDetails));
    return res.status(200).json(detailedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    return res.status(500).json({ message: "Error fetching orders" });
  }
};

exports.getRestaurantOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { status: ["preparing", "on_delivery"] },
      order: [["createdAt", "DESC"]],
    });
    const itemIds = [
      ...new Set(orders.flatMap((order) => orderItems(order).map((item) => Number(item.id)))),
    ];
    const dishes = await Dish.findAll({
      where: { id: itemIds, restaurantId: req.user.id },
    });
    const ownedDishIds = new Set(dishes.map((dish) => Number(dish.id)));

    const restaurantOrders = orders.filter((order) => {
      const items = orderItems(order);
      return items.length > 0 && items.every((item) => ownedDishIds.has(Number(item.id)));
    });
    const detailedOrders = await Promise.all(restaurantOrders.map(withDishDetails));
    return res.status(200).json(
      detailedOrders.map(({ reference, userId, ...order }) => order)
    );
  } catch (error) {
    console.error("Error fetching restaurant orders:", error.message);
    return res.status(500).json({ message: "Error fetching restaurant orders" });
  }
};

exports.getOrderById = async (req, res) => {
  const orderId = Number(req.params.orderId);
  if (!Number.isInteger(orderId) || orderId < 1) {
    return res.status(400).json({ message: "A valid order ID is required" });
  }

  try {
    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!isAdmin(req.user) && req.user.role !== "customer") {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    if (!isAdmin(req.user) && order.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    return res.status(200).json(await withDishDetails(order));
  } catch (error) {
    console.error("Error fetching order:", error.message);
    return res.status(500).json({ message: "Error fetching order" });
  }
};

exports.updateOrder = async (req, res) => {
  const orderId = Number(req.params.orderId);
  const { status } = req.body;
  if (!Number.isInteger(orderId) || orderId < 1 || !ORDER_STATUSES.has(status)) {
    return res.status(400).json({ message: "A valid order ID and status are required" });
  }
  if (Object.keys(req.body).some((key) => key !== "status")) {
    return res.status(400).json({ message: "Only the order status can be changed" });
  }

  try {
    const result = await sequelize.transaction(async (transaction) => {
      const order = await Order.findByPk(orderId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!order) return { notFound: true };

      const admin = isAdmin(req.user);
      const restaurant = req.user.role === "restaurant";
      if (!admin && !restaurant && order.userId !== req.user.id) {
        return { forbidden: true };
      }

      if (restaurant) {
        if (RESTAURANT_TRANSITIONS[order.status] !== status) {
          return { invalidTransition: true };
        }
        const items = orderItems(order);
        const dishIds = [...new Set(items.map((item) => Number(item.id)))];
        const dishes = await Dish.findAll({
          where: {
            id: dishIds,
            restaurantId: req.user.id,
          },
          transaction,
        });
        if (dishIds.length === 0 || dishes.length !== dishIds.length) {
          return { forbidden: true };
        }
      } else if (!admin) {
        if (req.user.role !== "customer") return { forbidden: true };
        if (
          status !== "cancelled" ||
          order.status !== "pending" ||
          order.reference
        ) {
          return { invalidTransition: true };
        }
      }

      if (status === "cancelled") {
        const successfulPayment = await Transaction.findOne({
          where: { orderId: order.id, status: "success" },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (successfulPayment) return { paymentAlreadySucceeded: true };
      }

      order.status = status;
      await order.save({ transaction });
      return { order };
    });

    if (result.notFound) return res.status(404).json({ message: "Order not found" });
    if (result.forbidden) return res.status(403).json({ message: "Unauthorized" });
    if (result.paymentAlreadySucceeded) {
      return res.status(409).json({ message: "A paid order cannot be cancelled" });
    }
    if (result.invalidTransition) {
      return res.status(409).json({ message: "Order status cannot be changed to that value" });
    }
    return res.status(200).json({ message: "Order updated successfully", order: result.order });
  } catch (error) {
    console.error("Error updating order:", error.message);
    return res.status(500).json({ message: "Error updating order" });
  }
};

exports.deleteOrder = async (req, res) => {
  const orderId = Number(req.params.orderId);
  if (!Number.isInteger(orderId) || orderId < 1) {
    return res.status(400).json({ message: "A valid order ID is required" });
  }

  try {
    const result = await sequelize.transaction(async (transaction) => {
      const order = await Order.findByPk(orderId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!order) return { notFound: true };
      if (
        !isAdmin(req.user) &&
        (req.user.role !== "customer" ||
          order.userId !== req.user.id ||
          order.status !== "pending" ||
          order.reference)
      ) {
        return { forbidden: true };
      }
      if (order.reference) return { forbidden: true };
      await order.destroy({ transaction });
      return { deleted: true };
    });

    if (result.notFound) return res.status(404).json({ message: "Order not found" });
    if (result.forbidden) return res.status(403).json({ message: "Unauthorized" });
    return res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error.message);
    return res.status(500).json({ message: "Error deleting order" });
  }
};
