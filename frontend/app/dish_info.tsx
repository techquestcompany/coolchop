import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getDishById } from "@/services/api"; 

const DishInfoScreen = () => {
  const { id } = useLocalSearchParams();
  const [dish, setDish] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchDish(id);
    }
  }, [id]);

  const fetchDish = async (id) => {
    try {
      const response = await getDishById(id);
      setDish(response);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to fetch dish details.");
      setIsLoading(false);
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
    <ScrollView style={styles.container}>
      {/* Dish Image */}
      <Image
        style={styles.dishImage}
        source={{ uri: `${dish.image}` }}
        resizeMode="cover"
      />

      {/* Dish Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{dish.name}</Text>
        <Text style={styles.subtitle}>⭐ {dish.rating} | {dish.reviews} reviews</Text>
        <Text style={styles.price}>Price: ${dish.price.toFixed(2)}</Text>
        <Text style={styles.description}>{dish.description}</Text>
      </View>

      {/* Order Now Button */}
      <TouchableOpacity style={styles.orderButton}>
        <Text style={styles.orderButtonText}>Order Now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  dishImage: {
    width: "100%",
    height: 250,
  },
  detailsContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "gray",
    marginBottom: 16,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffa500",
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  orderButton: {
    margin: 16,
    backgroundColor: "#ffa500",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  orderButtonText: {
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

export default DishInfoScreen;
