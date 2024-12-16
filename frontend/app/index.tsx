import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; 
import LottieView from 'lottie-react-native'; 
import { verifyToken } from '../services/api';
import * as SecureStore from 'expo-secure-store';

export default function AuthScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade-in animation for the title
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);
  useEffect(() => {
    checkTokenValidity();
  }, [router]);


// Function to check if token is valid
const checkTokenValidity = async () => {
  const token = await SecureStore.getItemAsync('userId');
  console.log(token)
  if (token) {
    try {
      const isValid = await verifyToken(token);
      if (!isValid) {
        await SecureStore.deleteItemAsync('userId'); // Remove expired or invalid token securely
      } else {
        router.push('/(tabs)');
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      await SecureStore.deleteItemAsync('userId'); // Remove invalid token securely
    }
  }
};



  return (
    <LinearGradient colors={['#fff', '#fff']} style={styles.gradient}>
      <View style={styles.container}>
        
        {/* Cool Animation using Lottie */}
        <LottieView
          source={require('../assets/animations/welcome.json')}
          autoPlay
          loop
          style={styles.lottieAnimation}
        />
        
        {/* Animated Title */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.title}>Welcome</Text>
        </Animated.View>

        <TouchableOpacity style={styles.card} onPress={() => router.push('/customer')}>
          <Image source={require('../assets/images/customer.webp')} style={styles.icon} />
          <View style={styles.cardText}>
            <Text style={styles.optionTitle}>Customer</Text>
            <Text style={styles.arrow}>→</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push('/vendor')}>
          <Image source={require('../assets/images/vendor.webp')} style={styles.icon} />
          <View style={styles.cardText}>
            <Text style={styles.optionTitle}>Vendor</Text>
            <Text style={styles.arrow}>→</Text>
          </View>
        </TouchableOpacity>


        <TouchableOpacity style={styles.card} onPress={() => router.push('/location')}>
          <Image source={require('../assets/images/vendor.webp')} style={styles.icon} />
          <View style={styles.cardText}>
            <Text style={styles.optionTitle}>Vendor</Text>
            <Text style={styles.arrow}>→</Text>
          </View>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieAnimation: {
    width: 150,
    height: 150,
    marginBottom: 20, 
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    width: 320,
    justifyContent: 'space-between',
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  cardText: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
  },
  icon: {
    width: 50,
    height: 50,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  arrow: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FCA204',
  },
});
