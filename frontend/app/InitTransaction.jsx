import React, { useState, useRef } from 'react';
import { View, Text, SafeAreaView, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import * as SecureStore from "expo-secure-store";
import { getUserData, InitTransactionReq } from '../services/api'; 
import { useCart } from "@/context/CartContext";

const InitTransaction = () => {
  const [email, setEmail] = useState("");
  const [showPaystack, setShowPaystack] = useState(false);
  const [authorizationUrl, setAuthorizationUrl] = useState("");
  const [loading, setLoading] = useState(false);   // ✅ define loading state
  const webviewRef = useRef(null);
  const callbackUrl = 'https://yourcallback.com'; // Replace with real callback URL

  const { amount } = useLocalSearchParams();
  const { cartItems, clearCart } = useCart();     // ✅ get cart items

  const handleEmailChange = (value: string) => setEmail(value);

  const initializePayment = async () => {
    if (!email) {
      Alert.alert("Validation Error", "Please enter your email.");
      return;
    }
    try {
      setLoading(true);

      const token = await SecureStore.getItemAsync("customer_token");
      const userData = await getUserData(token);

      const orderPayload = {
        userId: userData.id,
        items: cartItems.map(item => ({
          id: item.Dish.id,
          quantity: item.quantity,
        })),
        note: "Checkout from mobile app",
      };

      // ✅ Call backend helper
      const { authorization_url, reference } = await InitTransactionReq(
        email,
        parseInt(amount),   // ensure amount is in kobo
        orderPayload
      );

      console.log("Authorization URL:", authorization_url);
      console.log("Paystack Reference:", reference);

      setAuthorizationUrl(authorization_url);
      setShowPaystack(true);
    } catch (error) {
      console.error("InitTransaction error:", error);
      Alert.alert("Error", "Failed to initialize payment.");
    } finally {
      setLoading(false);
    }
  };

  const onNavigationStateChange = (navState: any) => {
    const { url } = navState;
    console.log("Current URL:", url);

    if (!url) return;

    if (url.includes(callbackUrl)) {
      Alert.alert('Payment Completed', 'Redirecting...');
      clearCart(); // ✅ clear cart after success
      setShowPaystack(false);
    }

    if (url.includes('https://standard.paystack.co/close')) {
      Alert.alert('Payment Cancelled');
      setShowPaystack(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Confirm Order Details</Text>

      {loading && <ActivityIndicator size="large" />}

      {!showPaystack && !loading && (
        <>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="example@gmail.com"
              value={email}
              onChangeText={handleEmailChange}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Amount"
              value={`${amount}`}
              editable={false}
            />
          </View>

          <View style={styles.button}>
            <TouchableOpacity onPress={initializePayment}>
              <Text style={{ color: "white" }}>Confirm & Pay</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {showPaystack && (
        <WebView
          ref={webviewRef}
          source={{ uri: authorizationUrl }}
          style={{ marginTop: 20, height: 600, width: '100%' }}
          onNavigationStateChange={onNavigationStateChange}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, marginBottom: 20 },
  inputContainer: { width: '100%', marginBottom: 15 },
  input: { height: 50, borderWidth: 1, borderColor: '#FAD4D4', borderRadius: 10, paddingHorizontal: 10, backgroundColor: '#FAD4D4' },
  button: { backgroundColor: "red", width: "100%", justifyContent: "center", alignItems: "center", height: 35, borderRadius: 5 }
});

export default InitTransaction;
 