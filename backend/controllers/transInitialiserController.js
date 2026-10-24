const https = require("https");
const crypto = require("crypto");
const { User, Dish, Order } = require("../models");

const requestPaystack = (payload) =>
  new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const request = https.request(
      {
        hostname: "api.paystack.co",
        port: 443,
        path: "/transaction/initialize",
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (response) => {
        let responseBody = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          responseBody += chunk;
          if (responseBody.length > 1024 * 1024) {
            request.destroy(new Error("Paystack response exceeded the size limit"));
          }
        });
        response.on("end", () => {
          try {
            const result = JSON.parse(responseBody);
            if (response.statusCode < 200 || response.statusCode >= 300) {
              return reject(new Error(`Paystack returned HTTP ${response.statusCode}`));
            }
            resolve(result);
          } catch (error) {
            reject(new Error("Paystack returned an invalid response"));
          }
        });
      }
    );

    request.setTimeout(15000, () => request.destroy(new Error("Paystack request timed out")));
    request.on("error", reject);
    request.write(body);
    request.end();
  });

exports.initializeTransaction = async (req, res) => {
  const { items, note } = req.body;

  if (
    !Array.isArray(items) ||
    items.length === 0 ||
    items.length > 50 ||
    items.some(
      (item) =>
        !Number.isInteger(Number(item?.id)) ||
        Number(item.id) < 1 ||
        !Number.isInteger(Number(item?.quantity)) ||
        Number(item.quantity) < 1 ||
        Number(item.quantity) > 99
    )
  ) {
    return res.status(400).json({ error: "Valid order items are required." });
  }

  if (!process.env.PAYSTACK_SECRET_KEY) {
    return res.status(503).json({ error: "Payment service is not configured." });
  }

  try {
    const user = await User.findByPk(req.user.id);
    if (!user || !user.isVerified) {
      return res.status(401).json({ error: "A verified account is required." });
    }

    const normalizedItems = items.map((item) => ({
      id: Number(item.id),
      quantity: Number(item.quantity),
    }));
    const dishIds = [...new Set(normalizedItems.map((item) => item.id))];
    const dishes = await Dish.findAll({ where: { id: dishIds } });
    const dishesById = new Map(dishes.map((dish) => [dish.id, dish]));

    if (dishes.length !== dishIds.length) {
      return res.status(400).json({ error: "One or more dishes are unavailable." });
    }
    const restaurantIds = new Set(dishes.map((dish) => Number(dish.restaurantId)));
    if (restaurantIds.size !== 1) {
      return res.status(400).json({
        error: "Each checkout must contain dishes from a single restaurant.",
      });
    }

    const totalMinorUnits = normalizedItems.reduce((sum, item) => {
      const price = Number(dishesById.get(item.id).price);
      if (!Number.isFinite(price) || price < 0) {
        throw new Error(`Invalid price configured for dish ${item.id}`);
      }
      return sum + Math.round(price * 100) * item.quantity;
    }, 0);

    if (!Number.isSafeInteger(totalMinorUnits) || totalMinorUnits < 1) {
      return res.status(400).json({ error: "Order total is invalid." });
    }

    const reference = `CC-${crypto.randomUUID()}`;
    const order = await Order.create({
      orderNumber: `ORD-${crypto.randomUUID()}`,
      reference,
      userId: user.id,
      items: JSON.stringify(normalizedItems),
      totalAmount: totalMinorUnits / 100,
      note: typeof note === "string" ? note.slice(0, 500) : null,
      status: "pending",
    });

    const payment = await requestPaystack({
      email: user.email,
      amount: totalMinorUnits,
      currency: "GHS",
      reference,
    });

    const paymentData = payment?.data;
    if (
      !payment?.status ||
      paymentData?.reference !== reference ||
      typeof paymentData?.authorization_url !== "string" ||
      !paymentData.authorization_url.startsWith("https://checkout.paystack.com/")
    ) {
      console.error("Paystack did not return a valid initialization response.");
      return res.status(502).json({ error: "Could not initialize payment." });
    }

    return res.status(200).json({
      authorization_url: paymentData.authorization_url,
      reference,
      access_code: paymentData.access_code,
      amount: totalMinorUnits,
      currency: "GHS",
      orderId: order.id,
    });
  } catch (error) {
    console.error("Payment initialization failed:", error.message);
    return res.status(502).json({ error: "Could not initialize payment." });
  }
};
