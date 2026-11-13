
const {
  Order,
  Dish,
  Transaction,
  User,
  NotificationOutbox,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");
const getAddressFromCoords = require("../utils/getAddressFromCoords");
const normalizeOrderItems = require("../utils/normalizeOrderItems");
const {
  emitRiderOrderReady,
  emitRiderOrderUpdated,
} = require("../utils/riderSocketEvents");
const {
  isRestaurantTransitionAllowed,
  isRiderTransitionAllowed,
} = require("../utils/orderLifecycle");
const crypto = require("crypto");

const ORDER_STATUSES = new Set([
  "preparing",
  "ready_for_pickup",
  "on_delivery",
  "delivered",
  "cancelled",
]);

const orderItems = (order) => normalizeOrderItems(order.items);

const isAdmin = (user) =>
  user?.role === "admin" ||
  user?.isAdmin === true ||
  Number(user?.isAdmin) === 1;

const withDishDetails = async (order) => {
  const items = orderItems(order);

  const dishIds = [
    ...new Set(
      items
        .map((item) => Number(item.id))
        .filter((id) => Number.isInteger(id) && id > 0)
    ),
  ];

  const dishes = dishIds.length
    ? await Dish.findAll({ where: { id: dishIds } })
    : [];

  const dishesById = new Map(
    dishes.map((dish) => [Number(dish.id), dish])
  );

  return {
    ...order.toJSON(),
    items: items.map((item) => {
      const dish = dishesById.get(Number(item.id));

      if (!dish) {
        return {
          id: Number(item.id),
          quantity: Number(item.quantity),
          unavailable: true,
        };
      }

      return {
        id: dish.id,
        dishName: dish.dishName,
        price: dish.price,
        quantity: Number(item.quantity),
      };
    }),
  };
};

// GET ORDERS FOR THE AUTHENTICATED USER
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    const detailedOrders = await Promise.all(
      orders.map(withDishDetails)
    );

    return res.status(200).json(detailedOrders);
  } catch (error) {
    console.error("Error fetching user orders:", error);

    return res.status(500).json({
      message: "We couldn't load your orders right now. Please try again.",
    });
  }
};

// GET ALL ORDERS FOR ADMINS, OR THE USER'S OWN ORDERS FOR CUSTOMERS
exports.getAllOrders = async (req, res) => {
  try {
    const where = isAdmin(req.user)
      ? {}
      : { userId: req.user.id };

    const orders = await Order.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    const detailedOrders = await Promise.all(
      orders.map(withDishDetails)
    );

    return res.status(200).json({
      orders: detailedOrders,
      totalOrders: detailedOrders.length,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);

    return res.status(500).json({
      message: "We couldn't load orders right now. Please try again.",
    });
  }
};

// GET ORDERS BELONGING TO THE AUTHENTICATED RESTAURANT
exports.getRestaurantOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        status: ["preparing", "ready_for_pickup"],
      },
      order: [["createdAt", "DESC"]],
    });

    if (orders.length === 0) {
      return res.status(200).json([]);
    }

    const itemsByOrder = orders.map((order) => ({
      order,
      items: orderItems(order),
    }));

    const dishIds = [
      ...new Set(
        itemsByOrder.flatMap(({ items }) =>
          items
            .map((item) => Number(item.id))
            .filter((id) => Number.isInteger(id) && id > 0)
        )
      ),
    ];

    if (dishIds.length === 0) {
      return res.status(200).json([]);
    }

    const dishes = await Dish.findAll({
      where: {
        id: dishIds,
        restaurantId: req.user.id,
      },
    });

    const ownedDishIds = new Set(
      dishes.map((dish) => Number(dish.id))
    );

    const restaurantOrders = itemsByOrder
      .filter(
        ({ items }) =>
          items.length > 0 &&
          items.every((item) =>
            ownedDishIds.has(Number(item.id))
          )
      )
      .map(({ order }) => order);

    const detailedOrders = await Promise.all(
      restaurantOrders.map(withDishDetails)
    );

    const response = detailedOrders.map(
      ({ reference, userId, ...order }) => order
    );

    return res.status(200).json(response);
  } catch (error) {
    console.error(
      `Error fetching orders for restaurant ${req.user.id}:`,
      error
    );

    return res.status(500).json({
      message: "We couldn't load restaurant orders right now. Please try again.",
      requestId: req.requestId,
    });
  }
};



