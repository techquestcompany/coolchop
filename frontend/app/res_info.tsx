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
import { getRestaurantById, getDishesByRestaurantId, baseURL } from "@/services/api"; 
import AntDesign from '@expo/vector-icons/AntDesign';
import Toast from 'react-native-toast-message';


const RestaurantInfoScreen = () => {
  const { id } = useLocalSearchParams();
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchRestaurantInfo(id);
    }
  }, [id]);

  const fetchRestaurantInfo = async (id) => {
    try {
      const restaurantData = await getRestaurantById(id);
      const dishesData = await getDishesByRestaurantId(id);
      setRestaurant(restaurantData);
      setDishes(dishesData);
      console.log(dishes)
      console.log(restaurant)
      setIsLoading(false);
    } catch (err) {
      setError("Failed to load restaurant information.");
      setIsLoading(false);
    }
  };


  const addToCart = async (dishId) => {
    try {
      const userId = await SecureStore.getItemAsync('userId');
      const response = await addToCart(userId, dishId);
      Toast.show({ type: 'success', text1: 'Added to cart!' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to add to cart' });
    }
  };

  
  const categorizeDishes = () => {
    const starters = dishes.filter((dish) => dish.category === "Starter");
    const mainCourse = dishes.filter((dish) => dish.category === "Main Course");
    const dessert = dishes.filter((dish) => dish.category === "Dessert");
    const others = dishes.filter(
      (dish) => !["Starters", "Main Course", "Dessert"].includes(dish.category)
    );
    return { starters, mainCourse, dessert, others };
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

  const { starters, mainCourse, dessert, others } = categorizeDishes();

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>{restaurant.restaurantName}</Text>
      </View>

      {/* Featured Banner */}
      <View style={styles.banner}>
        <Image
          style={styles.bannerImage}
          source={{ uri: `${baseURL}/public/uploads/${restaurant.profileImage}` }}
          resizeMode="cover"
        />
        <View style={styles.bannerDetails}>
          <Text style={styles.bannerTitle}>{restaurant.address}</Text>
          <Text style={styles.bannerSubtitle}>
            ⭐ {restaurant.rating} | {restaurant.reviews} reviews
          </Text>
          <Text style={styles.bannerDelivery}>
            {/* Delivery fee: ${restaurant.deliveryFee.toFixed(2)} */}
          </Text>
        </View>
      </View>

      {/* Menu Sections */}
      <View style={styles.menuTabs}>
        {[
          { title: "Starters", data: starters },
          { title: "Main Course", data: mainCourse },
          { title: "Dessert", data: dessert },
          { title: "Others", data: others },
        ].map(({ title, data }) => (
          <View key={title} style={styles.menuSection}>
            <Text style={styles.menuTitle}>{title}</Text>
            {data.length > 0 ? (
              data.map((dish) => (
                <View key={dish.id} style={styles.dishCard}>
                  <Image
                    style={styles.dishImage}
                    source={{ uri: `${baseURL}/public/uploads/${dish.profileImage}` }}
                  />
                  <View style={styles.dishDetails}>
                    <Text style={styles.dishName}>{dish.dishName}</Text>
                    <Text style={styles.dishPrice}>
                      ${dish.price.toFixed(2)}
                    </Text>
                  </View>

                  <TouchableOpacity onPress={() => addToCart(dish.id)}>
                    <AntDesign name="shoppingcart" size={24} color="black" />
                  </TouchableOpacity>

                </View>
              ))
            ) : (
              <Text style={styles.noDishesText}>No dishes available</Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    backgroundColor: "#fff",
    padding: 15,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  banner: {
    backgroundColor: "#fff",
    padding: 10,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  bannerImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  bannerDetails: {
    marginTop: 10,
    alignItems: "center",
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  bannerSubtitle: {
    fontSize: 16,
    color: "gray",
  },
  bannerDelivery: {
    fontSize: 14,
    color: "gray",
  },
  menuTabs: {
    paddingHorizontal: 15,
    marginTop: 10,
  },
  menuSection: {
    marginBottom: 20,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  dishCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  dishImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  dishDetails: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },
  dishName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dishPrice: {
    fontSize: 14,
    color: "#333",
    marginTop: 5,
  },
  noDishesText: {
    fontSize: 14,
    color: "gray",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default RestaurantInfoScreen;
