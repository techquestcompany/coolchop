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
  Platform,
  Alert,
} from "react-native";
import { getMyCart, removeFromMyCart, setMyCartQuantity, baseURL, getApiErrorMessage } from "@/services/api";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

interface CartDish {
  id: number;
  dishName: string;
  price: number;
  profileImage?: string | null;
  quantity: number;
}

interface CartResponseItem {
  Dish?: Omit<CartDish, "quantity" | "price"> & { price: number | string } | null;
  quantity: number;
}

const getCustomerToken = async () =>
  Platform.OS === "web"
    ? localStorage.getItem("customer_token")
    : SecureStore.getItemAsync("customer_token");

const getDishImageUri = (profileImage?: string | null): string | null => {
  if (
    typeof profileImage !== "string" ||
    !profileImage.trim() ||
    profileImage === "null"
  ) {
    return null;
  }

  if (/^https?:\/\//i.test(profileImage)) return profileImage;

  return encodeURI(
    `${baseURL.replace(/\/api\/?$/, "")}/public/uploads/${profileImage}`
  );
};

const CartScreen = () => {
  const [cartItems, setCartItems] = useState<CartDish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getCustomerToken();
      if (!token) throw new Error("Please sign in to view your cart.");
      const items: CartResponseItem[] = await getMyCart(token);
      if (!Array.isArray(items)) throw new Error("Unexpected cart response from server");
      setCartItems(items.flatMap((item) => {
        const dish = item.Dish;
        if (!dish) return [];
        return [{ ...dish, price: Number(dish.price), quantity: item.quantity }];
      }));
    } catch (err) {
      console.error("Failed to fetch cart items:", err);
      setError(getApiErrorMessage(err, "We couldn't load your cart. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (dishId: number) => {
    try {
      const token = await getCustomerToken();
      if (!token) throw new Error("Please sign in to update your cart.");
      await removeFromMyCart(dishId, token);
      setCartItems(cartItems.filter((item) => item.id !== dishId));
    } catch (err) {
      console.error("Failed to remove item:", err);
      Alert.alert("Unable to remove item", getApiErrorMessage(err, "We couldn't remove that item. Please try again."));
    }
  };

  const handleQuantityChange = async (dishId: number, newQuantity: number) => {
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
      Alert.alert("Unable to update quantity", getApiErrorMessage(err, "We couldn't update the quantity. Please try again."));
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchCartItems}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={<Text style={styles.title}>Your Cart</Text>}
        ListEmptyComponent={<Text style={styles.emptyText}>Your cart is empty</Text>}
        renderItem={({ item }) => {
          const imageUri = getDishImageUri(item.profileImage);

          return (
            <View style={styles.item}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.image} />
              ) : null}
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
          );
        }}
        ListFooterComponent={(
          <>
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
            <TouchableOpacity style={styles.viewOrderButton} onPress={handleSaveOrder}>
              <Text style={styles.viewOrderText}>VIEW ORDER</Text>
            </TouchableOpacity>
          </>
        )}
      />
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
  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#ffa500",
    borderRadius: 6,
  },
  retryText: { color: "#fff", fontWeight: "bold" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CartScreen;
