const {Cart,Dish} = require('../models');

// ADD TO CART
exports.addToCart = async (req, res) => {
  const userId = req.user.id; // ⭐ From token middleware
  const { dishId, quantity } = req.body;
  const requestedQuantity = quantity === undefined ? 1 : Number(quantity);

  if (!Number.isInteger(Number(dishId)) || Number(dishId) < 1) {
    return res.status(400).json({ message: 'A valid dishId is required' });
  }
  if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1 || requestedQuantity > 99) {
    return res.status(400).json({ message: 'quantity must be between 1 and 99' });
  }

  try {
    const dish = await Dish.findByPk(dishId);
    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    // Check if item already exists
    const existingItem = await Cart.findOne({ where: { userId, dishId } });

    if (existingItem) {
      if (existingItem.quantity + requestedQuantity > 99) {
        return res.status(400).json({ message: 'Cart quantity cannot exceed 99' });
      }
      existingItem.quantity += requestedQuantity;
      await existingItem.save();

      return res.status(200).json({ message: 'Item quantity updated in cart' });
    }

    // Add new item
    await Cart.create({
      userId,
      dishId,
      quantity: requestedQuantity
    });

    res.status(201).json({ message: 'Item added to cart' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: "We couldn't add that item to your cart. Please try again." });
  }
};

// GET USER CART
exports.getCart = async (req, res) => {
  const userId = req.user.id;

  try {
    const cartItems = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Dish,
          as: 'Dish',
        }
      ]
    });

    res.status(200).json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: "We couldn't load your cart right now. Please try again." });
  }
};


// REMOVE FROM CART
exports.removeFromCart = async (req, res) => {
  const userId = req.user.id;
  const { dishId } = req.body;

  if (!Number.isInteger(Number(dishId)) || Number(dishId) < 1) {
    return res.status(400).json({ message: 'A valid dishId is required' });
  }

  try {
    await Cart.destroy({ where: { userId, dishId } });

    res.status(200).json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: "We couldn't remove that item from your cart. Please try again." });
  }
};

// UPDATE CART QUANTITY
exports.updateCartQuantity = async (req, res) => {
  const userId = req.user.id;
  const { dishId, quantity } = req.body;

  const requestedQuantity = Number(quantity);
  if (!Number.isInteger(Number(dishId)) || Number(dishId) < 1) {
    return res.status(400).json({ message: 'A valid dishId is required' });
  }
  if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1 || requestedQuantity > 99) {
    return res.status(400).json({ message: 'quantity must be between 1 and 99' });
  }

  try {
    const cartItem = await Cart.findOne({ where: { userId, dishId } });

    if (!cartItem) {
      return res.status(404).json({ message: 'Dish not found in cart' });
    }

    cartItem.quantity = requestedQuantity;
    await cartItem.save();

    res.status(200).json({ message: 'Cart item quantity updated', cartItem });
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    res.status(500).json({ message: "We couldn't update the item quantity. Please try again." });
  }
};
