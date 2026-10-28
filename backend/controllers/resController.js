const {Dish,Restaurant} =require("../models")
const bcrypt = require('bcryptjs');
const { encrypt, decrypt } = require('../utils/encryption');
const nodemailer = require('nodemailer');
const { Op } = require("sequelize");
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

    if (!email || !password) {
      return res.status(400).json({ error: "Enter your email address and password to sign in." });
    }

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
      { email: restaurant.email, id: restaurant.id, role: "restaurant" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" } 
    );
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
    console.error("Restaurant sign-in failed:", error);
    res.status(500).json({ error: "We couldn't sign you in right now. Please try again in a few minutes." });
  }
};



// Signup function
exports.addRestaurant = async (req, res) => {
  try {
    const { restaurantName, email, phone, address, description, password } = req.body;
    
    if (!restaurantName || !email || !phone || !address || !password || !description) {
      return res.status(400).json({ error: 'Enter the restaurant name, email, phone, address, description, and password.' });
    }

    // Check if email is already registered
    const existingUser = await Restaurant.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'That email address is already associated with a restaurant account.' });
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
    res.status(201).json({
      message: 'Restaurant registered successfully. Our team will contact you for the next step.',
      restaurant: { id: restaurant.id, email: restaurant.email } 
    });
  } catch (error) {
    console.error("Restaurant registration failed:", error);
    res.status(500).json({ error: "We couldn't create your restaurant account right now. Please try again." });
  }
};
exports.createDishes = async (req, res) => {
  const restaurantId = req.user.id;

  if (!restaurantId) {
    return res.status(400).json({ message: "No restaurant found" });
  }

  const dishes = req.body.dishes;

  if (
    !Array.isArray(dishes) ||
    dishes.length === 0 ||
    dishes.some(
      (dish) =>
        typeof dish?.dishName !== "string" ||
        !dish.dishName.trim() ||
        !Number.isFinite(Number(dish.price)) ||
        Number(dish.price) < 0
    )
  ) {
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
    return res.status(500).json({ message: "We couldn't save your dishes right now. Please try again." });
  }
};

// GET /restaurants?page=1&limit=10
exports.getAllRestaurants = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Math.min(Number.parseInt(req.query.limit, 10) || 10, 50);
    if (page < 1 || limit < 1) {
      return res.status(400).json({ message: "Invalid page or limit" });
    }
    const offset = (page - 1) * limit;

    const { count, rows } = await Restaurant.findAndCountAll({
      attributes: { exclude: ["password"] },
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
    console.error("Error retrieving restaurants:", error);
    res.status(500).json({ message: "We couldn't load restaurants right now. Please try again." });
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
    console.error("Error approving restaurant:", error);
    res.status(500).json({ message: "We couldn't approve this restaurant right now. Please try again." });
  }
}


// Get a restaurant by ID
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurantId =req.user.id


    const restaurant = await Restaurant.findOne({
      where: { id: restaurantId },
      attributes: { exclude: ["password"] },
    });
    if (restaurant) {
      res.status(200).json(restaurant);
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (error) {
    console.error('Error retrieving restaurant:', error);
    res.status(500).json({ message: "We couldn't load restaurant details right now. Please try again." });
  }
};

exports.getPublicRestaurantById = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ message: "A valid restaurant ID is required" });
  }

  try {
    const restaurant = await Restaurant.findByPk(id, {
      attributes: ["id", "restaurantName", "description", "address", "phone", "profileImage", "ratings", "reviews"],
    });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    return res.status(200).json(restaurant);
  } catch (error) {
    console.error("Error retrieving restaurant:", error.message);
    return res.status(500).json({ message: "We couldn't load restaurant details right now. Please try again." });
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
    res.status(500).json({ message: "We couldn't delete this restaurant right now. Please try again." });
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


    if (Number(dish.restaurantId) !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to delete this dish" });
    }

    // Delete the dish
    await dish.destroy();

    res.status(200).json({ message: "Dish deleted successfully" });
  } catch (error) {
    console.error("Error deleting dish:", error);
    res.status(500).json({ message: "We couldn't delete this dish right now. Please try again." });
  }
};

