import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {
  addToMyCart,
  getMyCart,
  removeFromMyCart,
  setMyCartQuantity,
} from '@/services/api';

const CartContext = createContext(null);

const getCustomerToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('customer_token');
  }
  return SecureStore.getItemAsync('customer_token');
};

const toCartItem = (cartRow) => ({
  id: cartRow.Dish?.id ?? cartRow.dishId,
  Dish: cartRow.Dish,
  quantity: cartRow.quantity,
});

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    const token = await getCustomerToken();
    if (!token) {
      setCartItems([]);
      return [];
    }

    setLoading(true);
    try {
      const rows = await getMyCart(token);
      if (!Array.isArray(rows)) {
        throw new Error('Unexpected cart response from server');
      }
      const items = rows
        .filter((row) => row.Dish)
        .map(toCartItem);
      setCartItems(items);
      return items;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart().catch((error) => {
      console.error('Failed to load cart:', error);
    });
  }, [refreshCart]);

  const addToCart = async (dish) => {
    const token = await getCustomerToken();
    if (!token) {
      throw new Error('Sign in before adding items to the cart.');
    }
    const dishId = dish.Dish?.id ?? dish.id;
    if (!dishId) {
      throw new Error('Cannot add a dish without an ID.');
    }
    await addToMyCart(dishId, 1, token);
    await refreshCart();
  };

  const incrementQuantity = async (dishId) => {
    const token = await getCustomerToken();
    if (!token) {
      throw new Error('Sign in before changing the cart.');
    }
    const current = cartItems.find((item) => item.id === dishId);
    if (!current) return;
    await setMyCartQuantity(dishId, current.quantity + 1, token);
    await refreshCart();
  };

  const decrementQuantity = async (dishId) => {
    const token = await getCustomerToken();
    if (!token) {
      throw new Error('Sign in before changing the cart.');
    }
    const current = cartItems.find((item) => item.id === dishId);
    if (!current) return;
    if (current.quantity <= 1) {
      await removeFromMyCart(dishId, token);
    } else {
      await setMyCartQuantity(dishId, current.quantity - 1, token);
    }
    await refreshCart();
  };

  const removeItem = async (dishId) => {
    const token = await getCustomerToken();
    if (!token) {
      throw new Error('Sign in before changing the cart.');
    }
    await removeFromMyCart(dishId, token);
    await refreshCart();
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        incrementQuantity,
        decrementQuantity,
        removeItem,
        refreshCart,
        clearCart,
        setCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