// GET A SINGLE ORDER
exports.getOrderById = async (req, res) => {
  const orderId = Number(req.params.orderId);

  if (!Number.isInteger(orderId) || orderId < 1) {
    return res.status(400).json({
      message: "Enter a valid order ID.",
    });
  }

  try {
    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({
        message: "We couldn't find that order.",
      });
    }

    const admin = isAdmin(req.user);

    if (!admin && req.user.role !== "customer") {
      return res.status(403).json({
        message: "You don't have permission to view this order.",
      });
    }

    if (
      !admin &&
      Number(order.userId) !== Number(req.user.id)
    ) {
      return res.status(403).json({
        message: "You don't have permission to view this order.",
      });
    }

    return res.status(200).json(
      await withDishDetails(order)
    );
  } catch (error) {
    console.error("Error fetching order:", error);

    return res.status(500).json({
      message: "We couldn't load this order right now. Please try again.",
    });
  }
};

// CREATE AN ORDER
exports.createOrder = async (req, res) => {
  const { items, note } = req.body;

  if (
    !Array.isArray(items) ||
    items.length === 0 ||
    items.some(
      (item) =>
        !Number.isInteger(Number(item?.id)) ||
        Number(item.id) < 1 ||
        !Number.isInteger(Number(item?.quantity)) ||
        Number(item.quantity) < 1 ||
        Number(item.quantity) > 99
    )
  ) {
    return res.status(400).json({
      message: "Add at least one valid item to your order.",
    });
  }

  try {
    const normalizedItems = items.map((item) => ({
      id: Number(item.id),
      quantity: Number(item.quantity),
    }));

    const dishIds = [
      ...new Set(normalizedItems.map((item) => item.id)),
    ];

    const dishes = await Dish.findAll({
      where: { id: dishIds },
    });

    const dishesById = new Map(
      dishes.map((dish) => [Number(dish.id), dish])
    );

    if (
      normalizedItems.some(
        (item) => !dishesById.has(item.id)
      )
    ) {
      return res.status(400).json({
        message: "One or more dishes are no longer available.",
      });
    }

    const totalAmount = normalizedItems.reduce(
      (sum, item) =>
        sum +
        Number(dishesById.get(item.id).price) *
          item.quantity,
      0
    );

    const order = await Order.create({
      orderNumber: `ORD-${crypto.randomUUID()}`,
      userId: req.user.id,
      items: normalizedItems,
      totalAmount,
      note: typeof note === "string"
        ? note.slice(0, 500)
        : null,
    });

    return res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Error creating order:", error);

    return res.status(500).json({
      message: "We couldn't create your order right now. Please try again.",
    });
  }
};

exports.getRiderOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        [Op.or]: [
          { status: "ready_for_pickup", riderId: null },
          {
            riderId: req.user.id,
            status: ["ready_for_pickup", "on_delivery"],
          },
        ],
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "latitude", "longitude", "name", "phone"],
        },
      ],
    });
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const user = order.user;
        const address =
          user?.latitude != null && user?.longitude != null
            ? await getAddressFromCoords(user.latitude, user.longitude)
            : null;
        return { ...order.toJSON(), deliveryAddress: address };
      })
    );
    return res.status(200).json(enrichedOrders);
  } catch (error) {
    console.error("Error fetching rider orders:", error);
    return res.status(500).json({ message: "We couldn't load available orders right now. Please try again." });
  }
};

