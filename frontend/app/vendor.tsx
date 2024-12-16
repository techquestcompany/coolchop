import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; 

export default function AuthScreen() {
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome name="arrow-left" size={24} color="#D32F2F" />
      </TouchableOpacity>
      {/* Placeholder for the image */}
      <Image source={require('../assets/images/vendor.png')} style={styles.image} />

      {/* Login button */}
      <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={() => router.push('/reslogin')}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={() => router.push('/add_restaurants')}>
        <Text style={styles.buttonText}>Signup </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff',
  },
  image: {
    width: 350,
    height: 300, 
    marginBottom: 55, 
  },
  button: {
    width: 320,
    paddingVertical: 15,
    backgroundColor: '#007BFF',
    borderRadius: 10, 
    alignItems: 'center', 
    marginBottom: 25, 
  },
  loginButton: {
    backgroundColor: '#FCA204', 
  },
  signupButton: {
    backgroundColor: '#DC2C10', 
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
});
