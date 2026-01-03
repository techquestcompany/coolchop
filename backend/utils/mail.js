const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendOrderConfirmation = async (to, reference, amount) => {
  await transporter.sendMail({
    from: `"RentNServe" <${process.env.EMAIL_USER}>`,
    to,
    subject: '✅ Order Payment Confirmed',
    html: `<h3>Your order has been confirmed!</h3>
           <p>Ref: <strong>${reference}</strong></p>
           <p>Total: ₵${(amount / 100).toFixed(2)}</p>`
  });
};
