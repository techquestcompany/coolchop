import React, { useState, useRef } from 'react';
import { View, Text, TextInput, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { verify, getUserData } from '../services/api';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';


const VerificationScreen = () => {
  const [code, setCode] = useState(['', '', '', '']);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [loading, setLoading] = useState(false);

  const handleChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleVerify = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('userId');
      console.log(token) 
      if (!token) {
        throw new Error('No authentication token found');
      }

      const user = await getUserData(token);
      const email = user.email;

      const response = await verify(email, code.join(''));
      if (response.message == "Code verified successfully") {
        Toast.show({
          type: 'success',
          text1: 'Code verified successfully 😊',
        });
        router.push('/(tabs)');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Verification Failed ❌',
          text2: response.message || 'Please try again.',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Verification Failed ⚠️',
        text2: error.message || 'Something went wrong.',
      });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Verification</Text>
        <Text style={styles.subtitle}>We have sent a code to your email</Text>
      </View>

    <View style={styles.verifyView}>
        <View style={styles.codeContainer}>
            {code.map((digit, index) => (
            <TextInput
                key={index}
                ref={inputRefs[index]}
                style={styles.input}
                value={digit}
                keyboardType="numeric"
                maxLength={1}
                onChangeText={(text) => handleChange(text, index)}
            />
            ))}
        </View>

        <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
            {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>VERIFY</Text>
            )}
        </TouchableOpacity>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D32F2F',
  },
  title: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 30,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  input: {
    width: 50,
    height: 50,
    backgroundColor: '#FFE0E0',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  verifyButton: {
    backgroundColor: '#D32F2F',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  verifyView: {
    backgroundColor: '#fff', 
    width: '100%', 
    height: '70%', 
    position: 'absolute',
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    borderTopRightRadius: 40,
    borderTopLeftRadius: 40,
    paddingTop: 100
  },
  textContainer:{
    position: 'absolute',
    top: 100,
    display: 'flex',
    alignItems: 'center',
  }
});

export default VerificationScreen;
