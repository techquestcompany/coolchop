import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { getMyRestaurantDishes, deleteDish, baseURL, getApiErrorMessage } from "@/services/api";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { getStoredToken } from "@/services/authStorage";

const ManageDishes = () => {
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchDishes();
  }, []);

  useEffect(() => {
    handleFilter(search);
  }, [search, dishes]);

 const fetchDishes = async () => {
  try {
    setLoading(true);

    const token = await getStoredToken("restaurant_token");

    if (!token) {
      Toast.show({ type: "error", text1: "Token not found. Please login again." });
      setLoading(false);
      return;
    }

    const response = await getMyRestaurantDishes(token);
    setDishes(response);
    setFilteredDishes(response);
    setLoading(false);
  } catch (err) {
    console.error("Failed to fetch dishes:", err);
    Toast.show({
      type: "error",
      text1: "Unable to load dishes",
      text2: getApiErrorMessage(err, "We couldn't load your dishes. Please try again."),
    });
    setLoading(false);
  }
};


  // Filter dishes by name
  const handleFilter = (text) => {
    setSearch(text);
    if (!text) {
      setFilteredDishes(dishes);
    } else {
      const filtered = dishes.filter((dish) =>
        dish.dishName.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredDishes(filtered);
    }
  };

  // Delete a dish
  const handleDelete = (dishId) => {
    Alert.alert(
      "Delete Dish",
      "Are you sure you want to delete this dish?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
  try {
    const token = await getStoredToken("restaurant_token");
    if (!token) {
      Toast.show({ type: "error", text1: "You must be logged in to delete a dish." });
      return;
    }

    await deleteDish(dishId, token); 
    Toast.show({ type: "success", text1: "Dish deleted successfully!" });
    fetchDishes(); // Refresh list
  } catch (err) {
    console.error(err);
    Toast.show({
      type: "error",
      text1: "Unable to delete dish",
      text2: getApiErrorMessage(err, "We couldn't delete this dish. Please try again."),
    });
  }
},

        },
      ]
    );
  };

  const renderDish = ({ item }) => (
    <View style={styles.dishCard}>
      {/* Dish Image */}
      <Image
        source={{ uri: `${baseURL}/public/uploads/${item.profileImage}`  }}
        style={styles.dishImage}
        resizeMode="cover"
      />

      {/* Dish Details */}
      <View style={styles.dishDetails}>
        <Text style={styles.dishName}>{item.dishName}</Text>
        <Text style={styles.dishPrice}>₵{Number(item.price).toFixed(2)}</Text>
        <Text numberOfLines={2} style={styles.dishDescription}>
          {item.description}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
       
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  if (!filteredDishes.length) {
    return (
      <View style={styles.center}>
        <Text>No dishes found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search dishes..."
        value={search}
        onChangeText={handleFilter}
      />

      <FlatList
        data={filteredDishes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderDish}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  dishCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    overflow: "hidden",
  },
  dishImage: { width: "100%", height: 180 },
  dishDetails: { padding: 12 },
  dishName: { fontSize: 18, fontWeight: "bold" },
  dishPrice: { fontSize: 16, color: "#FFA500", marginVertical: 4 },
  dishDescription: { fontSize: 14, color: "#555" },
  actions: { flexDirection: "row", justifyContent: "flex-end", padding: 12 },
  editButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: "#F44336",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});

export default ManageDishes;
