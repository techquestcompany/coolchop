// screens/DeleteAccountScreen.js
import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { deleteAccount } from '../services/api';

export default function DeleteAccountScreen() {
  const handleDelete = async () => {
    const result = await deleteAccount();
    Alert.alert("Account deletion unavailable", result.message);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Account deletion is not currently available.</Text>
      <Button title="Delete Account" color="red" onPress={handleDelete} />
    </View>
  );
}
