import React, { useState, useRef } from 'react';
import { View, Text, SafeAreaView, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { InitTransactionReq } from '../services/api'; 

const InitTransaction = () => {
  const [email, setEmail] = useState("");
  const [showPaystack, setShowPaystack] = useState(false);
  const [authorizationUrl, setAuthorizationUrl] = useState("");
  const webviewRef = useRef(null);
  const callbackUrl = 'https://yourcallback.com'; // Replace with real callback URL

  const { amount } = useLocalSearchParams();

  const handleEmailChange = (value) => setEmail(value);

  const initializePayment = async () => {
    if (!email) {
      Alert.alert("Validation Error", "Please enter your email.");
      return;
    }
    try {
      const response = await InitTransactionReq(email, amount);
      const { authorization_url } = response;
      console.log("Authorization URL:", authorization_url);
      setAuthorizationUrl(authorization_url);
      setShowPaystack(true);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to initialize payment.");
    }
  };

  const onNavigationStateChange = (navState) => {
    const { url } = navState;
    console.log("Current URL:", url);

    if (!url) return;

    if (url.includes(callbackUrl)) {
      Alert.alert('Payment Completed', 'Redirecting...');
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

      {!showPaystack && (
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
