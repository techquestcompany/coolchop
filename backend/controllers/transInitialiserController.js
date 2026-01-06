import https from "https";
import  db  from "../models/index.js"; // ✅ import db instance
const {Order} = db;

export const initializeTransaction = async (req, res) => {
  const { email, amount, order } = req.body;
  if (!email || !amount || !order) {
    return res.status(400).json({ error: "Email, amount, and order are required." });
  }
const orderNumber = `ORD-${Date.now()}`;

  try {
    // 1. Save order in DB
    const savedOrder = await Order.create({
     orderNumber,
      userId: order.userId,
      items: order.items,
      note: order.note,
      status: "pending",
      totalAmount: amount /100, // convert back to GHS
    });

    // 2. Prepare payload for Paystack
    const payload = JSON.stringify({ email, amount: amount.toString() });

    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/transaction/initialize",
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const reqPaystack = https.request(options, (paystackRes) => {
      let data = "";
      paystackRes.on("data", (chunk) => {
        data += chunk;
      });
      paystackRes.on("end", async () => {
        try {
          const response = JSON.parse(data);
          console.log("Paystack init response:", response);

          if (response.status && response.data) {
            const { authorization_url, reference, access_code } = response.data;

            // 3. Save Paystack reference into order
            savedOrder.reference = reference;
            await savedOrder.save();

            // 4. Return to frontend
            return res.json({ authorization_url, reference, access_code });
          }

          return res.status(502).json({ error: "Paystack init failed", details: response });
        } catch (err) {
          return res.status(500).json({ error: "Response parsing error", details: err.message });
        }
      });
    });

    reqPaystack.on("error", (error) => {
      return res.status(500).json({ error: "Request error", details: error.message });
    });

    reqPaystack.write(payload);
    reqPaystack.end();
  } catch (err) {
    console.error("Init transaction error:", err);
    return res.status(500).json({ error: "Failed to initialize transaction" });
  }
};

