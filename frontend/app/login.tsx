import React, { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, ActivityIndicator, StyleSheet, Image, ScrollView, KeyboardAvoidingView, SafeAreaView, Platform } from 'react-native';
import { Checkbox } from 'react-native-paper'; 
import { router } from 'expo-router';
import { login } from '../services/api';
import Toast from 'react-native-toast-message';
import { FontAwesome } from '@expo/vector-icons'; 
import * as SecureStore from 'expo-secure-store';
//import Platform from "react-native";

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
            name={secureTextEntry ? "eye-slash" : "eye"}
            size={20}
            color="#B07A7A"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function SignInScreen() {
  const [checked, setChecked] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


//second sign in function
const handleSignIn = async () => {
  try {
    setLoading(true);

    const response = await login(email, password);
    console.log("Login response:", response);

    if (
      response.message?.toLowerCase() === "login successful" &&
      response.user?.token &&
      response.user?.role
    ) {
      const { role, token } = response.user;

      // 🔐 Store role + token
      if (Platform.OS === "android") {
        await SecureStore.setItemAsync("role", role);
        await SecureStore.setItemAsync("customer_token", token);
      } else if (Platform.OS === "web") {
        localStorage.setItem("role", role);
        localStorage.setItem("customer_token", token);
      }

      Toast.show({
        type: "success",
        text1: "Login Successful 😊",
        text2: `Welcome back, ${role}!`,
      });

      //  ROLE-BASED NAVIGATION
      if (response.user.email === "admin@coolchop.com") {
        router.replace("/admin");
      } else if (role.toLowerCase() === "rider") {
        router.replace("/riderHomepage");
      } else {
        router.replace("/UserHome"); // customer
      }

    } else {
      Toast.show({
        type: "error",
        text1: "Login Failed ❌",
        text2: response.message || "Invalid credentials",
      });
    }
  } catch (error) {
    console.error("Sign-in error:", error);
    Toast.show({
      type: "error",
      text1: "Sign In Failed ⚠️",
      text2: error.response?.data?.message || "Something went wrong",
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
          <Text style={styles.subTitle}>Welcome Back</Text>

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
                uncheckedColor='#D32F2F' 
                status={checked ? 'checked' : 'unchecked'} 
                onPress={() => setChecked(!checked)} 
              />
              <Text>Remember me</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/forgot_password')}>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Don’t have an account?{' '}
            <TouchableOpacity onPress={() => router.push('/signup')}>
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
  },
  icon: {
    marginRight: 10,
  },
  input: {
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
