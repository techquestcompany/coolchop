const {Dish,Restaurant} =require("../models")
const bcrypt = require('bcryptjs');
const { encrypt, decrypt } = require('../utils/encryption');
const nodemailer = require('nodemailer');
require('dotenv').config();
const jwt = require("jsonwebtoken");
const { Model } = require('sequelize');

// Function to generate a unique restaurant ID
/*const generateRestaurantId = (restaurantName) => {
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
  
    } catch (error) {
      console.error('Error sending  email:', error);
    }
};*/
  


// Login function
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if restaurant exists
    const restaurant = await Restaurant.findOne({ where: { email } });

    if (!restaurant) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if the account is verified
    if (!restaurant.isVerified) {
      return res.status(403).json({ error: "Your account is not verified" });
    }

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, restaurant.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" }); 
    }

    // Generate token with expiration
    const token = jwt.sign(
      { email: restaurant.email, id: restaurant.id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" } 
    );
  console.log(token)
    // Return successful login response
    return res.status(200).json({
      message: "Login successful",
      restaurant: {
        id: restaurant.id,
        email: restaurant.email,
        restaurantName: restaurant.restaurantName,
      },
      token,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};



// Signup function
exports.addRestaurant = async (req, res) => {
  try {
    const { restaurantName, email, phone, address, description, password } = req.body;
    
    if (!restaurantName || !email || !phone || !address || !password || !description) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if email is already registered
    const existingUser = await Restaurant.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash the password correctly
    const hashedPassword = await bcrypt.hash(password, 10);

  // Save the restaurant with the correct password field
    const restaurant = await Restaurant.create({
      restaurantName,
      email,
      phone,
      address,
      description,
      password: hashedPassword 
    });
console.log(restaurant)
    res.status(201).json({
      message: 'Restaurant registered successfully. Our team will contact you for the next step.',
      restaurant: { id: restaurant.id, email: restaurant.email } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating restaurant. Please try again later.' });
  }
};
exports.createDishes = async (req, res) => {
  const restaurantId = req.user.id;

  if (!restaurantId) {
    return res.status(400).json({ message: "No restaurant found" });
  }

  const dishes = req.body.dishes;

  if (!dishes || !Array.isArray(dishes)) {
    return res.status(400).json({ message: "Invalid input, dishes must be an array" });
  }

  const dishData = dishes.map((dish) => ({
    dishName: dish.dishName,
    price: parseFloat(dish.price),
    description: dish.description,
    ingredients: dish.ingredients,
    category: dish.category,
    restaurantId,
    profileImage: dish.images && dish.images.length > 0 ? dish.images[0].name : null, // ✅ pick first image
  }));

  try {
    await Dish.bulkCreate(dishData);
    return res.status(200).json({ message: "Dishes saved successfully" });
  } catch (error) {
    console.error("Error saving dishes:", error);
    return res.status(500).json({ message: "Error saving dishes", error: error.message });
  }
};

// GET /restaurants?page=1&limit=10
exports.getAllRestaurants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Restaurant.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']], 
    });

    res.status(200).json({
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      data: rows, 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving restaurants', error });
  }
};


exports.approveRestaurant =  async (req, res) => {
  try {
    const id = req.params.id;
    
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    restaurant.isVerified = true; 
    await restaurant.save();

    res.json({ message: 'Restaurant approved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to approve restaurant' });
  }
}


// Get a restaurant by ID
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurantId =req.user.id


    const restaurant = await Restaurant.findOne({ where: { id: restaurantId } });
    if (restaurant) {
      res.status(200).json(restaurant);
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (error) {
    console.error('Error retrieving restaurant:', error);
    res.status(500).json({ message: 'Error retrieving restaurant', error });
  }
};

// DELETE /api/restaurant/:id
exports.deleteRestaurantById = async (req, res) => {
  const { id } = req.params;

  try {
    const restaurant = await Restaurant.findByPk(id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    await restaurant.destroy();

    res.status(200).json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting restaurant', error });
  }
};


// DELETE /api/dish/:id
exports.deleteDish = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the dish by ID
    const dish = await Dish.findByPk(id);

    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }


    /*if (dish.restaurantId !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to delete this dish" });
    }*/

    // Delete the dish
    await dish.destroy();

    res.status(200).json({ message: "Dish deleted successfully" });
  } catch (error) {
    console.error("Error deleting dish:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};


// Get dishes by restaurant ID
exports.getDishesByRestaurantId = async (req, res) => {
  try {

    const restaurantId = req.user.id

    // Fetch all dishes associated with the restaurant ID
    const dishes = await Dish.findAll({ where: { restaurantId } });

    if (dishes && dishes.length > 0) {
      res.status(200).json(dishes);
    } else {
      res.status(404).json({ message: 'No dishes found for this restaurant' });
    }
  } catch (error) {
    console.error('Error retrieving dishes:', error);
    res.status(500).json({ message: 'Error retrieving dishes', error });
  }
};



// Get all dishes
exports.getAllDishes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Dish.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']], 
       include: [
        {
          model: Restaurant,
          as:"restaurant",
          attributes: ["id", "restaurantName","description", "address", "phone"]
        }
      ]
    });

    res.status(200).json({
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      data: rows, 
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error retrieving dishes', error });
  }
};

exports.getDishById = async (req, res) => {
  try {
    const { id } = req.params;

    const dish = await Dish.findOne({ where: { id } });

    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }

    res.status(200).json(dish);
  } catch (error) {
    console.error("Error retrieving dish:", error);
    res.status(500).json({ message: "Error retrieving dish", error });
  }
};


exports.upDateRestaurantData = async (req, res) => {
  const {
    restaurantName,
    email,
    phone,
    address,
    description,
    paymentInfo,
    operationalHours
  } = req.body;

  // Check for empty fields

  if (
    !restaurantName || !email || !phone || !address ||
    !description || !paymentInfo || !operationalHours
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const restaurantId = req.user;

  try {
    const restaurant = await Restaurant.findOne({ where: { restaurantId } });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    await Restaurant.update(
      {
        restaurantName,
        email,
        operationalHours,
        paymentInfo,
        phone,
        address,
        description
      },
      { where: { restaurantId } }
    );

    return res.status(200).json({ message: "Restaurant updated successfully"});
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

exports.deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    await restaurant.destroy();

    res.status(200).json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


