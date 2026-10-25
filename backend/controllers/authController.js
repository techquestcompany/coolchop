const {User} = require("../models");
const bcrypt = require("bcryptjs");
const { encrypt, decrypt } = require("../utils/encryption");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken")
const crypto = require("crypto");
const { getAdminUserIds } = require("../utils/adminIdentity");
require("dotenv").config();


//const nodemailer = require("nodemailer");

// Generate 4-digit code
const generateVerificationCode = () =>
  Math.floor(1000 + Math.random() * 9000).toString();

// Send email
const sendVerificationEmail = async (email, code) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.verify(); // catches auth errors

  const mailOptions = {
    from: `"Your App Name" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Email Verification Code",
    text: `Your verification code is: ${code}`,
  };

  await transporter.sendMail(mailOptions);
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
    const isAdmin = getAdminUserIds().has(user.id);
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: isAdmin ? "admin" : user.role === "rider" ? "rider" : "customer",
        isAdmin,
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
    const { name, email, phone, password, role } = req.body;

    // Validate required fields
    
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check email
    if (await User.findOne({ where: { email } })) {
      return res.status(409).json({ error: "Email already in use" });
    }

    // Check phone
    if (await User.findOne({ where: { phone } })) {
      return res.status(409).json({ error: "Phone already in use" });
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
      role,
      isAdmin: isAdmin ? 1 : 0,
      isVerified: 0,
      code: verificationCode,
      confirm_location: 0,
    });

    // Send email (CRITICAL STEP)
    await sendVerificationEmail(email, verificationCode);

    return res.status(201).json({
      success: true,
      message: "Account created. Verification code sent to email.",
      userId: user.id,
    });

  } catch (error) {
    console.error("Signup error:", error.message);
    return res.status(500).json({
      error: "Signup failed. Email could not be sent.",
    });
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
      role: user.role,
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

  try {
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Math.min(Number.parseInt(req.query.limit, 10) || 10, 100);
    if (page < 1 || limit < 1) {
      return res.status(400).json({ error: "Invalid page or limit." });
    }
    const { count, rows } = await User.findAndCountAll({
      attributes: { exclude: ["password", "code", "resetToken", "tokenExpiry"] },
      limit,
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({
      users: rows,
      page,
      limit,
      totalUsers: count,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Error listing users:", error.message);
    return res.status(500).json({ error: "Could not retrieve users." });
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




   