exports.getRiderHistory = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        riderId: req.user.id,
        status: "delivered",
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "phone"],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching rider delivery history:", error);
    return res.status(500).json({
      message: "We couldn't load your delivery history right now. Please try again.",
    });
  }
};

exports.claimRiderOrder = async (req, res) => {
  const orderId = Number(req.params.orderId);
  if (!Number.isInteger(orderId) || orderId < 1) {
    return res.status(400).json({ message: "Enter a valid order ID." });
  }

  try {
    const result = await sequelize.transaction(async (transaction) => {
      const order = await Order.findByPk(orderId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!order) return { notFound: true };
      if (order.status !== "ready_for_pickup" || order.riderId != null) {
        return { unavailable: true };
      }

      order.riderId = req.user.id;
      await order.save({ transaction });
      return { order };
    });

    if (result.notFound) {
      return res.status(404).json({ message: "We couldn't find that order." });
    }
    if (result.unavailable) {
      return res.status(409).json({ message: "That order is no longer available." });
    }

    emitRiderOrderUpdated(result.order);

    return res.status(200).json({ message: "Order claimed successfully.", order: result.order });
  } catch (error) {
    console.error("Error claiming rider order:", error);
    return res.status(500).json({ message: "We couldn't claim this order right now. Please try again." });
  }
};

exports.updateRiderOrderStatus = async (req, res) => {
  const orderId = Number(req.params.orderId);
  const { status } = req.body;

  if (
    !Number.isInteger(orderId) ||
    orderId < 1 ||
    !["on_delivery", "delivered"].includes(status) ||
    Object.keys(req.body).some((key) => key !== "status")
  ) {
    return res.status(400).json({ message: "Enter a valid order ID and delivery status." });
  }

  try {
    const result = await sequelize.transaction(async (transaction) => {
      const order = await Order.findByPk(orderId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!order) return { notFound: true };
      if (Number(order.riderId) !== Number(req.user.id)) return { forbidden: true };
      if (!isRiderTransitionAllowed(order.status, status)) return { invalidTransition: true };

      order.status = status;
      await order.save({ transaction });
      return { order };
    });

    if (result.notFound) {
      return res.status(404).json({ message: "We couldn't find that order." });
    }
    if (result.forbidden) {
      return res.status(403).json({ message: "This order is not assigned to you." });
    }
    if (result.invalidTransition) {
      return res.status(409).json({ message: "That delivery status change isn't available." });
    }

    emitRiderOrderUpdated(result.order);

    return res.status(200).json({ message: "Delivery status updated.", order: result.order });
  } catch (error) {
    console.error("Error updating rider order:", error);
    return res.status(500).json({ message: "We couldn't update this delivery right now. Please try again." });
  }
};

exports.getOrderById = async (req, res) => {
  const orderId = Number(req.params.orderId);
  if (!Number.isInteger(orderId) || orderId < 1) {
    return res.status(400).json({ message: "Enter a valid order ID." });
  }

  try {
    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ message: "We couldn't find that order." });
    if (!isAdmin(req.user) && req.user.role !== "customer") {
      return res.status(403).json({ message: "You don't have permission to view this order." });
    }
    if (!isAdmin(req.user) && order.userId !== req.user.id) {
      return res.status(403).json({ message: "You don't have permission to view this order." });
    }
    return res.status(200).json(await withDishDetails(order));
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({ message: "We couldn't load this order right now. Please try again." });
  }
};

