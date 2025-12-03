const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { Order, User, Transaction } = require('../models'); 
const { sendOrderConfirmation } = require('../utils/mailer');
const { sendPush } = require('../utils/push');

router.post(
  '/paystack/webhook',
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
  async (req, res) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const hash = crypto
      .createHmac('sha512', secret)
      .update(req.rawBody)
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature'])
      return res.sendStatus(401);

    const event = req.body;

    if (event.event === 'charge.success') {
      const ref = event.data.reference;
      const order = await Order.findOne({ where: { reference: ref } });

      if (!order || order.status === 'success') return res.sendStatus(200);

      order.status = 'success';
      await order.save();
       // Update or create transaction
  let transaction = await Transaction.findOne({
    where: { orderId: order.id },
  });

  if (transaction) {
    transaction.status = 'success';
    transaction.amount = order.totalAmount;
    transaction.rawData = event; 
    await transaction.save();
  } else {
    transaction = await Transaction.create({
      orderId: order.id,
      customerId: order.userId,
      amount: order.totalAmount,
      status: 'success',
      rawData: event, 
    });
  }



      //3. Notify buyer
      const user = await User.findByPk(order.userId);
      if(order.status)
      if (user?.email) {
        await sendOrderConfirmation(user.email, ref, order.totalAmount);
      }

      if (user?.expoToken) {
        await sendPush(
          user.expoToken,
          `Order ${ref} confirmed. Total ₵${order.totalAmount / 100}`
        );
      }

      // 4. Notify a delivery agent
      const delivery = await User.findOne({ where: { role: 'delivery' } });
      if (delivery?.expoToken) {
        await sendPush(
          delivery.expoToken,
          `📦 New order to deliver: Ref ${ref}`
        );
      }

      console.log(` Order ${ref} and Transaction updated.`);
    }

    res.sendStatus(200);
  }
);

module.exports = router;
