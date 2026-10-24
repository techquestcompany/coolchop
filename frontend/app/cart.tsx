import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Platform,
} from "react-native";
import { getMyCart, removeFromMyCart, setMyCartQuantity, baseURL } from "@/services/api";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

const getCustomerToken = async () =>
  Platform.OS === "web"
    ? localStorage.getItem("customer_token")
    : SecureStore.getItemAsync("customer_token");

const CartScreen = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const token = await getCustomerToken();
      if (!token) throw new Error("Please sign in to view your cart.");
      const items = await getMyCart(token);
      setCartItems(items.filter((item) => item.Dish).map((item) => ({
        ...item.Dish,
        quantity: item.quantity,
      })));
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch cart items:", err);
      setError("Failed to load cart items.");
      setIsLoading(false);
    }
  };

  const handleRemove = async (dishId) => {
    try {
      const token = await getCustomerToken();
      if (!token) throw new Error("Please sign in to update your cart.");
      await removeFromMyCart(dishId, token);
      setCartItems(cartItems.filter((item) => item.id !== dishId));
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  const handleQuantityChange = async (dishId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const token = await getCustomerToken();
      if (!token) throw new Error("Please sign in to update your cart.");
      await setMyCartQuantity(dishId, newQuantity, token);
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === dishId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err) {
      console.error("Failed to update quantity:", err);
    }
  };

  const handleSaveOrder = async () => {
    router.push({ pathname: "/InitTransaction", params: { note } });
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
      <ScrollView>
        <Text style={styles.title}>Your Cart</Text>
        {cartItems.length === 0 ? (
          <Text style={styles.emptyText}>Your cart is empty</Text>
        ) : (
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Image
                  source={{ uri: `${baseURL}/public/uploads/${item.profileImage}` }}
                  style={styles.image}
                />
                <View style={styles.details}>
                  <Text style={styles.name}>{item.dishName}</Text>
                  <Text style={styles.price}>₵{item.price.toFixed(2)}</Text>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
                    >
                      <Text style={styles.circleButton}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantity}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      <Text style={styles.circleButton}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleRemove(item.id)}>
                  <Text style={styles.remove}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leave a note for the restaurant</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Type your suggestion here..."
            multiline
            value={note}
            onChangeText={setNote}
          />
        </View>

        {/* View Order Button */}
        <TouchableOpacity style={styles.viewOrderButton} onPress={handleSaveOrder}>
          <Text style={styles.viewOrderText}>VIEW ORDER</Text>
        </TouchableOpacity>
      </ScrollView>
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
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  circleButton: {
    fontSize: 20,
    marginHorizontal: 10,
    color: "#ffa500",
  },
  quantity: {
    fontSize: 16,
    fontWeight: "bold",
  },
  section: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  noteInput: {
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 5,
    height: 100,
    textAlignVertical: "top",
  },
  viewOrderButton: {
    backgroundColor: "#ffa500",
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 10,
    marginVertical: 15,
  },
  viewOrderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CartScreen;
