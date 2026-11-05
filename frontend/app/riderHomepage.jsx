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
  RefreshControl,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location";
import { router } from "expo-router";
import {
  getRiderOrders,
  claimRiderOrder,
  updateRiderOrderStatus,
  updateUserLocation,
  getApiErrorMessage,
} from "@/services/api";

const RiderHome = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState(null);
  const [token, setToken] = useState("");
  const [riderId, setRiderId] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const token =
          Platform.OS !== "web"
            ? await SecureStore.getItemAsync("customer_token")
            : localStorage.getItem("customer_token");

        const role =
          Platform.OS !== "web"
            ? await SecureStore.getItemAsync("role")
            : localStorage.getItem("role");
        const storedUserId =
          Platform.OS !== "web"
            ? await SecureStore.getItemAsync("userId")
            : localStorage.getItem("userId");

        if (!token || role !== "rider") {
          return router.replace("/login");
        }

        setToken(token);
        setRiderId(Number(storedUserId));
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
    if (Platform.OS === "web") return;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location unavailable", "You can still view and claim orders without sharing your location.");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = loc.coords;

      setLocation({ latitude, longitude });
      await updateUserLocation(token, latitude, longitude);
    } catch (error) {
      console.warn("Unable to update rider location:", error);
      Alert.alert("Location unavailable", "Orders are still available. Your location could not be updated.");
    }
  };

  const loadOrders = async (token) => {
    const res = await getRiderOrders(token);
    setOrders(res || []);
  };

  const refreshOrders = async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      await loadOrders(token);
    } catch (error) {
      Alert.alert("Unable to refresh orders", getApiErrorMessage(error, "Please try again."));
    } finally {
      setRefreshing(false);
    }
  };

  const handleOrderAction = async (order, action) => {
    setUpdatingOrderId(order.id);
    try {
      if (action === "claim") {
        await claimRiderOrder(order.id, token);
      } else {
        await updateRiderOrderStatus(order.id, action, token);
      }
      await loadOrders(token);
    } catch (error) {
      Alert.alert("Unable to update delivery", getApiErrorMessage(error, "Please refresh and try again."));
    } finally {
      setUpdatingOrderId(null);
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshOrders} />
        }
        ListEmptyComponent={<Text>No orders available</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.orderNumber}>Order #{item.orderNumber || item.id}</Text>
            <Text>Customer: {item.user?.name || "N/A"}</Text>
            {!!item.user?.phone && <Text>Phone: {item.user.phone}</Text>}
            <Text>Delivery: {item.deliveryAddress || "Address not available"}</Text>
            <Text>Status: {item.status === "ready_for_pickup" ? "Ready for pickup" : "On delivery"}</Text>

            {item.riderId == null ? (
              <TouchableOpacity
                style={styles.actionButton}
                disabled={updatingOrderId === item.id}
                onPress={() => handleOrderAction(item, "claim")}
              >
                <Text style={styles.actionButtonText}>
                  {updatingOrderId === item.id ? "Claiming..." : "Claim order"}
                </Text>
              </TouchableOpacity>
            ) : Number(item.riderId) === riderId && item.status === "ready_for_pickup" ? (
              <TouchableOpacity
                style={styles.actionButton}
                disabled={updatingOrderId === item.id}
                onPress={() => handleOrderAction(item, "on_delivery")}
              >
                <Text style={styles.actionButtonText}>
                  {updatingOrderId === item.id ? "Updating..." : "Start delivery"}
                </Text>
              </TouchableOpacity>
            ) : Number(item.riderId) === riderId && item.status === "on_delivery" ? (
              <TouchableOpacity
                style={styles.actionButton}
                disabled={updatingOrderId === item.id}
                onPress={() => handleOrderAction(item, "delivered")}
              >
                <Text style={styles.actionButtonText}>
                  {updatingOrderId === item.id ? "Updating..." : "Mark delivered"}
                </Text>
              </TouchableOpacity>
            ) : null}
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
  orderNumber: { fontWeight: "bold", marginBottom: 4 },
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
  actionButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 6,
    backgroundColor: "#c62828",
    alignItems: "center",
  },
  actionButtonText: { color: "#fff", fontWeight: "600" },
});
