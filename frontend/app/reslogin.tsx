import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, ActivityIndicator, StyleSheet, Image, ScrollView, KeyboardAvoidingView, SafeAreaView } from 'react-native';
import { Checkbox } from 'react-native-paper'; 
import { router } from 'expo-router';
import { loginRestaurant, verifyToken } from '../services/api';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import { FontAwesome } from '@expo/vector-icons'; 
import * as Location from 'expo-location';

const InputField = ({ iconName, placeholder, secureTextEntry, value, onChangeText }) => {
  return (
    <View style={styles.inputContainer}>
      <FontAwesome name={iconName} size={20} color="#B07A7A" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#B07A7A"
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

export default function SignInScreen() {
  const [checked, setChecked] = useState(false);
  const [restaurantId, setRestaurantId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    checkTokenValidity();
  }, [router]);


// Function to check if token is valid
const checkTokenValidity = async () => {
  const token = await SecureStore.getItemAsync('restaurantId');
  if (token) {
    try {
      const isValid = await verifyToken(token);
      if (!isValid) {
        await SecureStore.deleteItemAsync('restaurantId'); // Remove expired or invalid token securely
      } else {
        router.push('/(res_tabs)');
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      await SecureStore.deleteItemAsync('restaurantId'); // Remove invalid token securely
    }
  }
};

  // Handle Sign In
  const handleSignIn = async () => {
    try {
      setLoading(true);
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required to proceed.');
          setLoading(false); // Hide loading indicator
          return;
        }
      // Get the current location
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const response = await loginRestaurant(restaurantId, latitude, longitude);
      if (response.message == "Login successful") {
        await SecureStore.setItemAsync('restaurantId', response.restaurant.id); // Securely store the token
        Toast.show({
          type: 'success',
          text1: 'Login Successful 😊',
          text2: 'Welcome back! 🎉',
        });
        router.push('/(res_tabs)');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Failed ❌',
          text2: response.message || 'Please try again.',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Sign In Failed ⚠️',
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

          {/* CoolChop Logo */}
          <Image source={require('../assets/images/coolchop.png')} style={styles.logo} />

          {/* Title */}
          <Text style={styles.title}>Let’s Get You Signed In</Text>
          <Text style={styles.subTitle}>Welcome Back</Text>

          {/* Email Input */}
          <InputField
            iconName="envelope"
            placeholder="Restaurant Id"
            value={restaurantId}
            onChangeText={setRestaurantId}
          />

          {/* Password Input */}
          {/* <InputField
            iconName="lock"
            placeholder="Enter password"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          /> */}

          {/* Remember Me and Forgot Password */}
          <View style={styles.options}>
            <View style={styles.rememberMe}>
              <Checkbox 
                uncheckedColor='#D32F2F' 
                status={checked ? 'checked' : 'unchecked'} 
                onPress={() => setChecked(!checked)} 
              />
              <Text>Remember me</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.forgotPassword}>Forgot Id?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <Text style={styles.footerText}>
           Contact the coolchop team if your account hasn't been verified
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
    marginTop: 20,
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
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forgotPassword: {
    color: '#D32F2F',
  },
  signInButton: {
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
  },
  signUpText: {
    color: '#D32F2F',
  },
});
