 const https = require("https");
const { Order } = require("../models");
const {
  recordFailedPayment,
  recordSuccessfulPayment,
} = require("./paystackWebhookController");

const verifyPaystackReference = (reference) =>
  new Promise((resolve, reject) => {
    let settled = false;
    const request = https.request(
      {
        hostname: "api.paystack.co",
        port: 443,
        path: `/transaction/verify/${encodeURIComponent(reference)}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          Accept: "application/json",
        },
      },
      (response) => {
        let responseBody = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          responseBody += chunk;
          if (responseBody.length > 1024 * 1024) {
            settled = true;
            request.destroy(new Error("Paystack response exceeded the size limit"));
          }
        });
        response.on("end", () => {
          if (settled) return;
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

    request.setTimeout(15000, () => {
      settled = true;
      request.destroy(new Error("Paystack request timed out"));
    });
    request.on("error", reject);
    request.end();
  });

exports.reconcilePayment = async (req, res) => {
  const { reference } = req.params;
  if (!reference || reference.length > 100) {
    return res.status(400).json({ error: "A valid payment reference is required." });
  }
  if (!process.env.PAYSTACK_SECRET_KEY) {
    return res.status(503).json({ error: "Payment service is not configured." });
  }

  try {
    const order = await Order.findOne({
      where: { reference, userId: req.user.id },
    });
    if (!order) {
      return res.status(404).json({ error: "Payment order not found." });
    }

    const verification = await verifyPaystackReference(reference);
    const payment = verification?.data;
    if (!verification?.status || payment?.reference !== reference) {
      return res.status(502).json({ error: "Payment provider verification failed." });
    }

    if (payment.status !== "success") {
      if (payment.status === "failed" || payment.status === "abandoned") {
        const result = await recordFailedPayment(payment, verification);
        if (result.invalidEvent || result.invalidAmount) {
          return res.status(409).json({ error: "Payment details did not match the order." });
        }
      }
      return res.status(200).json({
        status: ["failed", "abandoned"].includes(payment.status) ? "failed" : "pending",
      });
    }

    const result = await recordSuccessfulPayment(payment, verification);
    if (result.notFound) {
      return res.status(404).json({ error: "Payment order not found." });
    }
    if (result.invalidEvent || result.invalidAmount) {
      return res.status(409).json({ error: "Payment details did not match the order." });
    }

    return res.status(200).json({
      status: "success",
      reference,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Payment reconciliation failed:", error.message);
    return res.status(502).json({ error: "Could not verify payment status." });
  }
};

exports.verifyPaystackReference = verifyPaystackReference;
