import { router } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import axios from 'axios';
import { getApiErrorMessage, getUserData, verifyResToken } from '@/services/api';
import { getStoredToken, removeStoredItem, setStoredItem } from '@/services/authStorage';

export default function AuthScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState('');

  /** Fade animation */
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const restoreSession = useCallback(async () => {
    setCheckingSession(true);
    setSessionError('');
    try {
      const [role, customerToken, restaurantToken] = await Promise.all([
        getStoredToken('role'),
        getStoredToken('customer_token'),
        getStoredToken('restaurant_token'),
      ]);

      if (role === 'vendor' && restaurantToken) {
        await verifyResToken(restaurantToken);
        router.replace('/(res_tabs)');
        return;
      }

      if (customerToken) {
        const user = await getUserData(customerToken);
        const resolvedRole = user.role;
        await setStoredItem('role', resolvedRole);

        if (resolvedRole === 'admin') {
          router.replace('/admin');
        } else if (resolvedRole === 'rider') {
          router.replace('/riderHomepage');
        } else {
          router.replace('/(tabs)');
        }
        return;
      }
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status === 401 || status === 403 || status === 404) {
        await Promise.all([
          removeStoredItem('customer_token'),
          removeStoredItem('restaurant_token'),
          removeStoredItem('role'),
          removeStoredItem('userId'),
        ]);
        setSessionError('Your session expired. Please sign in again.');
      } else {
        setSessionError(getApiErrorMessage(error, "We couldn't restore your session. Check your connection and try again."));
      }
    } finally {
      setCheckingSession(false);
    }
  }, []);

  React.useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (checkingSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D32F2F" />
      </View>
    );
  }

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
        {sessionError ? (
          <View style={styles.sessionMessage}>
            <Text style={styles.sessionError}>{sessionError}</Text>
            <TouchableOpacity onPress={restoreSession}>
              <Text style={styles.retry}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sessionMessage: { alignItems: 'center', marginBottom: 16 },
  sessionError: { color: '#B00020', textAlign: 'center', marginHorizontal: 24 },
  retry: { color: '#D32F2F', fontWeight: 'bold', marginTop: 8 },

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
