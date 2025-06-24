import React, { useState } from "react";
import {router} from "expo-router";
import { useRoute } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import {changePassword} from "../services/api";

export default function ChangePasswordScreen() {
  const route = useRoute()

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const {email} = route.params

  const handleChangePassword = async () => {
    if (newPassword === "" || confirmPassword === "") {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
  
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New password and confirmation do not match.");
      return;
    }
  
    try {
      const res = await changePassword(newPassword, confirmPassword,email);
      
      if (res?.message === "Password updated successfully") {
        Alert.alert("Success", "Your password has been changed.");
        router.push("login");
      } else {
        Alert.alert("Error", res?.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Password change error:", error);
      Alert.alert("Error", error.message || "An unexpected error occurred.");
    }
  };
   
  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Change Password</Text>
      <Text style={styles.subtitle}>
        Enter your new password to update your credentials.
      </Text>

    

      {/* New Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter your new password"
        placeholderTextColor="#888"
        secureTextEntry
        onChangeText={setNewPassword}
        value={newPassword}
      />

      {/* Confirm Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Confirm your new password"
        placeholderTextColor="#888"
        secureTextEntry
        onChangeText={setConfirmPassword}
        value={confirmPassword}
      />

      {/* Change Password Button */}
      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>

      {/* Back to Login */}
      <TouchableOpacity
        style={styles.backToLogin}
        onPress={() => router.push('login')}
      >
        <Text style={styles.backToLoginText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#D32F2F",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  backToLogin: {
    marginTop: 20,
    alignItems: "center",
  },
  backToLoginText: {
    color: "#D32F2F",
    fontSize: 16,
    fontWeight: "bold",
  },
});
