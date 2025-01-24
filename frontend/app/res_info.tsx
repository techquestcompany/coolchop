import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  getRestaurantById,
  getDishesByRestaurantId,
  baseURL,
  addDishToCart,
  saveReview,
  saveRating,
  getUserRating,
} from "@/services/api";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";
import LottieView from "lottie-react-native";
import { Ionicons } from "@expo/vector-icons";

const RestaurantInfoScreen = () => {
  const { id } = useLocalSearchParams();
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCartButton, setShowCartButton] = useState(false);
  const bounceAnimation = new Animated.Value(0);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  useEffect(() => {
    if (id) {
      fetchRestaurantInfo(id);
      fetchUserRating();
    }
  }, [id]);

  useEffect(() => {
    if (showCartButton) {
      bounce();
    }
  }, [showCartButton]);

  const fetchUserRating = async () => {
    try {
      const userId = await SecureStore.getItemAsync("userId");

      const response = await getUserRating(userId, id);

      if (response && response.ratings && response.ratings[0].userRating > 0) {
        const userRating = response.ratings[0].userRating;
        setRating(userRating);
      } else {
        setRating(0); 
      }

    } catch (err) {
      console.error("Failed to fetch user rating:", err);
    }
  };

  const fetchRestaurantInfo = async (id) => {
    try {
      const restaurantData = await getRestaurantById(id);
      const dishesData = await getDishesByRestaurantId(id);
      setRestaurant(restaurantData);
      setDishes(dishesData);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to load restaurant information.");
      setIsLoading(false);
    }
  };

  const addToCart = async (dishId) => {
    try {
      const userId = await SecureStore.getItemAsync("userId");

      const response = await addDishToCart(userId, dishId);
      if (response.message == "Item added to cart") {
        Toast.show({ type: "success", text1: "Added to cart!" });
        setShowCartButton(true);
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to add to cart" });
    }
  };

  const bounce = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnimation, {
          toValue: -10,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const categorizeDishes = () => {
    const starters = dishes.filter((dish) => dish.category === "Starter");
    const mainCourse = dishes.filter((dish) => dish.category === "Main Course");
    const dessert = dishes.filter((dish) => dish.category === "Dessert");
    const others = dishes.filter(
      (dish) => !["Starter", "Main Course", "Dessert"].includes(dish.category)
    );
    return { starters, mainCourse, dessert, others };
  };

  const handleRating = async (userRating) => {
    setRating(userRating);

    // Current restaurant rating and reviews
    const currentRating = restaurant.ratings;
    const numberOfReviews = restaurant.reviews;

    // Calculate new rating
    const newRating = (currentRating * numberOfReviews + userRating) / (numberOfReviews + 1);

    try {
      const userId = await SecureStore.getItemAsync("userId");

      const response = await saveRating(userId, restaurant.id, newRating, userRating);
      if (response) {
        Toast.show({ type: "success", text1: "Thanks for your feedback!" });
      } else {
        throw new Error(data.message || "Failed to submit rating.");
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to submit rating." });
    }
  
  };


  const submitReview = async () => {
    const userId = await SecureStore.getItemAsync("userId");

    try {
      const response = await saveReview(userId, id , review);

      if (response.success) {
        Toast.show({ type: "success", text1: "Review submitted!" });
        setReview(""); // Clear the input
      }
    } catch (err) {
      console.error("Failed to save review:", err);
      Toast.show({ type: "error", text1: "Failed to submit review." });
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

  const { starters, mainCourse, dessert, others } = categorizeDishes();

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView style={styles.container}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerText}>
                <Ionicons name="arrow-back" size={24} color="black" style={{position: 'absolute', left: 10,}} onPress={() => router.back()} />
                  {restaurant.restaurantName}
                </Text>
              </View>

              {/* Featured Banner */}
              <View style={styles.banner}>
                <Image
                  style={styles.bannerImage}
                  source={{
                    uri: `${baseURL}/public/uploads/${restaurant.profileImage}`,
                  }}
                  resizeMode="cover"
                />
                <View style={styles.bannerDetails}>
                  <Text style={styles.bannerTitle}>{restaurant.address}</Text>
                  <Text style={styles.bannerSubtitle}>
                    ⭐ {restaurant.ratings} | {restaurant.reviews} reviews
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
                            source={{
                              uri: `${baseURL}/public/uploads/${dish.profileImage}`,
                            }}
                          />
                          <TouchableOpacity
                            style={styles.dishDetails}
                            onPress={() =>
                              router.push(`/dish_info?id=${dish.id}`)
                            }
                          >
                            <Text style={styles.dishName}>{dish.dishName}</Text>
                            <Text style={styles.dishPrice}>
                              ${dish.price.toFixed(2)}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.addCart}
                            onPress={() => addToCart(dish.id)}
                          >
                            <FontAwesome5
                              name="cart-plus"
                              size={24}
                              color="#D32F2F"
                            />
                          </TouchableOpacity>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noDishesText}>
                        No dishes available
                      </Text>
                    )}
                  </View>
                ))}
              </View>

              {/* Rating Section */}
              <View style={styles.ratingSection}>
                <Text style={styles.ratingTitle}>Rate This Restaurant</Text>
                <View style={styles.stars}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleRating(index + 1)}
                    >
                      <FontAwesome
                        name={rating > index ? "star" : "star-o"}
                        size={30}
                        color={rating > index ? "#FFD700" : "#ccc"}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Review Section */}
              <View style={styles.reviewSection}>
                <Text style={styles.reviewTitle}>Leave a Review</Text>
                <TextInput
                  style={styles.reviewInput}
                  placeholder="Write your review here..."
                  value={review}
                  onChangeText={setReview}
                  multiline
                />
              <TouchableOpacity style={styles.submitButton} onPress={submitReview}>
                <Text style={styles.submitButtonText}>Submit Review</Text>
              </TouchableOpacity>

              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
        {showCartButton && (
          <Animated.View
            style={[
              styles.cartButtonContainer,
              { transform: [{ translateY: bounceAnimation }] },
            ]}
          >
            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => router.push("/cart")}
            >
              <LottieView
                source={require("../assets/animations/cart.json")}
                autoPlay
                loop
                style={styles.lottieAnimation}
              />
            </TouchableOpacity>
          </Animated.View>
        )}

        <Toast ref={(ref) => Toast.setRef(ref)} />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingBottom: 20,
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
  addCart: {
    marginTop: 30,
    marginRight: 15,
  },
  cartButtonContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  cartButton: {
    backgroundColor: "#fff",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  lottieAnimation: {
    width: 50,
    height: 50,
  },
  safeArea: { flex: 1, backgroundColor: "#fff" },
  ratingSection: { marginVertical: 20, paddingHorizontal: 15 },
  ratingTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  stars: { flexDirection: "row" },
  reviewSection: { marginVertical: 20, paddingHorizontal: 15 },
  reviewTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  reviewInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: "#FFA500", // Bright orange for visibility
    paddingVertical: 12, // Vertical padding for height
    paddingHorizontal: 20, // Horizontal padding for width
    borderRadius: 8, // Rounded corners
    alignItems: "center", // Center text horizontally
    justifyContent: "center", // Center text vertically
    marginTop: 10, // Space above the button
  },
  submitButtonText: {
    color: "#fff", // White text for contrast
    fontSize: 16, // Readable font size
    fontWeight: "bold", // Bold text for emphasis
  },
  
});

export default RestaurantInfoScreen;
