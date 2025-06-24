import React, { createContext, useContext, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getUserData, getAllDishes, baseURL,addDishToCart,updateCartQuantity,deleteCartItem} from '@/services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = async (item) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const userData = await getUserData(token);
      const userId = userData.id;

      // Sync with backend
      await addDishToCart(userId, item.id, 1, token);

      // Update local cart state
      setCartItems((prevItems) => {
        const existingItem = prevItems.find((cartItem) => cartItem.id === item.id);
        if (existingItem) {
          return prevItems.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          );
        } else {
          return [...prevItems, { ...item, quantity: 1 }];
        }
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const incrementQuantity = async (dishId) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const userData = await getUserData(token);
  
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === dishId ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
  
      const item = cartItems.find((i) => i.id === dishId);
      await updateCartQuantity( dishId, item.quantity + 1, token);
    } catch (error) {
      console.error('Failed to increment quantity:', error.response?.data);
    }
  };
  
  const decrementQuantity = async (dishId) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const userData = await getUserData(token);
      const item = cartItems.find((i) => i.id === dishId);
  
      if (item.quantity > 1) {
        setCartItems((prevItems) =>
          prevItems.map((i) =>
            i.id === dishId ? { ...i, quantity: i.quantity - 1 } : i
          )
        );
  
        await updateCartQuantity(userData.id, dishId, item.quantity - 1, token);
      } else {
        setCartItems((prevItems) =>
          prevItems.filter((i) => i.id !== dishId)
        );
  
        await deleteCartItem(dishId, token);
      }
    } catch (error) {
      console.error('Failed to decrement quantity:',error.response?.data);
    }
  };
  
const clearCart = async ()=>{ setCartItems([]) }
  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        incrementQuantity,
        decrementQuantity,
        setCartItems,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
