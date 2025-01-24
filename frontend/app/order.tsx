import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import MapView, { Marker, Polyline  } from "react-native-maps";
import axios from "axios";
import {
  fetchOrder,
  getDishById,
  getRestaurantById,
  getUserData,
} from "@/services/api";
import * as SecureStore from "expo-secure-store";

export default function OrderSummary() {
  const [orderDetails, setOrderDetails] = useState([]);
  const [user, setUser] = useState([]);
  const [restaurant, setRestaurant] = useState([]);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      const user_id = await SecureStore.getItemAsync("userId");
      const response = await fetchOrder(user_id);

      const items = JSON.parse(response[0].items);

      const detailedOrderDetails = [];
      const restaurantMap = new Map();

      for (const item of items) {
        const dishData = await getDishById(item.id);

        detailedOrderDetails.push({
          ...item,
          dishName: dishData.dishName,
          price: dishData.price,
          restaurantId: dishData.restaurantId,
        });

        if (!restaurantMap.has(dishData.restaurantId)) {
          const restaurantData = await getRestaurantById(dishData.restaurantId);
          restaurantMap.set(dishData.restaurantId, restaurantData);
        }
      }

      setOrderDetails(detailedOrderDetails);

      // If there are multiple restaurants, concatenate their names
      const restaurantNames = Array.from(restaurantMap.values())
        .map((restaurant) => restaurant.restaurantName)
        .join(" & ");
      const chosenRestaurantData = Array.from(restaurantMap.values())[0];

      setRestaurant({
        ...chosenRestaurantData,
        restaurantName: restaurantNames,
      });

      const userData = await getUserData(user_id);
      setUser(userData);

      // Calculate totals
      const deliveryLocation = {
        latitude: userData.latitude,
        longitude: userData.longitude,
      };
      const firstRestaurantLocation = {
        latitude: chosenRestaurantData.latitude,
        longitude: chosenRestaurantData.longitude,
      };

      const total = detailedOrderDetails.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const distance = calculateDistance(
        firstRestaurantLocation,
        deliveryLocation
      );
      const fee = calculateDeliveryFee(distance);

      setTotalAmount(total + fee);
      setDeliveryFee(fee);
    } catch (error) {
      console.error("Error fetching order details:", error);
      Alert.alert("Error", "Failed to load order details.");
    }
  };

  const calculateDistance = (restaurantLocation, userLocation) => {
    const R = 6371; // Earth's radius in km
    const dLat =
      ((userLocation.latitude - restaurantLocation.latitude) * Math.PI) / 180;
    const dLon =
      ((userLocation.longitude - restaurantLocation.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((restaurantLocation.latitude * Math.PI) / 180) *
        Math.cos((userLocation.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const calculateDeliveryFee = (distance) => {
    return distance * 2;
  };

  const handleRepeatOrder = () => {
    Alert.alert("Repeat Order", "Order has been repeated!");
    // Add logic to repeat order
  };

  const handleEditOrder = () => {
    // navigation.navigate("EditOrder", { orderId });
  };

  const handleDeleteOrder = async () => {
    try {
      await axios.delete(`/orders/${orderId}`);
      Alert.alert("Success", "Order has been deleted!");
      // navigation.goBack();
    } catch (error) {
      console.error("Error deleting order:", error);
      Alert.alert("Error", "Failed to delete the order.");
    }
  };

  const handlePlaceOrder = async () => {
    try {
      const response = await axios.post("/orders/place", {
        orderId: orderDetails[0]?.id, // Adjust based on your backend logic
      });

      if (response.data.status === "success") {
        Alert.alert("Order Placed", "Waiting for the restaurant to accept.");
        setOrderPlaced(true);
      } else {
        Alert.alert("Error", "Failed to place the order.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  const handleTrackOrder = () => {
    navigation.navigate("TrackOrder", { orderId: orderDetails[0]?.id });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Your Order Summary</Text>
      </View>

      {/* Order Details */}
      <ScrollView style={styles.orderDetails}>
        <View style={styles.restaurantDetails}>
          <Text style={styles.restaurantName}>
            {restaurant.restaurantName || "Loading..."}
          </Text>
          <Text style={styles.serviceCharge}>
            Service Charge: GHS {deliveryFee.toFixed(2)}
          </Text>
          {orderDetails.length > 0 &&
            Object.entries(
              orderDetails.reduce((grouped, item) => {
                if (!grouped[item.restaurantId]) {
                  grouped[item.restaurantId] = {
                    restaurantName: restaurant.restaurantName, 
                    dishes: [],
                  };
                }
                grouped[item.restaurantId].dishes.push(item);
                return grouped;
              }, {})
            ).map(([restaurantId, restaurantData], index) => (
              <View key={restaurantId} style={styles.restaurantSection}>
                <Text style={styles.restaurantName}>
                  {restaurantData.restaurantName || "Restaurant Name"}{" "}
                  {/* Handle missing name */}
                </Text>
                {restaurantData.dishes.map((dish, idx) => (
                  <View style={styles.itemRow} key={idx}>
                    <Text>{`${dish.quantity}x ${dish.dishName}`}</Text>
                    <Text>{`GHS ${(dish.quantity * dish.price).toFixed(
                      2
                    )}`}</Text>
                  </View>
                ))}
              </View>
            ))}
        </View>

        {/* Actions */}
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={handleRepeatOrder}>
            <Text style={styles.repeatOrder}>Repeat Order</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleEditOrder}>
            <Text style={styles.editOrder}>Edit Order</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteOrder}>
            <Text style={styles.deleteOrder}>Delete Order</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Map View */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: user.latitude,
          longitude: user.longitude,
          latitudeDelta: 2.5,
          longitudeDelta: 2.5,
        }}
      >
        {restaurant && (
          <Marker
            coordinate={{
              latitude: restaurant.latitude,
              longitude: restaurant.longitude,
            }}
            title={restaurant.restaurantName}
            description="Restaurant Location"
          />
        )}
        <Marker
          coordinate={{ latitude: user.latitude, longitude: user.longitude }}
          title="Your Location"
          description="Delivery Point"
        />

      <Polyline
          coordinates={[
            { latitude: user.latitude, longitude: user.longitude },
            { latitude: restaurant.latitude, longitude: restaurant.longitude },
          ]}
          strokeColor="#FF0000" // Color of the path
          strokeWidth={4} // Thickness of the path
        />
      </MapView>

      {/* Summary Footer */}
      <View style={styles.summaryFooter}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        <Text>{`Total Items: ${orderDetails.length}`}</Text>
        <Text>{`Service Charge: GHS ${deliveryFee.toFixed(2)}`}</Text>
        <Text
          style={styles.total}
        >{`Total (Incl. Delivery): GHS ${totalAmount.toFixed(2)}`}</Text>
      </View>

      {!orderPlaced ? (
        <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
          <Text style={styles.buttonText}>Place Order</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.trackOrderButton} onPress={handleTrackOrder}>
          <Text style={styles.buttonText}>Track Order</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#ffa500",
  },
  orderDetails: { padding: 15 },
  restaurantDetails: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  restaurantName: { fontSize: 18, fontWeight: "bold" },
  serviceCharge: { color: "gray", marginTop: 5, marginBottom: 10 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  repeatOrder: { color: "#ffa500" },
  editOrder: { color: "#ffa500" },
  deleteOrder: { color: "red" },
  map: { height: 200, margin: 15, borderRadius: 10 },
  summaryFooter: {
    backgroundColor: "#fff",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
  },
  summaryTitle: { fontWeight: "bold", marginBottom: 5 },
  total: { fontSize: 16, fontWeight: "bold", marginTop: 10 },
  placeOrderButton: {
    backgroundColor: "#ffa500",
    padding: 15,
    alignItems: "center",
    margin: 15,
    borderRadius: 5,
  },
  trackOrderButton: {
    backgroundColor: "#28a745",
    padding: 15,
    alignItems: "center",
    margin: 15,
    borderRadius: 5,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
