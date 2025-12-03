import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Platform } from 'react-native';
import { loginRestaurant, verifyToken } from '../services/api';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import Toast from "react-native-toast-message";

// Helper functions to support both Web + Mobile
async function saveItem(key, value) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getItem(key) {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

async function removeItem(key) {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export default function WebLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkTokenValidity();
  }, []);

  const checkTokenValidity = async () => {
    const token = await getItem("restaurant_token");
    const role = await getItem("role");

    if (token && role === "vendor") {
      try {
        const isValid = await verifyToken(token);
        if (!isValid) {
          await removeItem("restaurant_token");
          await removeItem("role");
        } else {
         router.push("/(res_tabs)");
        }
      } catch (error) {
        console.log("Token verification failed:", error);
        await removeItem("restaurant_token");
        await removeItem("role");
      }
    }
  };

  const handleLogin = async () => {
    setLoading(true);

    try {
      const res = await loginRestaurant(email, password);

      if (res.message?.trim() === "Login successful" && res.token) {
        await saveItem("restaurant_token", res.token);
        await saveItem("role", "vendor");

        Toast.show({
          type: "success",
          text1: "Login successful!",
          text2: "Welcome back.",
        });

         router.push("/(res_tabs)");
      } else {
        Toast.show({
          type: "error",
          text1: "Login failed",
          text2: res.message || "Please try again.",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login As a Vendor</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button
        title={loading ? "Signing in..." : "Sign In"}
        onPress={handleLogin}
        disabled={loading}
        color="#D32F2F"
      />

      <Text style={{ marginTop: 10 }}>
        Don't have an account?{" "}
        <Text
          style={{ color: "#D32F2F" }}
          onPress={() => router.push("/add_restaurants")}
        >
          Sign Up
        </Text>
      </Text>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 50,
  },
  title: {
    fontSize: 24,
    color: '#D32F2F',
    marginBottom: 20,
    textAlign:"center"
  },
  input: {
    borderWidth: 1,
    borderColor: '#D32F2F',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
});
