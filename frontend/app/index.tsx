import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function AuthScreen() {
  return (
    <View style={styles.container}>
      {/* Placeholder for the image */}
      <Image source={require('../assets/images/delivery.png')} style={styles.image} />

      {/* Login button */}
      <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={() => router.push('/login')}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Signup button */}
      <TouchableOpacity style={[styles.button, styles.signupButton]} onPress={() => router.push('/signup')}>
        <Text style={styles.buttonText}>Signup</Text>
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
});
