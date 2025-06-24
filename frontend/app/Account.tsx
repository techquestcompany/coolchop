// screens/DeleteAccountScreen.js
import React from 'react';
import * as SecureStore from 'expo-secure-store'
import { View, Text, Button, Alert } from 'react-native';
import { deleteAccount } from '../services/api';

export default function DeleteAccountScreen({ navigation }) {
  const handleDelete = async () => {
    const getToken = async () => await SecureStore.getItemAsync('token');
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const result = await deleteAccount();
            if (result.success) {
              Alert.alert("Account Deleted", "Your account has been successfully deleted.");
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } else {
              Alert.alert("Error", result.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Do you really want to delete your account?</Text>
      <Button title="Delete Account" color="red" onPress={handleDelete} />
    </View>
  );
}
