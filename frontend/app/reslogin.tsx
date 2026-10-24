import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Checkbox } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { loginRestaurant, verifyToken } from '../services/api';
import Toast from 'react-native-toast-message';
import { FontAwesome } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

const InputField = ({ iconName, placeholder, secureTextEntry, value, onChangeText, toggleSecure, isPassword }) => {
  return (
    <View style={styles.inputContainer}>
      <FontAwesome name={iconName} size={20} color="#B07A7A" style={styles.icon} />
      <TextInput
        style={[styles.input, { flex: 1 }]}
        placeholder={placeholder}
        placeholderTextColor="#B07A7A"
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
      />
      {isPassword && (
        <TouchableOpacity onPress={toggleSecure} style={{ padding: 4 }}>
          <FontAwesome
            name={secureTextEntry ? 'eye-slash' : 'eye'}
            size={20}
            color="#B07A7A"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

async function saveItem(key, value) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getItem(key) {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

async function removeItem(key) {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export default function VendorLoginScreen() {
  const [checked, setChecked] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkTokenValidity();
  }, []);

  const checkTokenValidity = async () => {
    const token = await getItem('restaurant_token');
    const role = await getItem('role');

    if (token && role === 'vendor') {
      try {
        const isValid = await verifyToken(token);
        if (!isValid) {
          await removeItem('restaurant_token');
          await removeItem('role');
        } else {
          router.push('/(res_tabs)');
        }
      } catch (error) {
        console.log('Token verification failed:', error);
        await removeItem('restaurant_token');
        await removeItem('role');
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    setLoading(true);

    try {
      const res = await loginRestaurant(email, password);

      if (res.message?.trim() === 'Login successful' && res.token) {
        await saveItem('restaurant_token', res.token);
        await saveItem('role', 'vendor');

        Toast.show({
          type: 'success',
          text1: 'Login successful!',
          text2: 'Welcome back.',
        });

        router.push('/(res_tabs)');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login failed',
          text2: res.message || 'Please try again.',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Login failed',
        text2: 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={30} color="#D32F2F" />
          </TouchableOpacity>

          <Image source={require('../assets/images/coolchop.png')} style={styles.logo} />

          <Text style={styles.title}>Let’s Get You Signed In</Text>
          <Text style={styles.subTitle}>Vendor Portal</Text>

          <InputField
            iconName="envelope"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />

          <InputField
            iconName="lock"
            placeholder="Enter password"
            secureTextEntry={showPassword}
            value={password}
            onChangeText={setPassword}
            toggleSecure={togglePasswordVisibility}
            isPassword={true}
          />

          <View style={styles.options}>
            <View style={styles.rememberMe}>
              <Checkbox
                uncheckedColor="#D32F2F"
                status={checked ? 'checked' : 'unchecked'}
                onPress={() => setChecked(!checked)}
              />
              <Text>Remember me</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/forgot_password')}>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.signInButton} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Don’t have an account?{' '}
            <TouchableOpacity onPress={() => router.push('/add_restaurants')}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
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
    paddingHorizontal: 10,
    backgroundColor: '#FAD4D4',
    width: '100%',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    fontSize: 16,
    color: '#000',
    minHeight: 52,
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
