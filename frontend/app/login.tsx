import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Checkbox } from 'react-native-paper'; 

export default function SignInScreen() {
  const [checked, setChecked] = React.useState(false);

  return (
    <View style={styles.container}>
      {/* CoolChop Logo */}
      <Image source={require('../assets/images/coolchop.png')} style={styles.logo} />

      {/* Title */}
      <Text style={styles.title}>Let’s Get You Signed In</Text>
      <Text style={styles.subTitle}>Welcome Back</Text>

      {/* Phone Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.countryCode}>+233</Text>
        <TextInput style={styles.input} placeholder="Enter phone number" placeholderTextColor="#B07A7A" />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Enter password" placeholderTextColor="#B07A7A" secureTextEntry={true} />
        <TouchableOpacity>
          <Text style={styles.eyeIcon}>👁️</Text> {/* Use an eye icon or library */}
        </TouchableOpacity>
      </View>

      {/* Remember Me and Forgot Password */}
      <View style={styles.options}>
        <View style={styles.rememberMe}>
          <Checkbox status={checked ? 'checked' : 'unchecked'} onPress={() => setChecked(!checked)} />
          <Text>Remember me</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      {/* Sign In Button */}
      <TouchableOpacity style={styles.signInButton}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      {/* Sign Up Link */}
      <Text style={styles.footerText}>
        Don’t have an account?{' '}
        <TouchableOpacity>
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>
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
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
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
  countryCode: {
    paddingRight: 10,
    color: '#000',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  eyeIcon: {
    fontSize: 18,
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
