import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import {
  getUserData,
  addDishToCart,
  updateCartQuantity,
  deleteCartItem
} from '@/services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  /** Load cart from backend on mount */
  useEffect(() => {
    const loadCart = async () => {
      try {
        const token = await SecureStore.getItemAsync('customer_token'); // ✅ FIXED
        if (!token) return;

        const user = await getUserData(token);
        console.log("Loaded user:", user);

        // TODO: fetch user cart if backend supports it
        // const userCart = await getUserCart(user.id, token);
        // setCartItems(userCart || []);
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    };
    loadCart();
  }, []);

  /** Add dish to cart */
  const addToCart = async (item) => {
    try {
      const token = await SecureStore.getItemAsync('customer_token'); // ✅ FIXED
      if (!token) return;

      const user = await getUserData(token);

      setCartItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [...prev, { ...item, quantity: 1 }];
      });

      // Sync with backend
      await addDishToCart(user.id, item.id, 1, token);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  /** Increment quantity */
  const incrementQuantity = async (dishId) => {
    try {
      const token = await SecureStore.getItemAsync('customer_token'); // ✅ FIXED
      if (!token) return;

      const user = await getUserData(token);

      setCartItems((prev) =>
        prev.map((item) => {
          if (item.id === dishId) {
            const newQty = item.quantity + 1;
            updateCartQuantity(user.id, dishId, newQty, token).catch(console.error);
            return { ...item, quantity: newQty };
          }
          return item;
        })
      );
    } catch (err) {
      console.error('Failed to increment quantity:', err);
    }
  };

  /** Decrement quantity */
  const decrementQuantity = async (dishId) => {
    try {
      const token = await SecureStore.getItemAsync('customer_token'); // ✅ FIXED
      if (!token) return;

      const user = await getUserData(token);

      setCartItems((prev) =>
        prev.flatMap((item) => {
          if (item.id === dishId) {
            const newQty = item.quantity - 1;
            if (newQty > 0) {
              updateCartQuantity(user.id, dishId, newQty, token).catch(console.error);
              return { ...item, quantity: newQty };
            } else {
              deleteCartItem(dishId, token).catch(console.error);
              return []; // remove completely
            }
          }
          return [item];
        })
      );
    } catch (err) {
      console.error('Failed to decrement quantity:', err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems: cartItems ?? [], // ✅ ALWAYS SAFE
        addToCart,
        incrementQuantity,
        decrementQuantity,
        clearCart: () => setCartItems([]),
        setCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
