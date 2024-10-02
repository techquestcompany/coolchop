import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function SignUpScreen() {
  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Sign Up</Text>
      <Text style={styles.subTitle}>Please sign up to get started</Text>

      {/* Name Input */}
      <TextInput style={styles.input} placeholder="Name" placeholderTextColor="#B07A7A" />

      {/* Email Input */}
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#B07A7A" keyboardType="email-address" />

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#B07A7A" secureTextEntry={true} />
        <TouchableOpacity>
          <Text style={styles.eyeIcon}>👁️</Text> {/* Use an eye icon */}
        </TouchableOpacity>
      </View>

      {/* Re-type Password Input */}
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Re-type Password" placeholderTextColor="#B07A7A" secureTextEntry={true} />
        <TouchableOpacity>
          <Text style={styles.eyeIcon}>👁️</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity style={styles.signUpButton}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Footer Text */}
      <Text style={styles.footerText}>
        By continuing with an account located in Ghana, you agree to our{' '}
        <Text style={styles.linkText}>Terms of Service</Text> and acknowledge that you have read our{' '}
        <Text style={styles.linkText}>Privacy Policy</Text>.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
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
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#FAD4D4',
    borderRadius: 10,
    backgroundColor: '#FAD4D4',
    marginBottom: 20,
    fontSize: 16,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#FAD4D4',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#FAD4D4',
    marginBottom: 20,
  },
  eyeIcon: {
    fontSize: 18,
  },
  signUpButton: {
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
