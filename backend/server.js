const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { exec } = require("child_process");
const { Server } = require("socket.io");
const crypto = require("crypto");
const sequelize = require('./config/db');
require("dotenv").config();
const { sendOrderConfirmation } = require('./utils/mail');
const { sendPush } = require('./utils/push');
// Route imports
const authRoutes = require("./routes/authRoutes");
const locationRoutes = require("./routes/locationRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const orderRoutes = require("./routes/ordersRouter");
const uploadsRoutes = require("./routes/uploadRoutes");
const cartRoutes = require("./routes/cartRoutes");
const ratingsRoutes = require("./routes/ratingsRoute");
const reviewRoutes = require("./routes/reviewRoute");
const paymentsRoutes = require("./routes/transInitialiserRoute");
const transactionRoutes = require("./routes/transactionRoutes");
const { Order, User, Transaction } = require('./models'); 
const app = express();

// Root route
app.get("/", (req, res) => {
  res.send("Coolchop Backend is running ✅");
});

app.use(cors());

app.post("/api/paystack/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!req.body) {
      console.error("Raw body missing");
      return res.sendStatus(400);
    }

    // Verify signature
    const hash = crypto
      .createHmac("sha512", secret)
      .update(req.body)
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      console.error("Invalid signature");
      return res.sendStatus(401);
    }

    // Parse JSON
    const payload = JSON.parse(req.body.toString());
    const { event, data } = payload;

    console.log("Paystack webhook event:", event);

    if (event === "charge.success") {
      const ref = data.reference;
      console.log(`Payment successful for reference: ${ref}`);

      // Find the order by reference
      const order = await Order.findOne({ where: { reference: ref } });
      if (!order) return res.sendStatus(404);

      // Avoid invalid ENUM
      if (!["pending", "preparing", "on_delivery", "delivered"].includes(order.status)) {
        order.status = "preparing"; // safe default for successful payment
      }
      await order.save();

      // Create or update transaction
      let transaction = await Transaction.findOne({ where: { orderId: order.id } });
      if (transaction) {
        transaction.status = "success";
        transaction.amount = data.amount;
        transaction.reference = data.reference;
        transaction.currency = data.currency;
        transaction.channel = data.channel;
        transaction.gatewayResponse = data.gateway_response;
        transaction.rawResponse = payload;
        await transaction.save();
      } else {
        transaction = await Transaction.create({
          orderId: order.id,
          userId: order.userId,
          amount: data.amount,
          status: "success",
          reference: data.reference,
          currency: data.currency,
          channel: data.channel,
          gatewayResponse: data.gateway_response,
          rawResponse: payload,
        });
      }

      // Notify user
      const user = await User.findByPk(order.userId);
      if (user?.email) await sendOrderConfirmation(user.email, ref, order.totalAmount);
      if (user?.expoToken) await sendPush(user.expoToken, `Order ${ref} confirmed. Total ₵${order.totalAmount}`);

      // Notify rider
      const rider = await User.findOne({ where: { role: "rider" } });
      if (rider?.expoToken) await sendPush(rider.expoToken, `📦 New order to deliver: Ref ${ref}`);

      console.log(`Order ${ref} and Transaction updated successfully.`);
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    return res.sendStatus(500);
  }
});


// ✅ Now enable JSON parsing for all other routes
app.use(express.json());

// Static files
app.use("/public", express.static(path.join(__dirname, "public")));

// API Routes
app.use("/api/user", authRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/restaurant", restaurantRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/ratings", ratingsRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/transactions", transactionRoutes);

// GitHub CI/CD webhook
app.post("/webhook", (req, res) => {
  const payload = req.body;
  res.status(200).send("Webhook received message");

  if (req.headers["x-github-event"] === "push" || req.headers["x-github-event"] === "ping") {
    console.log("Webhook triggered by push event");

    exec("cd /home/ubuntu/coolchop_backend && git pull && npm install && pm2 restart server", (err, stdout, stderr) => {
      if (err) {
        console.error("Deployment failed:", stderr);
        return res.status(500).send("Deployment failed");
      }
      console.log("Deployment successful:", stdout);
      res.status(200).send("Deployment successful");
    });
  } else {
    res.status(400).send("Event not handled");
  }
});

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const socketServer = new Server(server);

socketServer.on("connection", () => {
  console.log("WebSocket connection successful");
});
socketServer.on("disconnect", () => {
  console.log("WebSocket connection disconnected");
});

// Sync database
sequelize
  .sync()
  .then(() => {
    console.log("Database synced");
  })
  .catch((err) => {
    console.error("Unable to sync database:", err);
  });

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
