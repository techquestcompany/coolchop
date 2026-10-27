import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location";
import { router } from "expo-router";
import {
  getRiderOrders,
  acceptRiderOrder,
  updateUserLocation,
  getApiErrorMessage,
} from "@/services/api";

const RiderHome = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const token =
          Platform.OS === "android"
            ? await SecureStore.getItemAsync("customer_token")
            : localStorage.getItem("customer_token");

        const role =
          Platform.OS === "android"
            ? await SecureStore.getItemAsync("role")
            : localStorage.getItem("role");

        if (!token || role !== "rider") {
          return router.replace("/login");
        }

        await requestLocation(token);
        await loadOrders(token);
      } catch (err) {
        console.error(err);
        Alert.alert("Unable to load rider dashboard", getApiErrorMessage(err, "We couldn't load your dashboard. Please try again."));
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  /** 📍 Request & Send Rider Location */
  const requestLocation = async (token: string) => {
    const { status } = await Location.requestForegroundPermissionsAsync();
  
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "Location access is required to receive orders"
      );
      return;
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = loc.coords;

    console.log("📍 Rider location:", latitude, longitude);

    setLocation({ latitude, longitude });

    // Send to backend
    await updateUserLocation(token, latitude, longitude);
  };

  /** 📦 Load Available Orders */
  const loadOrders = async (token) => {
    const res = await getRiderOrders(token);
    setOrders(res|| []);
  };

  /** ✅ Accept Order */
  const acceptOrder = async (orderId: number) => {
    try {
      const token = await SecureStore.getItemAsync("customer_token");
      await acceptRiderOrder(orderId, token);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      Alert.alert("Unable to accept order", getApiErrorMessage(err, "We couldn't accept this order. Please try again."));
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🚴 Rider Dashboard</Text>

      {location && (
        <Text style={styles.locationText}>
          📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </Text>
      )}

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text>No orders available</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Order #{item.id}</Text>
            <Text>Customer: {item.user?.name || "N/A"}</Text>
            <Text>Delivery: {item.deliveryAddress}</Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => acceptOrder(item.id)}
            >
              <Text style={styles.buttonText}>Accept Order</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default RiderHome;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  locationText: {
    marginBottom: 10,
    fontSize: 14,
    color: "#555",
  },
  card: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#28a745",
    padding: 10,
    marginTop: 8,
    borderRadius: 6,
  },
  buttonText: { color: "#fff", textAlign: "center" },
});
