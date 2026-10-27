const {User} = require("../models");
const bcrypt = require("bcryptjs");
const { encrypt, decrypt } = require("../utils/encryption");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken")
const crypto = require("crypto");
const { getAdminUserIds } = require("../utils/adminIdentity");
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

  await transporter.sendMail(mailOptions);
};



exports.login = async (req, res) => {
  try {
    const { email, password, longitude, latitude } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Enter your email address and password to sign in." });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: "The email address or password is incorrect. Please check your details and try again." });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "The email address or password is incorrect. Please check your details and try again." });

    // Check verification
    if (!user.isVerified) {
      return res.status(400).json({ error: "Please verify your email address before signing in. Check your inbox for the verification code." });
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
    console.error("Error signing in:", error);
    res.status(500).json({ error: "We couldn't sign you in right now. Please try again in a few minutes." });
  }
};


exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password || !["customer", "rider"].includes(role)) {
      return res.status(400).json({ error: "Enter your name, email, phone number, and password, and choose a valid account type." });
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
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      role
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode);
    } catch (error) {
      console.error("Account created, but verification email could not be sent:", error);
      return res.status(503).json({
        error: "Your account was created, but we couldn't send the verification email. Please try again later rather than creating another account.",
      });
    }

    res.status(201).json({
      success: true,
      message: "User created. Verification code sent to email.",
      userId: user.id,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "We couldn't create your account right now. Please check your details and try again." });
  }
};

// Verification function
exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    if (!email || !code) {
      return res.status(400).json({ error: "Enter your email address and verification code." });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "We couldn't find an account with that email address. Check it and try again." });
    }

    // Check if the code matches
    if (user.code !== code) {
      return res.status(400).json({ error: "That verification code is incorrect or has expired. Check the code and try again." });
    }

    await user.update({ code: null });

    res.status(200).json({ message: "Code verified successfully" });
  } catch (error) {
    console.error("Error verifying email code:", error);
    res.status(500).json({ error: "We couldn't verify your code right now. Please try again." });
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
    res.status(500).json({ error: "We couldn't load your account details right now. Please try again." });
  }
};


exports.searchUser = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Enter a name to search for." });
    }
    const regex = new RegExp(q, "i"); 
    const users = await User.find({ name: regex }).limit(10); 
    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "We couldn't complete the user search right now. Please try again." });
  }
};



// Forgotten password
exports.forgottenPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Enter your email address to reset your password." });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "We couldn't find an account with that email address. Check it and try again." });

    const resetCode = generateVerificationCode();
    await user.update({ resetToken: resetCode, code: resetCode });
    await sendVerificationEmail(email, resetCode);

    res.status(200).json({ message: "Password reset code sent successfully" });
  } catch (error) {
    console.error("Error requesting a password reset:", error);
    res.status(500).json({ message: "We couldn't send a password reset code right now. Please try again in a few minutes." });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword, email, resetToken } = req.body;

    if (!newPassword || !confirmPassword || !email || !resetToken) {
      return res.status(400).json({ message: "Enter your email, reset code, new password, and password confirmation." });
    }

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Your new password and confirmation don't match. Please check both fields." });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "We couldn't find an account with that email address. Check it and try again." });

    if (user.resetToken !== resetToken)
      return res.status(401).json({ message: "That password reset code is incorrect or has expired. Request a new code and try again." });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword, code: null, resetToken: null });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "We couldn't update your password right now. Please try again." });
  }
};

// Password Reset function
exports.passwordReset = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Enter your password reset code and new password." });
    }

    const user = await User.findOne({ where: { resetToken: token } });
    if (!user || (user.tokenExpiry && user.tokenExpiry < Date.now())) {
      return res.status(400).json({ message: "That password reset code is incorrect or has expired. Request a new code and try again." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.code = null;
    await user.save();

    res.json({ message: "Your password has been updated successfully." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "We couldn't reset your password right now. Please try again." });
  }
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
    return res.status(500).json({ error: "We couldn't load users right now. Please try again." });
  }
};


exports.verifyUserId = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'A verification token is required. Please try the link again.' });
  }

  let userId;
  try {
    userId = await decrypt(token);
  } catch (error) {
    console.error('Error decrypting verification token:', error);
    return res.status(400).json({ message: 'That verification link is invalid or has expired. Please request a new one.' });
  }

  try {
    // Check if the user exists in the database
    const userExists = await User.findOne({ where: { id: userId } });

    if (userExists) {
      res.status(200).json({ exists: true });
    } else {
      res.status(404).json({ exists: false, message: "We couldn't find an account for that verification link." });
    }
  } catch (error) {
    console.error('Error checking verification link:', error);
    res.status(500).json({ message: "We couldn't check that verification link right now. Please try again." });
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
      return res.status(400).json({ error: "Provide both your latitude and longitude to update your location." });
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
    res.status(500).json({ error: "We couldn't update your location right now. Please try again." });
  }
};




   
