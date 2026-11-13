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
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location";
import { router } from "expo-router";
import { io } from "socket.io-client";
import { removeStoredItem } from "@/services/authStorage";
import {
  API_URL,
  getRiderOrders,
  getRiderHistory,
  claimRiderOrder,
  registerRiderPushToken,
  unregisterRiderPushToken,
  updateRiderOrderStatus,
  updateUserLocation,
  getApiErrorMessage,
} from "@/services/api";

const RiderHome = () => {
  const [orders, setOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState(null);
  const [token, setToken] = useState("");
  const [pushToken, setPushToken] = useState("");
  const [riderId, setRiderId] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [historyError, setHistoryError] = useState(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

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
        await Promise.all([requestLocation(token), loadOrders(token)]);
      } catch (err) {
        console.error(err);
        setLoadError(getApiErrorMessage(err, "We couldn't load your dashboard. Please try again."));
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    const socket = io(API_URL.replace(/\/api\/?$/, ""), {
      auth: { token },
      reconnection: true,
    });

    const refreshFromEvent = () => {
      getRiderOrders(token)
        .then((result) => {
          if (active && Array.isArray(result)) {
            setOrders(result);
            setLoadError(null);
          }
        })
        .catch((error) => {
          if (active) {
            console.error("Failed to refresh rider orders after a live update:", error);
            setLoadError(getApiErrorMessage(error, "We couldn't refresh your orders."));
          }
        });
    };

    socket.on("rider:order-ready", refreshFromEvent);
    socket.on("rider:order-updated", refreshFromEvent);
    socket.on("connect_error", (error) => {
      console.warn("Rider live updates are unavailable:", error.message);
    });

    const notificationSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        if (notification.request.content.data?.type === "rider_order_ready") {
          refreshFromEvent();
        }
      });
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        if (response.notification.request.content.data?.type === "rider_order_ready") {
          refreshFromEvent();
        }
      });

    const registerForPush = async () => {
      if (Platform.OS === "web" || !Device.isDevice) return;

      try {
        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("orders", {
            name: "Order updates",
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#D32F2F",
          });
        }

        const currentPermissions = await Notifications.getPermissionsAsync();
        const permissions =
          currentPermissions.granted ||
          currentPermissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
            ? currentPermissions
            : await Notifications.requestPermissionsAsync();
        if (!permissions.granted && permissions.ios?.status !== Notifications.IosAuthorizationStatus.PROVISIONAL) {
          return;
        }

        const projectId =
          Constants.easConfig?.projectId ??
          Constants.expoConfig?.extra?.eas?.projectId;
        if (typeof projectId !== "string" || !projectId) {
          throw new Error("The EAS project ID is missing from app configuration.");
        }

        const result = await Notifications.getExpoPushTokenAsync({ projectId });
        if (!active) return;
        await registerRiderPushToken(token, result.data, Platform.OS);
        if (active) setPushToken(result.data);
      } catch (error) {
        console.warn("Rider push notification registration failed:", error);
      }
    };

    registerForPush();
    return () => {
      active = false;
      socket.disconnect();
      notificationSubscription.remove();
      responseSubscription.remove();
    };
  }, [token]);

  /** 📍 Request & Send Rider Location */
  const requestLocation = async (token) => {
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
    if (!Array.isArray(res)) {
      throw new Error("Unexpected orders response from server.");
    }
    setOrders(res || []);
    setLoadError(null);
  };

  const loadHistory = async (authToken) => {
    setLoadingHistory(true);
    try {
      const result = await getRiderHistory(authToken);
      if (!Array.isArray(result)) {
        throw new Error("Unexpected delivery history response from server.");
      }
      setHistory(result);
      setHistoryError(null);
      setHistoryLoaded(true);
    } catch (error) {
      setHistoryError(getApiErrorMessage(error, "We couldn't load your delivery history. Please try again."));
    } finally {
      setLoadingHistory(false);
    }
  };

  const selectHistory = () => {
    setShowHistory(true);
    if (token && !historyLoaded) loadHistory(token);
  };

  const handleLogout = () => {
    const logout = async () => {
      try {
        let pushUnregistered = true;
        if (pushToken) {
          try {
            await unregisterRiderPushToken(token, pushToken);
          } catch (error) {
            pushUnregistered = false;
            console.error("Failed to unregister rider push token:", error);
          }
        }
        await Promise.all(
          ["customer_token", "role", "userId", "token"].map(removeStoredItem)
        );
        router.replace("/login");
        if (!pushUnregistered) {
          const warning = "You are logged out, but this device could not be removed from rider push notifications. Sign in again while online to refresh its registration.";
          if (Platform.OS === "web") {
            window.alert(warning);
          } else {
            Alert.alert("Logged out", warning);
          }
        }
      } catch (error) {
        console.error("Rider logout failed:", error);
        const message = "We couldn't log you out. Please try again.";
        if (Platform.OS === "web") {
          window.alert(message);
        } else {
          Alert.alert("Unable to log out", message);
        }
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to log out?")) logout();
      return;
    }

    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: logout },
    ]);
  };

  const refreshOrders = async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      if (showHistory) {
        await loadHistory(token);
      } else {
        await loadOrders(token);
      }
    } catch (error) {
      setLoadError(getApiErrorMessage(error, "We couldn't refresh your orders. Please try again."));
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
      if (historyLoaded && action === "delivered") await loadHistory(token);
    } catch (error) {
      Alert.alert("Unable to update delivery", getApiErrorMessage(error, "Please refresh and try again."));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>COOL <Text style={styles.brandAccent}>CHOP</Text></Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Log out"
        >
          <MaterialIcons name="logout" size={22} color="#D32F2F" />
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={showHistory ? history : orders}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshOrders} tintColor="#D32F2F" />
        }
        ListHeaderComponent={
          <View>
            <Text style={styles.header}>Rider Dashboard</Text>
            <Text style={styles.subtitle}>Manage pickups and deliveries</Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryIcon}>
                <MaterialIcons name="local-shipping" size={26} color="#fff" />
              </View>
              <View style={styles.summaryText}>
                <Text style={styles.summaryCount}>{showHistory ? history.length : orders.length}</Text>
                <Text style={styles.summaryLabel}>{showHistory ? "Completed rides" : "Active orders"}</Text>
              </View>
              {location ? (
                <View style={styles.locationPill}>
                  <MaterialIcons name="location-on" size={15} color="#D32F2F" />
                  <Text style={styles.locationPillText}>Location on</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.sectionHeading}>
              <View style={styles.sectionTabs}>
                <TouchableOpacity
                  style={[styles.sectionTab, !showHistory && styles.sectionTabSelected]}
                  onPress={() => setShowHistory(false)}
                >
                  <Text style={[styles.sectionTabText, !showHistory && styles.sectionTabTextSelected]}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sectionTab, showHistory && styles.sectionTabSelected]}
                  onPress={selectHistory}
                >
                  <Text style={[styles.sectionTabText, showHistory && styles.sectionTabTextSelected]}>Ride history</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.orderCount}>{showHistory ? history.length : orders.length}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          (!showHistory && loading) || (showHistory && loadingHistory) ? (
            <View style={styles.stateCard}>
              <ActivityIndicator size="large" color="#D32F2F" />
              <Text style={styles.stateText}>{showHistory ? "Loading your ride history..." : "Loading your delivery queue..."}</Text>
            </View>
          ) : (showHistory ? historyError : loadError) ? (
            <View style={styles.stateCard}>
              <MaterialIcons name="error-outline" size={36} color="#D32F2F" />
              <Text style={styles.stateTitle}>Couldn't load {showHistory ? "ride history" : "orders"}</Text>
              <Text style={styles.stateText}>{showHistory ? historyError : loadError}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={refreshOrders}>
                <Text style={styles.actionButtonText}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : showHistory ? (
            <View style={styles.stateCard}>
              <MaterialIcons name="history" size={38} color="#BDBDBD" />
              <Text style={styles.stateTitle}>No completed rides yet</Text>
              <Text style={styles.stateText}>Completed deliveries will appear here.</Text>
            </View>
          ) : (
            <View style={styles.stateCard}>
              <MaterialIcons name="inventory-2" size={38} color="#BDBDBD" />
              <Text style={styles.stateTitle}>No deliveries right now</Text>
              <Text style={styles.stateText}>Pull down to check for new orders.</Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const isAssignedToRider = Number(item.riderId) === riderId;
          const statusLabel = item.status === "delivered"
            ? "Delivered"
            : item.status === "ready_for_pickup"
              ? "Ready for pickup"
              : "On delivery";

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.orderEyebrow}>ORDER</Text>
                  <Text style={styles.orderNumber}>#{item.orderNumber || item.id}</Text>
                </View>
                <View style={[styles.statusPill, (item.status === "on_delivery" || item.status === "delivered") && styles.deliveryStatusPill]}>
                  <Text style={[styles.statusText, (item.status === "on_delivery" || item.status === "delivered") && styles.deliveryStatusText]}>
                    {statusLabel}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <MaterialIcons name="person-outline" size={19} color="#D32F2F" />
                <Text style={styles.infoText}>{item.user?.name || "Customer details unavailable"}</Text>
              </View>
              {!!item.user?.phone && (
                <View style={styles.infoRow}>
                  <MaterialIcons name="call" size={18} color="#D32F2F" />
                  <Text style={styles.infoText}>{item.user.phone}</Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <MaterialIcons name="location-on" size={19} color="#D32F2F" />
                <Text style={styles.infoText}>{item.deliveryAddress || "Delivery address unavailable"}</Text>
              </View>
              {item.totalAmount != null && (
                <Text style={styles.totalAmount}>Total: GH₵ {Number(item.totalAmount).toFixed(2)}</Text>
              )}

              {!showHistory && item.riderId == null ? (
                <TouchableOpacity
                  style={styles.actionButton}
                  disabled={updatingOrderId === item.id}
                  onPress={() => handleOrderAction(item, "claim")}
                >
                  <Text style={styles.actionButtonText}>
                    {updatingOrderId === item.id ? "Claiming..." : "Claim order"}
                  </Text>
                </TouchableOpacity>
              ) : !showHistory && isAssignedToRider && item.status === "ready_for_pickup" ? (
                <TouchableOpacity
                  style={styles.actionButton}
                  disabled={updatingOrderId === item.id}
                  onPress={() => handleOrderAction(item, "on_delivery")}
                >
                  <Text style={styles.actionButtonText}>
                    {updatingOrderId === item.id ? "Updating..." : "Start delivery"}
                  </Text>
                </TouchableOpacity>
              ) : !showHistory && isAssignedToRider && item.status === "on_delivery" ? (
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
          );
        }}
      />
    </SafeAreaView>
  );
};

