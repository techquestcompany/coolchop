const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { encrypt, decrypt } = require('../utils/encryption');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

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
    const verificationCode = generateVerificationCode();

    // Send verification email
    await sendVerificationEmail(user.email, verificationCode);

    //encrypt user id
    const user_id = await encrypt(user.id.toString());

    // If login is successful, return user data
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
    // Find user by email
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





// Function to handle getting user data
exports.getUserData = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; 
    if (!token) {
      return res.status(401).json({ error: 'Authentication token missing' });
    }

    // Verify the token
    const decoded = await decrypt(token);
    
    const user = await User.findOne({ where: { id: decoded } });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return the user's data
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







// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage }).single('file');

exports.uploadUserImage =  (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      return res.status(400).json({ success: false, message: 'Failed to upload image', error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/public/uploads/${req.file.filename}`;
    res.json({ success: true, url: imageUrl });
  });
};





exports.searchUser = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).send('Query parameter is required');
    }
    const regex = new RegExp(q, 'i'); // Case-insensitive search
    const users = await User.find({ name: regex }).limit(10); // Adjust limit as needed
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}





exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).send('User ID parameter is required');
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error.message);
    res.status(500).json({ message: error.message });
  }
};