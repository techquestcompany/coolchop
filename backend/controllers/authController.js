const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { encrypt, decrypt } = require('../utils/encryption');
const nodemailer = require('nodemailer');
const crypto = require("crypto");
require('dotenv').config();

// Function to generate a random 4-digit verification code
/*const generateVerificationCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); 
};

// Function to send verification email
const sendVerificationEmail = async (email, code) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Verification Code',
    text: `Your verification code is: ${code}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};*/

// Login function
exports.login = async (req, res) => {
  try {
    const { email, password, longitude, latitude } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    await user.update({
      longitude,
      latitude 
    });

    // Generate a random 4-digit verification code
    //const verificationCode = generateVerificationCode();

    // Send verification email
    //await sendVerificationEmail(user.email, verificationCode);

    // Encrypt user id
    const user_id = await encrypt(user.id.toString());

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user_id,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Signup function
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    res.status(201).json({
      message: 'User created successfully',
    });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
};

// Verification function
exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or code' });
    }

    // Check if the code matches
    if (user.code !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    await user.update({ code: null });

    res.status(200).json({ message: 'Code verified successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Getting user data
exports.getUserData = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; 
    if (!token) {
      return res.status(401).json({ error: 'Authentication token missing' });
    }

    const decoded = await decrypt(token);
    const user = await User.findOne({ where: { id: decoded } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      name: user.name,
      email: user.email,
      longitude: user.longitude,
      latitude: user.latitude,
    });
  } catch (error) {
    console.error('Error getting user data:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Forgotten Password function
exports.forgottenPassword = async (req, res) => {
  const { email } = req.body;

  const customer = await User.findOne({ where: { email } });

  if (!customer) {
    return res.status(400).json({ message: 'Customer not found' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const tokenExpiry = Date.now() + 86400000; // 24 hours expiration

  // Update user with reset token and expiry
  await customer.update({
    resetToken,
    tokenExpiry,
  });

  // Send email with reset link 
  /*const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: customer.email,
    subject: 'Password Reset',
    text: `Here is your password reset link: http://yourapp.com/reset-password?token=${resetToken}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Password reset link sent' });
  } catch (error) {
    console.error('Error sending reset email:', error);
    res.status(500).json({ error: 'Failed to send password reset email' });
  }*/
};

// Password Reset function
exports.passwordReset = async (req, res) => {
  const { token, newPassword } = req.body;

  const passwordReset = await User.findOne({ where: { resetToken: token } });
  if (!passwordReset || passwordReset.tokenExpiry < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  const customer = await User.findByPk(passwordReset.customerId);
  customer.password = await bcrypt.hash(newPassword, 10);

  await customer.save();
  await passwordReset.destroy(); // Delete the reset token  

  res.json({ message: 'Password updated successfully' });
};
exports.getAllUsers= async (req,res)=>{
   const getUsers= await User.findAll()
   if(getUsers){
    res.status(200).json(getUsers)
   }
}