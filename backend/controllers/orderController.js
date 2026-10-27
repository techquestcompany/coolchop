
const { Order, Dish, Transaction,User, sequelize } = require("../models");

const ORDER_STATUSES = new Set(["preparing", "on_delivery", "delivered", "cancelled"]);
const RESTAURANT_TRANSITIONS = {
  preparing: "on_delivery",
  on_delivery: "delivered",
}
const getAddressFromCoords = require("../utils/getAddressFromCoords");

// CREATE ORDER
exports.createOrder = async (req, res) => {
  const userId = req.user.id; // ⭐ From token middleware
  const { items, note } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Items are required' });
  }

  try {
    // Calculate total amount based on item prices
    let totalAmount = 0;
    for (const item of items) {
      const dish = await Dish.findByPk(item.id);
      if (!dish) {
        return res.status(400).json({ message: `Dish with ID ${item.id} not found` });
      }
      totalAmount += dish.price * item.quantity;
    }

    // Generate a unique order number
    const orderNumber = `ORD-${Date.now()}-${userId}`;

    // Save the order
    const order = await Order.create({
      orderNumber,
      userId,
      items: JSON.stringify(items),
      totalAmount,
      note,
    });

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
};

const orderItems = (order) =>
  Array.isArray(order.items) ? order.items : JSON.parse(order.items);

const isAdmin = (user) => user.isAdmin === true;

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

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
    // Enrich orders with dish info
    const ordersWithDishes = await Promise.all(
      orders.map(async (order) => {
        const items = JSON.parse(order.items); // parse JSON

        // Fetch dish details
        const detailedItems = await Promise.all(
          items.map(async (item) => {
            const dish = await Dish.findByPk(item.id);
            if (dish) {
              return {
                id: dish.id,
                dishName: dish.dishName,
                price: dish.price,
                quantity: item.quantity,
              };
            }
            return null;
          })
        );

        return {
          ...order.toJSON(),
          items: detailedItems.filter(Boolean), // remove nulls if dish not found
        };
      })
    );

    res.status(200).json(ordersWithDishes);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};


exports.getRiderOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { status: "success" },
      include: [
        {
          model: User,
          as:"user",
          attributes: ["id", "latitude", "longitude", "name","phone"],
        },
      ],
    });

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const user = order.user;

        const address =
          user?.latitude && user?.longitude
            ? await getAddressFromCoords(user.latitude, user.longitude)
            : null;

        return {
          ...order.toJSON(),
          deliveryAddress: address,
        };
      })
    );

    res.json(enrichedOrders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// get all order in the database
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({
  orders,
  totalOrders: orders.length,
});
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Error fetching all orders' });
  }
}

// GET ORDER BY ID
exports.getOrderById = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.userId !== req.user.id) return res.status(403).json({ message: 'Unauthorized access' });

    const items = JSON.parse(order.items);
    const detailedItems = await Promise.all(
      items.map(async (item) => {
        const dish = await Dish.findByPk(item.id);
        if (dish) {
          return {
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
    return res.status(500).json({ message: "We couldn't load your orders right now. Please try again." });
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
    return res.status(500).json({ message: "We couldn't load restaurant orders right now. Please try again." });
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
      return res.status(403).json({ message: "You don't have permission to view this order." });
    }
    if (!isAdmin(req.user) && order.userId !== req.user.id) {
      return res.status(403).json({ message: "You don't have permission to view this order." });
    }
    return res.status(200).json(await withDishDetails(order));
  } catch (error) {
    console.error("Error fetching order:", error.message);
    return res.status(500).json({ message: "We couldn't load this order right now. Please try again." });
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
    if (result.forbidden) return res.status(403).json({ message: "You don't have permission to make that change." });
    if (result.paymentAlreadySucceeded) {
      return res.status(409).json({ message: "A paid order cannot be cancelled" });
    }
    if (result.invalidTransition) {
      return res.status(409).json({ message: "Order status cannot be changed to that value" });
    }
    return res.status(200).json({ message: "Order updated successfully", order: result.order });
  } catch (error) {
    console.error("Error updating order:", error.message);
    return res.status(500).json({ message: "We couldn't update this order right now. Please try again." });
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
    if (result.forbidden) return res.status(403).json({ message: "You don't have permission to delete this order." });
    return res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error.message);
    return res.status(500).json({ message: "We couldn't delete this order right now. Please try again." });
  }
};
