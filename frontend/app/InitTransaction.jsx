import React, { useState, useRef } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from "react-native";
import { useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import * as SecureStore from "expo-secure-store";
import { InitTransactionReq, reconcilePayment, getApiErrorMessage } from '../services/api';
import { buildCheckoutPayload, calculateCheckoutTotals } from '../services/orderContracts';
import { useCart } from "@/context/CartContext";

const getPendingReference = async () =>
  Platform.OS === "web"
    ? localStorage.getItem("pending_payment_reference")
    : SecureStore.getItemAsync("pending_payment_reference");

const savePendingReference = async (reference) => {
  if (Platform.OS === "web") {
    localStorage.setItem("pending_payment_reference", reference);
  } else {
    await SecureStore.setItemAsync("pending_payment_reference", reference);
  }
};

const clearPendingReference = async () => {
  if (Platform.OS === "web") {
    localStorage.removeItem("pending_payment_reference");
  } else {
    await SecureStore.deleteItemAsync("pending_payment_reference");
  }
};

const getCustomerToken = async () =>
  Platform.OS === "web"
    ? localStorage.getItem("customer_token")
    : SecureStore.getItemAsync("customer_token");

const InitTransaction = () => {
  const [showPaystack, setShowPaystack] = useState(false);
  const [authorizationUrl, setAuthorizationUrl] = useState("");
  const [loading, setLoading] = useState(false);   // ✅ define loading state
  const [reference, setReference] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(false);
  const webviewRef = useRef(null);
  const { cartItems, refreshCart } = useCart();
  const { note } = useLocalSearchParams();
  const [paymentTotals, setPaymentTotals] = useState(null);
  const subtotalMinorUnits = cartItems.reduce(
    (sum, item) => sum + Math.round(Number(item.Dish?.price) * 100) * Number(item.quantity),
    0
  );
  const displayedTotals = paymentTotals || calculateCheckoutTotals(subtotalMinorUnits);
  const formatGhs = (minorUnits) =>
    new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(minorUnits / 100);

  React.useEffect(() => {
    getPendingReference()
      .then((savedReference) => {
        if (savedReference) {
          setReference(savedReference);
          setPaymentStatus("A previous payment needs confirmation.");
        }
      })
      .catch((error) => console.error("Failed to restore payment reference:", error));
  }, []);

  const initializePayment = async () => {
    try {
      setLoading(true);

      const token = await getCustomerToken();
      if (!token) {
        Alert.alert("Session Expired", "Please sign in again.");
        return;
      }

      const orderPayload = buildCheckoutPayload(cartItems, note);

      const {
        authorization_url,
        reference,
        subtotal,
        service_charge,
        amount,
      } = await InitTransactionReq(orderPayload, token);

      await savePendingReference(reference);
      setPaymentTotals({
        subtotalMinorUnits: subtotal,
        serviceChargeMinorUnits: service_charge,
        totalMinorUnits: amount,
      });
      setReference(reference);
      setPaymentStatus("Payment started. Complete it in the secure payment window.");
      setAuthorizationUrl(authorization_url);
      setShowPaystack(true);
    } catch (error) {
      console.error("InitTransaction error:", error);
      Alert.alert("Unable to start payment", getApiErrorMessage(error, "We couldn't start your payment. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!reference) return;
    setCheckingStatus(true);
    try {
      const token = await getCustomerToken();
      if (!token) {
        Alert.alert("Session Expired", "Please sign in again.");
        return;
      }
      const result = await reconcilePayment(reference, token);
      if (result.status === "success") {
        setPaymentStatus("Payment confirmed. Your order is being prepared.");
        await clearPendingReference();
        await refreshCart().catch((error) => {
          console.error("Payment confirmed, but cart refresh failed:", error);
        });
      } else if (result.status === "failed") {
        setPaymentStatus("Payment failed. You can start a new payment attempt.");
        await clearPendingReference();
        setReference("");
      } else {
        setPaymentStatus("Payment is still pending. Check again shortly.");
      }
    } catch (error) {
      console.error("Payment status check failed:", error);
      setPaymentStatus(getApiErrorMessage(error, "We couldn't confirm your payment status. Please try again."));
    } finally {
      setCheckingStatus(false);
    }
  };

  const onNavigationStateChange = (navState: any) => {
    const { url } = navState;
    console.log("Current URL:", url);

    if (!url) return;

    if (url.includes('https://standard.paystack.co/close')) {
      setShowPaystack(false);
      setPaymentStatus("Payment window closed. Confirm the payment status before retrying.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Confirm Order Details</Text>

      {loading && <ActivityIndicator size="large" />}

      {!showPaystack && !loading && (
        <>
          <Text style={styles.amountNotice}>
            A 3% service charge is added to your food subtotal. Final amounts are verified using current menu prices.
          </Text>
          <View style={styles.summary}>
            <Text style={styles.summaryRow}>Subtotal: {formatGhs(displayedTotals.subtotalMinorUnits)}</Text>
            <Text style={styles.summaryRow}>Service charge (3%): {formatGhs(displayedTotals.serviceChargeMinorUnits)}</Text>
            <Text style={styles.summaryTotal}>Total: {formatGhs(displayedTotals.totalMinorUnits)}</Text>
          </View>

          {paymentStatus ? <Text style={styles.status}>{paymentStatus}</Text> : null}
          {reference ? (
            <View style={styles.button}>
              <TouchableOpacity onPress={checkPaymentStatus} disabled={checkingStatus}>
                <Text style={{ color: "white" }}>
                  {checkingStatus ? "Checking..." : "Check payment status"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
          {!reference || paymentStatus.startsWith("Payment failed") ? (
            <View style={styles.button}>
              <TouchableOpacity onPress={initializePayment}>
                <Text style={{ color: "white" }}>Confirm & Pay</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </>
      )}

      {showPaystack && (
        <>
          <View style={styles.summary}>
            <Text style={styles.summaryRow}>Subtotal: {formatGhs(displayedTotals.subtotalMinorUnits)}</Text>
            <Text style={styles.summaryRow}>Service charge (3%): {formatGhs(displayedTotals.serviceChargeMinorUnits)}</Text>
            <Text style={styles.summaryTotal}>Total: {formatGhs(displayedTotals.totalMinorUnits)}</Text>
          </View>
          <WebView
            ref={webviewRef}
            source={{ uri: authorizationUrl }}
            style={{ marginTop: 20, height: 600, width: '100%' }}
            onNavigationStateChange={onNavigationStateChange}
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  amountNotice: {
    marginVertical: 12,
    textAlign: 'center',
    color: '#555',
  },
  summary: { padding: 14, marginVertical: 10, backgroundColor: '#f7f7f7', borderRadius: 8 },
  summaryRow: { marginVertical: 4, textAlign: 'right' },
  summaryTotal: { marginTop: 6, fontWeight: 'bold', fontSize: 17, textAlign: 'right' },
  status: { marginVertical: 12, textAlign: "center" },
  title: { fontSize: 20, marginBottom: 20 },
  inputContainer: { width: '100%', marginBottom: 15 },
  input: { height: 50, borderWidth: 1, borderColor: '#FAD4D4', borderRadius: 10, paddingHorizontal: 10, backgroundColor: '#FAD4D4' },
  button: { backgroundColor: "red", width: "100%", justifyContent: "center", alignItems: "center", height: 35, borderRadius: 5 }
});

export default InitTransaction;
 