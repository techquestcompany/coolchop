const {Cart,Dish} = require('../models');

// ADD TO CART
exports.addToCart = async (req, res) => {
  const userId = req.user.id; // ⭐ From token middleware
  const { dishId, quantity } = req.body;

  if (!dishId) {
    return res.status(400).json({ message: 'dishId is required' });
  }

  try {
    // Check if item already exists
    const existingItem = await Cart.findOne({ where: { userId, dishId } });

    if (existingItem) {
      existingItem.quantity += quantity || 1;
      await existingItem.save();

      return res.status(200).json({ message: 'Item quantity updated in cart' });
    }

    // Add new item
    await Cart.create({
      userId,
      dishId,
      quantity: quantity || 1
    });

    res.status(201).json({ message: 'Item added to cart' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Error adding to cart' });
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
    res.status(500).json({ message: 'Error fetching cart' });
  }
};


// REMOVE FROM CART
exports.removeFromCart = async (req, res) => {
  const userId = req.user.id;
  const { dishId } = req.body;

  if (!dishId) {
    return res.status(400).json({ message: 'dishId is required' });
  }

  try {
    await Cart.destroy({ where: { userId, dishId } });

    res.status(200).json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Error removing from cart' });
  }
};

// UPDATE CART QUANTITY
exports.updateCartQuantity = async (req, res) => {
  const userId = req.user.id;
  const { dishId, quantity } = req.body;

  if (!dishId || quantity === undefined) {
    return res.status(400).json({ message: 'dishId and quantity are required' });
  }

  try {
    const cartItem = await Cart.findOne({ where: { userId, dishId } });

    if (!cartItem) {
      return res.status(404).json({ message: 'Dish not found in cart' });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({ message: 'Cart item quantity updated', cartItem });
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    res.status(500).json({ message: 'Error updating cart quantity' });
  }
};
