import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Animated
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { addDishToCart, baseURL, getDishById, getUserDishRating, saveDishRating, saveDishReview } from "@/services/api";
import * as SecureStore from "expo-secure-store";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Toast from "react-native-toast-message";
import LottieView from "lottie-react-native";

const DishInfoScreen = () => {
  const { id } = useLocalSearchParams();
  const [dish, setDish] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [showCartButton, setShowCartButton] = useState(false);
  const bounceAnimation = new Animated.Value(0);

  useEffect(() => {
    if (id) {
      fetchDish(id);
    }
    fetchUserRating();
  }, [id]);

  useEffect(() => {
    if (showCartButton) {
      bounce();
    }
  }, [showCartButton]);

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


  const fetchUserRating = async () => {
    try {
      const userId = await SecureStore.getItemAsync("userId");

      const response = await getUserDishRating(userId, id);
      console.log(response.ratings)

      if (response && response.ratings && response.ratings[0].userRating > 0) {
        const userRating = response.ratings[0].userRating;
        setRating(userRating); // Fill stars based on the user's saved rating
      } else {
        setRating(0); // No rating found, default to 0
      }
    } catch (err) {
      console.error("Failed to fetch user rating:", err);
    }
  };

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

  const handleRating = async (userRating) => {
    setRating(userRating);

    // Current restaurant rating and reviews
    const currentRating = dish.ratings;
    const numberOfReviews = dish.reviews;

    // Calculate new rating
    const newRating =
      (currentRating * numberOfReviews + userRating) / (numberOfReviews + 1);

    try {
      const userId = await SecureStore.getItemAsync("userId");

      const response = await saveDishRating(
        userId,
        dish.id,
        newRating,
        userRating
      );
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
      const response = await saveDishReview(userId, id, review);

      if (response.success) {
        Toast.show({ type: "success", text1: "Review submitted!" });
        setReview(""); // Clear the input
      }
    } catch (err) {
      console.error("Failed to save review:", err);
      Toast.show({ type: "error", text1: "Failed to submit review." });
    }
  };

  const addToCart = async (event, dishId) => {
    try {
      event.persist();
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView style={styles.container}>
            {/* Dish Image */}
            <Image
              style={styles.dishImage}
              source={{ uri: `${baseURL}/public/uploads/${dish.profileImage}` }}
              resizeMode="cover"
            />

            {/* Dish Details */}
            <View style={styles.detailsContainer}>
              <Text style={styles.title}>{dish.dishName}</Text>
              <Text style={styles.subtitle}>
                ⭐ {dish.ratings} | {dish.reviews} reviews
              </Text>
              <Text style={styles.price}>Price: ₵{dish.price.toFixed(2)}</Text>
              <Text style={styles.description}>{dish.description}</Text>
            </View>

            {/* Order Now Button */}
            <TouchableOpacity style={styles.orderButton}  onPress={(event) => addToCart(event, dish.id)}>
              <Text style={styles.orderButtonText}>Add to Cart</Text>
            </TouchableOpacity>

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
              <TouchableOpacity
                style={styles.submitButton}
                onPress={submitReview}
              >
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
});

export default DishInfoScreen;
