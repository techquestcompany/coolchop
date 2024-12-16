import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Image, ScrollView, KeyboardAvoidingView, SafeAreaView, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; 
import { router } from 'expo-router';
import { registerRestaurant } from '../services/api'; // Ensure this is the correct import
import Toast from 'react-native-toast-message'; 

const InputField = ({ iconName, placeholder, value, onChangeText, keyboardType }) => {
  return (
    <View style={styles.inputContainer}>
      <FontAwesome name={iconName} size={20} color="#B07A7A" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#B07A7A"
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

export default function AddRestaurantScreen() {
  const [restaurantName, setRestaurantName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const verifyPhone=(phone)=>{
   const phonePattern=/\d+/
   return phonePattern.test(phone)
  }

  // verify the email typed by the user
  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
  };

  // Handle Add Restaurant
  const handleAddRestaurant = async () => {

  if(!verifyPhone){
    Alert.alert("Invalid Phone format")
  }

  if(!verifyEmail){
    Alert.alert("invalid email format")
  }
    if (!restaurantName || !email || !phone || !address) {
      Alert.alert("All fields are required!");
      return;
    }

    try {
      setLoading(true);
      const response = await registerRestaurant(restaurantName, email, phone, address);
      if (response.message === "Restaurant registered successfully") {
        Toast.show({
          type: 'success',
          text1: 'Restaurant Registration Successful',
          text2: 'Your restaurant has been added!',
        });
        router.push('/restaurant/dashboard'); // Redirect to restaurant dashboard or login
      } else {
        Toast.show({
          type: 'error',
          text1: 'Restaurant Registration Failed',
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
            <FontAwesome name="arrow-left" size={24} color="#D32F2F" />
          </TouchableOpacity>

          {/* CoolChop Logo */}
          <Image source={require('../assets/images/coolchop.png')} style={styles.logo} />

          {/* Title */}
          <Text style={styles.title}>Add Restaurant</Text>
          <Text style={styles.subTitle}>Please add your restaurant to get started 😊</Text>

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

          {/* Add Restaurant Button */}
          <TouchableOpacity style={styles.addRestaurantButton} onPress={handleAddRestaurant}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Add Restaurant</Text>
            )}
          </TouchableOpacity>

          {/* Footer Text */}
          <Text style={styles.footerText}>
            By continuing with an account located in Ghana, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text> and acknowledge that you have read our{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>.
          </Text>
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
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 5,
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
  addRestaurantButton: {
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
  footerText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#7B7B7B',
  },
  linkText: {
    color: '#D32F2F',
    textDecorationLine: 'underline',
  },
});
