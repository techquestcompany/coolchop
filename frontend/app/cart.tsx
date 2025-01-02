import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { getCartItems, deleteFromCart, getDishById, baseURL } from "@/services/api";
import * as SecureStore from "expo-secure-store";

const CartScreen = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const userId = await SecureStore.getItemAsync("userId");

      // Fetch the dish IDs in the cart
      const items = await getCartItems(userId);

      // Fetch details for each dish
      const dishPromises = items.map(async (item) => {
        const dish = await getDishById(item.id);
        return {
          ...dish,
          id: item.id,
        };
      });

      const dishes = await Promise.all(dishPromises);
      setCartItems(dishes);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch cart items:", err);
      setError("Failed to load cart items.");
      setIsLoading(false);
    }
  };

  const handleRemove = async (dishId) => {
    try {
      const userId = await SecureStore.getItemAsync("userId");

      await deleteFromCart(userId, dishId);
      setCartItems(cartItems.filter((item) => item.id !== dishId));
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ffa500" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>
      {cartItems.length === 0 ? (
        <Text style={styles.emptyText}>Your cart is empty</Text>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Image source={{ uri: `${baseURL}/public/uploads/${item.profileImage}` }} style={styles.image} />
              <View style={styles.details}>
                <Text style={styles.name}>{item.dishName}</Text>
                <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemove(item.id)}>
                <Text style={styles.remove}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "gray",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  price: {
    fontSize: 14,
    color: "gray",
  },
  remove: {
    color: "red",
    fontWeight: "bold",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CartScreen;
