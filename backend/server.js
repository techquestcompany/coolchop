const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const crypto = require("crypto");
const { Server } = require("socket.io");
require("dotenv").config();
const { sequelize } = require("./models");
const { handlePaystackWebhook } = require("./controllers/paystackWebhookController");
const {
  startPendingPaymentReconciler,
  stopPendingPaymentReconciler,
} = require("./utils/pendingPaymentReconciler");
const {
  startNotificationOutboxWorker,
  stopNotificationOutboxWorker,
} = require("./utils/notificationOutboxWorker");
const { assertSchemaUpToDate } = require("./utils/schemaReadiness");
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
const app = express();
app.disable("x-powered-by");
app.use((req, res, next) => {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  res.on("finish", () => {
    console.info(
      JSON.stringify({
        level: "info",
        event: "http_request",
        requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt,
      })
    );
  });
  next();
});
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map((origin) => new URL(origin).origin);

const normalizeOrigin = (origin) => {
  try {
    return new URL(origin).origin;
  } catch {
    return null;
  }
};

const isDevelopmentOrigin = (origin) => {
  if (process.env.NODE_ENV === "production") return false;
  try {
    const url = new URL(origin);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    );
  } catch {
    return false;
  }
};

// Root route
app.get("/", (req, res) => {
  res.send("Coolchop Backend is running ✅");
});

app.get("/health/live", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/health/ready", async (req, res) => {
  try {
    await sequelize.authenticate();
    await assertSchemaUpToDate(sequelize);
    return res.status(200).json({ status: "ready" });
  } catch (error) {
    console.error("Readiness check failed:", error.message);
    return res.status(503).json({ status: "not_ready" });
  }
});

app.use(
  cors({
    origin(origin, callback) {
      const normalizedOrigin = origin ? normalizeOrigin(origin) : null;
      if (
        !origin ||
        (normalizedOrigin && allowedOrigins.includes(normalizedOrigin)) ||
        isDevelopmentOrigin(origin)
      ) {
        return callback(null, true);
      }
      console.warn(
        JSON.stringify({
          level: "warn",
          event: "cors_origin_rejected",
          origin,
        })
      );
      const error = new Error("Origin is not allowed by CORS");
      error.status = 403;
      return callback(error);
    },
  })
);

app.post(
  "/api/paystack/webhook",
  express.raw({ type: "application/json", limit: "1mb" }),
  handlePaystackWebhook
);


// ✅ Now enable JSON parsing for all other routes
app.use(express.json({ limit: "1mb" }));

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

app.use((req, res) => {
  return res.status(404).json({
    error: "We couldn't find the page you're looking for.",
    requestId: req.requestId,
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = Number.isInteger(error.status) ? error.status : 500;
  const message =
    error.type === "entity.parse.failed"
      ? "Your request contains invalid data. Please check it and try again."
      : error.type === "entity.too.large"
        ? "Your request is too large. Please reduce its size and try again."
        : status === 403
          ? "This request isn't allowed from this app."
          : status < 500
            ? "Your request couldn't be completed. Please check your details and try again."
            : "An unexpected server error occurred. Please try again.";
  console.error(
    JSON.stringify({
      level: "error",
      event: "http_error",
      requestId: req.requestId,
      message: error.message,
      status,
    })
  );
  return res.status(status).json({
    error: message,
    requestId: req.requestId,
  });
});

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const socketServer = new Server(server);

socketServer.on("connection", (socket) => {
  console.log("WebSocket connection successful");
  socket.on("disconnect", () => {
    console.log("WebSocket connection disconnected");
  });
});

const PORT = Number(process.env.PORT || 3000);

const startServer = async () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters");
  }
  if (process.env.NODE_ENV === "production" && !process.env.PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY must be configured in production");
  }
  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)
  ) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be configured in production");
  }
  if (
    process.env.NODE_ENV === "production" &&
    require("./utils/adminIdentity").getAdminUserIds().size === 0
  ) {
    throw new Error("ADMIN_USER_IDS must be configured in production");
  }
  if (process.env.NODE_ENV === "production" && allowedOrigins.length === 0) {
    throw new Error("CORS_ALLOWED_ORIGINS must be configured in production");
  }

  await sequelize.authenticate();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(PORT, "0.0.0.0", () => {
      server.removeListener("error", reject);
      resolve();
    });
  });
  startPendingPaymentReconciler();
  startNotificationOutboxWorker();
  console.log(`Server is running on port ${PORT}`);
};

startServer().catch((error) => {
  console.error("Unable to start server:", error.message);
  process.exit(1);
});

let shuttingDown = false;
const shutdown = (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received; closing server`);
  stopPendingPaymentReconciler();
  stopNotificationOutboxWorker();
  socketServer.close(async () => {
    try {
      await sequelize.close();
    } catch (closeError) {
      console.error("Error closing database connection:", closeError.message);
      process.exitCode = 1;
    }
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
