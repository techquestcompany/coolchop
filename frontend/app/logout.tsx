import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { View, ActivityIndicator, StyleSheet } from "react-native";

const Logout = () => {
  const router = useRouter();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        // Remove the securely stored userId
        await SecureStore.deleteItemAsync("userId");
        console.log("User ID removed successfully.");

        // Redirect to the login screen
        router.push("/login");
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
