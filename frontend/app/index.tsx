import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function AuthScreen() {
  return (
    <View style={styles.container}>
      {/* Placeholder for the image */}
      <Image source={require('../assets/images/coolchop.png')} style={styles.image} />

      
      {/* Title */}
      <Text style={styles.text}>Continue as</Text>

      {/* Login button */}
      <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={() => router.push('/customer')}>
        <Text style={styles.buttonText}>Customer</Text>
      </TouchableOpacity>

      {/* Signup button */}
      <TouchableOpacity style={[styles.button, styles.signupButton]} onPress={() => router.push('/vendor')}>
        <Text style={styles.buttonText}>Vendor</Text>
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
    height: 350, 
    marginBottom: 25, 
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
  text: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
  },
});
