import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, KeyboardAvoidingView, SafeAreaView, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { registerRestaurant } from '../services/api';
import Toast from 'react-native-toast-message';

const InputField = ({ iconName, placeholder, secureTextEntry, value, onChangeText, keyboardType }) => {
  return (
    <View style={styles.inputContainer}>
      <FontAwesome name={iconName} size={20} color="#B07A7A" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#B07A7A"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

export default function RestaurantRegistrationScreen() {
  const [restaurantName, setRestaurantName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle restaurant registration
  const handleRegistration = async () => {
    if (!restaurantName || !email || !phone || !address || !description || !password) {
      Alert.alert("All fields are required");
      return;
    }
    try {
      setLoading(true);
      const response = await registerRestaurant(restaurantName, email, phone, address, description, password);
      if (response.message?.includes("Restaurant registered successfully")) {
        Toast.show({
          type: 'success',
          text1: 'Registration Successful',
          text2: 'Your restaurant has been registered!',
        });
        router.push('/reslogin');
        setRestaurantName('');
        setEmail('');
        setPhone('');
        setAddress('');
        setDescription('');
        setPassword('');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: response.message || 'Please try again.',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error.message || 'Something went wrong.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={30} color="#D32F2F" />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>Register Your Restaurant</Text>
          <Text style={styles.subTitle}>Please provide the details below to register your restaurant 🍽️</Text>

          {/* Restaurant Name Input */}
          <InputField
            iconName="building"
            placeholder="Restaurant Name"
            value={restaurantName}
            onChangeText={setRestaurantName}
          />

          {/* Email Input */}
          <InputField
            iconName="envelope"
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          {/* Phone Input */}
          <InputField
            iconName="phone"
            placeholder="Phone"
            keyboardType="numeric"
            value={phone}
            onChangeText={setPhone}
          />

          {/* Address Input */}
          <InputField
            iconName="map-marker"
            placeholder="Restaurant Address"
            value={address}
            onChangeText={setAddress}
          />

          {/* Description Input */}
          <InputField
            iconName="pencil-square-o"
            placeholder="Restaurant Description"
            value={description}
            onChangeText={setDescription}
          />

          {/* Password Input */}
          <InputField
            iconName="lock"
            placeholder="Password"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />

          {/* Register Button */}
          <TouchableOpacity style={styles.registerButton} onPress={handleRegistration}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    color: '#D32F2F',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 16,
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FAD4D4',
    borderRadius: 10,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#FAD4D4',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  registerButton: {
    width: '100%',
    backgroundColor: '#D32F2F',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
