const {Review} = require('../models');

// Add a new review for a restaurant
exports.addReview = async (req, res) => {
  try {
    const { userId, restaurantId, content } = req.body;

    if (!userId || !restaurantId || !content) {
      return res.status(400).json({ error: 'Enter your review and the restaurant it is for.' });
    }

    const newReview = await Review.create({
      userId,
      restaurantId,
      content,
    });

    res.status(201).json({
      message: 'Review added successfully',
      data: newReview,
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ error: "We couldn't save your review right now. Please try again." });
  }
};

// Get all reviews for a restaurant
exports.getReviewsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }

    const reviews = await Review.findAll({ where: { restaurantId } });

    res.status(200).json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: "We couldn't load restaurant reviews right now. Please try again." });
  }
};

exports.addDishReview = async (req, res) => {
  try {
    const userId = req.user.id; // ⭐ FROM TOKEN ONLY
    const { dishId, review } = req.body;

    if (!dishId || !review) {
      return res.status(400).json({ error: "Choose a dish and enter your review." });
    }

    const newReview = await Review.create({
      userId,
      dishId,
      review,
    });

    res.status(201).json({
      message: "Dish review added successfully",
      data: newReview,
    });
  } catch (error) {
    console.error("Error adding dish review:", error);
    res.status(500).json({ error: "We couldn't save your review right now. Please try again." });
  }
};



// Get all reviews for a dish
exports.getReviewsByDish = async (req, res) => {
  try {
    const { dishId } = req.params;

    if (!dishId) {
      return res.status(400).json({ error: 'Dish ID is required' });
    }

    const reviews = await Review.findAll({ where: { dishId } });

    res.status(200).json({ reviews });
  } catch (error) {
    console.error('Error fetching dish reviews:', error);
    res.status(500).json({ error: "We couldn't load dish reviews right now. Please try again." });
  }
};
