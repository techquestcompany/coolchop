import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { updateRestaurantData, getRestaurantById } from '@/services/api';
import axios from 'axios';

export default function EditVendorProfileScreen() {
  const [formData, setFormData] = useState({
    restaurantName: '',
    email: '',
    phone: '',
    address: '',
    paymentInfo: '',
    operationalHours: '',
    description: ''
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRestaurant();
  }, []);

  const fetchRestaurant = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const data = await getRestaurantById(token);
      setFormData({
        restaurantName: data.restaurantName || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        operationalHours: data.operationalHours || '',
        paymentInfo: data.paymentInfo || '',
        description :data.description || ""
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load restaurant data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const updateData = await updateRestaurantData(formData.address,formData.email,formData.phone,formData.restaurantName,formData.description,token)
       console.log( updateData)
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#D32F2F" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Restaurant Name"
        value={formData.restaurantName}
        onChangeText={(text) => handleChange('restaurantName', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={formData.email}
        onChangeText={(text) => handleChange('email', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone"
        keyboardType="phone-pad"
        value={formData.phone}
        onChangeText={(text) => handleChange('phone', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Address"
        value={formData.address}
        onChangeText={(text) => handleChange('address', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Operational Hours"
        value={formData.operationalHours}
        onChangeText={(text) => handleChange('operationalHours', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Payment Info"
        value={formData.paymentInfo}
        onChangeText={(text) => handleChange('paymentInfo', text)}
      />
       
       <TextInput
        style={styles.input}
        placeholder="description"
        value={formData.description}
        onChangeText={(text) => handleChange('description', text)}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  input: {
    height: 50,
    borderColor: '#D32F2F',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15
  },
  button: {
    backgroundColor: '#D32F2F',
    paddingVertical: 15,
    borderRadius: 10
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center'
  }
});
