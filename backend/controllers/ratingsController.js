const { Restaurant, Dish, Rating } = require('../models');

// ⭐ ADD OR UPDATE DISH RATING
exports.addDishRating = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Please sign in to rate a dish." });
    }

    const userId = req.user.id;
    const { dishId, userRating } = req.body;

    if (!dishId) {
      return res.status(400).json({ error: "Select a dish to rate." });
    }

    if (userRating === undefined) {
      return res.status(400).json({ error: "Choose a rating before submitting." });
    }

    // Check if user already rated this dish
    const existing = await Rating.findOne({ where: { userId, dishId } });

    if (existing) {
      existing.userRating = userRating;
      existing.rating = userRating; // keep same for consistency
      await existing.save();
    } else {
      await Rating.create({
        userId,
        dishId,
        userRating,
        rating: userRating,
      });
    }

    // Recalculate average for the dish
    const allDishRatings = await Rating.findAll({ where: { dishId } });

    const total = allDishRatings.reduce((sum, r) => sum + r.userRating, 0);
    const avg = total / allDishRatings.length;

    await Dish.update(
      { ratings: parseFloat(avg.toFixed(1)) },
      { where: { id: dishId } }
    );

    return res.status(200).json({
      message: "Dish rating added or updated",
      averageRating: parseFloat(avg.toFixed(1)),
    });

  } catch (error) {
    console.error("Error adding dish rating:", error);
    return res.status(500).json({ message: "We couldn't save your rating right now. Please try again." });
  }
};

// ⭐ GET RESTAURANT RATINGS
exports.getRatingsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return res.status(400).json({ error: "Restaurant ID is required" });
    }

    const ratings = await Rating.findAll({ where: { restaurantId } });

    res.status(200).json({ ratings });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ error: "We couldn't load restaurant ratings right now. Please try again." });
  }
};

// ⭐ GET DISH RATINGS
exports.getRatingsByDish = async (req, res) => {
  try {
    const { dishId } = req.params;

    if (!dishId) {
      return res.status(400).json({ error: "Dish ID is required" });
    }

    const ratings = await Rating.findAll({ where: { dishId } });

    res.status(200).json({ ratings });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ error: "We couldn't load dish ratings right now. Please try again." });
  }
};
