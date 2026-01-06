const {User} = require("../models");
const bcrypt = require("bcryptjs");
const { encrypt, decrypt } = require("../utils/encryption");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken")
const crypto = require("crypto");
require("dotenv").config();


// Function to generate a random 4-digit verification code
const generateVerificationCode = () => {
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
    // Find user by email
    const existingUser = await User.findOne({ where: { email } });
    if (!existingUser) {
      return { status: 400, error: "Email can't be found" };
    }

    // Update user's record with the verification code
    await existingUser.update({
      code,
    });

  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};



exports.login = async (req, res) => {
  try {
    const { email, password, longitude, latitude } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

    // Check verification
    if (!user.isVerified) {
      return res.status(400).json({ error: "User is not verified. Please check your email." });
    }

    // Update user location if provided
    if (longitude && latitude) {
      await user.update({ longitude, latitude });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role, // ensure this matches your User model
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

   res.status(200).json({
  message: "Login successful",
  user: {
    id: user.id,
    email: user.email,
    role: user.role,
    token, // include token inside user
    isVerified: user.isVerified,
    longitude: user.longitude,
    latitude: user.latitude,
  },
});


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};


exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password, isAdmin,role } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password ||  !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if email exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already in use" });
    }

    // Check if phone exists
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(409).json({ error: "Phone number already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      code: verificationCode,
      confirm_location: 0,
      isAdmin: isAdmin ? 1 : 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      role
    });

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({
      success: true,
      message: "User created. Verification code sent to email.",
      userId: user.id,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
};

// Verification function
exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: "Invalid email or code" });
    }

    // Check if the code matches
    if (user.code !== code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    await user.update({ code: null });

    res.status(200).json({ message: "Code verified successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Getting user data
exports.getUserData = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const user = await User.findOne({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      id: user.id,       
      name: user.name,
      email: user.email,
      longitude: user.longitude,
      latitude: user.latitude,
      phone: user.phone,
      profileImage: user.profileImage,
      role: user.userRole,     // include role if needed
    });
  } catch (error) {
    console.error("Error getting user data:", error);
    res.status(500).json({ error: "Server error" });
  }
};


exports.searchUser = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).send("Query parameter is required");
    }
    const regex = new RegExp(q, "i"); 
    const users = await User.find({ name: regex }).limit(10); 
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};



// Forgotten password
exports.forgottenPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "User not found" });

    const resetCode = generateVerificationCode();
    await sendVerificationEmail(email, resetCode);
    await user.update({ resetToken: resetCode });

    res.status(200).json({ message: "Password reset code sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword, email, resetToken } = req.body;

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.resetToken !== resetToken)
      return res.status(401).json({ message: "Invalid or expired reset token" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword, code: null, resetToken: null });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Password Reset function
exports.passwordReset = async (req, res) => {
  const { token, newPassword } = req.body;

  const passwordReset = await User.findOne({ where: { resetToken: token } });
  if (!passwordReset || passwordReset.tokenExpiry < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const customer = await User.findByPk(passwordReset.customerId);
  customer.password = await bcrypt.hash(newPassword, 10);

  await customer.save();
  await passwordReset.destroy(); // Delete the reset token

  res.json({ message: "Password updated successfully" });
};

exports.getAllUsers = async (req, res) => {
  const getUsers = await User.findAll();
  if (getUsers) {
    res.status(200).json(getUsers);
  }
};


exports.verifyUserId = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    // Decrypt the token to get the user ID
    const userId = await decrypt(token);

    // Check if the user exists in the database
    const userExists = await User.findOne({ where: { id: userId } });

    if (userExists) {
      res.status(200).json({ exists: true });
    } else {
      res.status(404).json({ exists: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ message: 'Error verifying token', error });
  }
};


exports.updateUserLocation = async (req, res) => {
  try {
    const userId = req.user.id;

    const { latitude, longitude } = req.body;

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.latitude = latitude;
    user.longitude = longitude;
   

    await user.save();

    res.status(200).json({
      message: "User location updated successfully",
    });
  } catch (error) {
    console.error("Error updating user location:", error);
    res.status(500).json({ error: "Server error" });
  }
};




   
