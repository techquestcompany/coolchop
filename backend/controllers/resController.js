const Restaurant = require('../models/Restaurant');
const Dish = require('../models/Dish');
const bcrypt = require('bcryptjs');
const { encrypt } = require('../utils/encryption');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Function to generate a unique restaurant ID
const generateRestaurantId = (restaurantName) => {
  // Split the restaurant name into words
  const nameParts = restaurantName.split(' ');
  
  const nameInitials = nameParts.map(word => word.charAt(0).toUpperCase()).join('');

  const randomNumber = Math.floor(1000 + Math.random() * 9000).toString();

  return nameInitials + randomNumber;
};
  
  
  
// Function to send verification email
const sendEmail = async (email, restaurantId) => {
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
      subject: 'Your Restaurant Id',
      text: `Your Restaurant Id is: ${restaurantId}`,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      // Find user by email
      const existingUser = await Restaurant.findOne({ where: { email } });
      if (!existingUser) {
        return { status: 400, error: "Email can't be found" };
      }
  
      // Update user's record with the restaurant id
      await existingUser.update({
        restaurantId, 
      });
  
    } catch (error) {
      console.error('Error sending  email:', error);
    }
};
  


// Login function
exports.login = async (req, res) => {
  try {
    const { restaurantId, password, longitude, latitude } = req.body;

    // Check if user exists
    const restaurant = await Restaurant.findOne({ where: { restaurantId } });

    if (!restaurant) {
      return res.status(400).json({ error: 'Invalid id or password' });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, restaurant.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid id or password' });
    }

    await restaurant.update({
      longitude,
      latitude 
    });


  

    // If login is successful, return restaurant data
    res.status(200).json({
      message: 'Login successful'
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};




// Signup function
exports.addRestaurant = async (req, res) => {
  try {
    const { restaurantName, email, phone, address } = req.body;

    if (!restaurantName || !email || !phone || !address) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if email is already registered
    const existingUser = await Restaurant.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }


    const restaurantId = generateRestaurantId(restaurantName);

    // Send restaurant id via email
    await sendEmail(email, restaurantId);

    const restaurant = await Restaurant.create({
      restaurantName,
      email,
      phone,
      address,
    });

      //encrypt restaurant id
      const res_id = await encrypt(restaurant.id.toString());

    res.status(201).json({
      message: 'Restaurant registered successfully',
      restaurant: {
        id: res_id,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
};


exports.createDishes = async (req, res) => {
  const { dishes } = req.body;


  if (!dishes || !Array.isArray(dishes)) {
    return res.status(400).json({ message: 'Invalid input, dishes must be an array' });
  }

  try {
    // Save all dishes
    const createdDishes = await Dish.bulkCreate(dishes);

    res.status(201).json({
      message: 'Dishes saved successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error saving dishes', error });
  }
};

// Get all restaurants
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll();
    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving restaurants', error });
  }
};

// Get a restaurant by ID
exports.getRestaurantById = async (req, res) => {
  const { id } = req.params;
  try {
    const restaurant = await Restaurant.findByPk(id);
    if (restaurant) {
      res.status(200).json(restaurant);
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving restaurant', error });
  }
};

// Get all dishes
exports.getAllDishes = async (req, res) => {
  try {
    const dishes = await Dish.findAll();
    res.status(200).json(dishes);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving dishes', error });
  }
};

// Get a dish by ID
exports.getDishById = async (req, res) => {
  const { id } = req.params;
  try {
    const dish = await Dish.findByPk(id);
    if (dish) {
      res.status(200).json(dish);
    } else {
      res.status(404).json({ message: 'Dish not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving dish', error });
  }
};