export default RiderHome;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7F7F7" },
  topBar: {
    height: 58,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { fontSize: 19, fontWeight: "800", color: "#171717", letterSpacing: 0.6 },
  brandAccent: { color: "#D32F2F" },
  logoutButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFF1F1",
    alignItems: "center",
    justifyContent: "center",
  },
  list: { flex: 1 },
  listContent: { padding: 18, paddingBottom: 32, flexGrow: 1 },
  header: { fontSize: 25, fontWeight: "800", color: "#171717" },
  subtitle: { fontSize: 14, color: "#777", marginTop: 4, marginBottom: 18 },
  summaryCard: {
    backgroundColor: "#D32F2F",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryText: { marginLeft: 12, flex: 1 },
  summaryCount: { fontSize: 24, fontWeight: "800", color: "#fff" },
  summaryLabel: { fontSize: 13, color: "#FFE9E9", marginTop: 1 },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 9,
    paddingVertical: 6,
    backgroundColor: "#fff",
  },
  locationPillText: { color: "#D32F2F", fontSize: 11, fontWeight: "700" },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTabs: { flexDirection: "row", backgroundColor: "#EEEEEE", borderRadius: 9, padding: 3 },
  sectionTab: { borderRadius: 7, paddingVertical: 7, paddingHorizontal: 12 },
  sectionTabSelected: { backgroundColor: "#D32F2F" },
  sectionTabText: { color: "#666", fontSize: 12, fontWeight: "600" },
  sectionTabTextSelected: { color: "#fff" },
  orderCount: {
    color: "#D32F2F",
    backgroundColor: "#FCE4E4",
    borderRadius: 12,
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 2,
    marginLeft: 8,
    fontSize: 12,
    fontWeight: "700",
  },
  card: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderEyebrow: { fontSize: 10, color: "#888", fontWeight: "700", letterSpacing: 1 },
  orderNumber: { fontWeight: "800", fontSize: 16, color: "#222", marginTop: 2 },
  statusPill: { backgroundColor: "#FFF2D8", borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6 },
  statusText: { color: "#9B6500", fontSize: 11, fontWeight: "700" },
  deliveryStatusPill: { backgroundColor: "#E8F1FF" },
  deliveryStatusText: { color: "#2563A6" },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginVertical: 13 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 9 },
  infoText: { flex: 1, color: "#4A4A4A", fontSize: 14, marginLeft: 9, lineHeight: 20 },
  totalAmount: { color: "#222", fontSize: 14, fontWeight: "700", marginTop: 4 },
  stateCard: {
    minHeight: 190,
    backgroundColor: "#fff",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  stateTitle: { color: "#222", fontSize: 16, fontWeight: "700", marginTop: 10, textAlign: "center" },
  stateText: { color: "#777", fontSize: 13, marginTop: 8, textAlign: "center", lineHeight: 19 },
  retryButton: {
    marginTop: 16,
    paddingVertical: 11,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#D32F2F",
  },
  actionButton: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#D32F2F",
    alignItems: "center",
  },
  actionButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