exports.getDishesForRestaurant = async (req, res) => {
  const restaurantId = Number(req.params.restaurantId);
  if (!Number.isInteger(restaurantId) || restaurantId < 1) {
    return res.status(400).json({ message: "A valid restaurant ID is required" });
  }

  try {
    const dishes = await Dish.findAll({
      where: { restaurantId },
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json(dishes);
  } catch (error) {
    console.error("Error retrieving restaurant dishes:", error.message);
    return res.status(500).json({ message: "We couldn't load this restaurant's dishes right now. Please try again." });
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
    res.status(500).json({ message: "We couldn't load this restaurant's dishes right now. Please try again." });
  }
};



// Get all dishes
exports.getAllDishes = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Math.min(Number.parseInt(req.query.limit, 10) || 10, 50);
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    if (page < 1 || limit < 1 || search.length > 100) {
      return res.status(400).json({ message: "Invalid page, limit, or search value" });
    }
    const offset = (page - 1) * limit;

    const { count, rows } = await Dish.findAndCountAll({
      where: search ? { dishName: { [Op.like]: `%${search}%` } } : undefined,
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
    console.error("Error retrieving dishes:", error);
    res.status(500).json({ message: "We couldn't load dishes right now. Please try again." });
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
    res.status(500).json({ message: "We couldn't load this dish right now. Please try again." });
  }
};


exports.updateRestaurantProfile = async (req, res) => {
  const allowedFields = ["restaurantName", "email", "phone", "address", "description"];
  const updates = Object.fromEntries(
    allowedFields
      .filter((field) => Object.prototype.hasOwnProperty.call(req.body, field))
      .map((field) => [field, req.body[field]])
  );
  const hasInvalidValue = Object.values(updates).some(
    (value) => typeof value !== "string" || !value.trim()
  );

  if (
    Object.keys(updates).length === 0 ||
    Object.keys(req.body).some((field) => !allowedFields.includes(field)) ||
    hasInvalidValue
  ) {
    return res.status(400).json({ message: "Provide valid restaurant profile fields only" });
  }

  try {
    const restaurant = await Restaurant.findByPk(req.user.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    await restaurant.update(
      Object.fromEntries(
        Object.entries(updates).map(([field, value]) => [field, value.trim()])
      )
    );
    return res.status(200).json({
      message: "Restaurant profile updated successfully",
      restaurant: await Restaurant.findByPk(req.user.id, {
        attributes: { exclude: ["password"] },
      }),
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "Email, phone, or address is already in use" });
    }
    console.error("Restaurant profile update failed:", error.message);
    return res.status(500).json({ message: "Could not update restaurant profile" });
  }
};

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

exports.searchRestaurants = async (req, res) => {
  try {
    const searchQuery = req.query.q || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Restaurant.findAndCountAll({
      where: {
        [Op.or]: [
          { restaurantName: { [Op.iLike]: `%${searchQuery}%` } },
          { address: { [Op.iLike]: `%${searchQuery}%` } },
          { description: { [Op.iLike]: `%${searchQuery}%` } },
        ],
        isVerified: true,
      },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "restaurantName",
        "address",
        "phone",
        "description",
      ],
    });

    res.status(200).json({
      success: true,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (error) {
    console.error("Restaurant search error:", error);
    res.status(500).json({ message: "Search failed" });
  }
};



// GET /api/dishes/search?q=rice&page=1&limit=10
exports.searchDishes = async (req, res) => {
  try {
    const searchQuery = req.query.q || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Dish.findAndCountAll({
      where: {
        [Op.or]: [
          { dishName: { [Op.iLike]: `%${searchQuery}%` } },
          { category: { [Op.iLike]: `%${searchQuery}%` } },
          { ingredients: { [Op.iLike]: `%${searchQuery}%` } },
        ],
      },
      include: [
        {
          model: Restaurant,
          as: "restaurant",
          attributes: ["id", "restaurantName", "address"],
          where: { isVerified: true },
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (error) {
    console.error("Dish search error:", error);
    res.status(500).json({ message: "Search failed" });
  }
};