exports.updateOrder = async (req, res) => {
  const orderId = Number(req.params.orderId);
  const { status } = req.body;

  if (
    !Number.isInteger(orderId) ||
    orderId < 1 ||
    !ORDER_STATUSES.has(status)
  ) {
    return res.status(400).json({
      message: "Enter a valid order ID and status.",
    });
  }

  if (
    Object.keys(req.body).some((key) => key !== "status")
  ) {
    return res.status(400).json({
      message: "Only the order status can be changed.",
    });
  }

  try {
    const result = await sequelize.transaction(
      async (transaction) => {
        const order = await Order.findByPk(orderId, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!order) {
          return { notFound: true };
        }

        const admin = isAdmin(req.user);
        const restaurant = req.user.role === "restaurant";

        if (
          !admin &&
          !restaurant &&
          Number(order.userId) !== Number(req.user.id)
        ) {
          return { forbidden: true };
        }

        if (restaurant) {
          if (!isRestaurantTransitionAllowed(order.status, status)) {
            return { invalidTransition: true };
          }

          const dishIds = [
            ...new Set(
              orderItems(order).map((item) => Number(item.id))
            ),
          ];

          const dishes = await Dish.findAll({
            where: {
              id: dishIds,
              restaurantId: req.user.id,
            },
            transaction,
          });

          if (
            dishIds.length === 0 ||
            dishes.length !== dishIds.length
          ) {
            return { forbidden: true };
          }
        } else if (!admin) {
          const canCancel =
            req.user.role === "customer" &&
            status === "cancelled" &&
            order.status === "pending" &&
            !order.reference;

          if (!canCancel) {
            return { invalidTransition: true };
          }
        }

        if (status === "cancelled") {
          const successfulPayment = await Transaction.findOne({
            where: {
              orderId: order.id,
              status: "success",
            },
            transaction,
            lock: transaction.LOCK.UPDATE,
          });

          if (successfulPayment) {
            return { paymentAlreadySucceeded: true };
          }
        }

        const becameReadyForPickup =
          order.status !== "ready_for_pickup" && status === "ready_for_pickup";
        order.status = status;

        await order.save({ transaction });

        if (becameReadyForPickup) {
          await NotificationOutbox.create(
            {
              dedupeKey: `rider-order-ready:${order.id}`,
              eventType: "rider_order_ready",
              payload: {
                orderId: order.id,
                orderNumber: order.orderNumber,
              },
            },
            { transaction }
          );
        }

        return { order, becameReadyForPickup };
      }
    );

    if (result.notFound) {
      return res.status(404).json({
        message: "We couldn't find that order.",
      });
    }

    if (result.forbidden) {
      return res.status(403).json({
        message: "You don't have permission to make that change.",
      });
    }

    if (result.paymentAlreadySucceeded) {
      return res.status(409).json({
        message: "A paid order cannot be cancelled.",
      });
    }

    if (result.invalidTransition) {
      return res.status(409).json({
        message: "That order status change isn't available.",
      });
    }

    if (result.becameReadyForPickup) {
      emitRiderOrderReady(result.order);
    }

    return res.status(200).json({
      message: "Order updated successfully",
      order: result.order,
    });
  } catch (error) {
    console.error("Error updating order:", error);

    return res.status(500).json({
      message: "We couldn't update this order right now. Please try again.",
    });
  }
};

// DELETE AN ORDER
exports.deleteOrder = async (req, res) => {
  const orderId = Number(req.params.orderId);

  if (!Number.isInteger(orderId) || orderId < 1) {
    return res.status(400).json({
      message: "Enter a valid order ID.",
    });
  }

  try {
    const result = await sequelize.transaction(
      async (transaction) => {
        const order = await Order.findByPk(orderId, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!order) {
          return { notFound: true };
        }

        const admin = isAdmin(req.user);

        if (
          !admin &&
          (
            req.user.role !== "customer" ||
            Number(order.userId) !== Number(req.user.id) ||
            order.status !== "pending" ||
            order.reference
          )
        ) {
          return { forbidden: true };
        }

        if (order.reference) {
          return { forbidden: true };
        }

        await order.destroy({ transaction });

        return { deleted: true };
      }
    );

    if (result.notFound) {
      return res.status(404).json({
        message: "We couldn't find that order.",
      });
    }

    if (result.forbidden) {
      return res.status(403).json({
        message: "You don't have permission to delete this order.",
      });
    }

    return res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting order:", error);

    return res.status(500).json({
      message: "We couldn't delete this order right now. Please try again.",
    });
  }
};
