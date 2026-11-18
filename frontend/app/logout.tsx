import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { removeStoredItem } from "@/services/authStorage";

const Logout = () => {
  const router = useRouter();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        await Promise.all(
          ["customer_token", "restaurant_token", "role", "userId", "token"].map(removeStoredItem)
        );
        router.replace("/login");
      } catch (error) {
        console.error("Error during logout:", error);
      }
    };

    logoutUser();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Logout;
