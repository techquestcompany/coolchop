import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

export default function AuthScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  /** Fade animation */
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <LinearGradient colors={['#fff', '#fff']} style={styles.gradient}>
      <View style={styles.container}>

        <LottieView
          source={require('../assets/animations/welcome.json')}
          autoPlay
          loop
          style={styles.lottie}
        />

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.title}>Welcome</Text>
        </Animated.View>

        {/* CUSTOMER */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/login')}
        >
          <Image source={require('../assets/images/customer.webp')} style={styles.icon} />
          <View style={styles.cardText}>
            <Text style={styles.option}>Customer</Text>
            <Text style={styles.arrow}>→</Text>
          </View>
        </TouchableOpacity>

        {/* VENDOR */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/reslogin')}
        >
          <Image source={require('../assets/images/vendor_home.webp')} style={styles.icon} />
          <View style={styles.cardText}>
            <Text style={styles.option}>Vendor</Text>
            <Text style={styles.arrow}>→</Text>
          </View>
        </TouchableOpacity>

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  lottie: {
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
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    width: 320,
    justifyContent: 'space-between',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },

  cardText: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    justifyContent: 'space-between',
  },

  icon: { width: 50, height: 50 },
  option: { fontSize: 20, fontWeight: 'bold' },
  arrow: { fontSize: 24, fontWeight: 'bold', color: '#FCA204' },
});
