import React, { useState, useRef } from 'react';
import { View, Text, TextInput, ActivityIndicator, TouchableOpacity, StyleSheet,Button } from 'react-native';
import { router } from 'expo-router';
import { verify,sendVerification, getUserData } from '../services/api';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from 'expo-router/react-navigation';


const VerificationScreen = () => {
  const [code, setCode] = useState(['', '', '', '']);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [loading, setLoading] = useState(false);
  const navigtor = useNavigation()
  const route = useRoute()

  const {email} = route.params
  const handleChange = (text, index) => {
    const newCode = [...code];
  
    if (text === '') {
      newCode[index] = '';
      if (index > 0) inputRefs[index - 1].current.focus(); // Move to previous input on delete
    } else {
      newCode[index] = text;
      if (index < 3) inputRefs[index + 1].current.focus(); // Move to next input on input
    }
  
    setCode(newCode);
  };
  
  const handleVerify = async () => {
    console.log("sending email and code",email , code)
    try {
      setLoading(true);
      
      // Validate if the user has entered all 4 digits
      if (code.some(digit => digit === '')) {
        Toast.show({
          type: 'error',
          text1: 'Verification Failed ⚠️',
          text2: 'Please enter all 4 digits.',
        });
        setLoading(false);
        return;
      }
  
    

  
      console.log("Verifying email:", email);
      console.log("Verification code:", code.join(''));
  
      // Call the verification API
      const response = await verify(email, code.join(''));
  
      console.log("Verification response:", response); 
  
      if (response?.message) { 
        Toast.show({
          type: 'success',
          text1: 'Code verified successfully 😊',
        });
        router.push('login'); 
      } else {
        Toast.show({
          type: 'error',
          text1: 'Verification Failed ❌',
          text2: response.message || 'Please try again.',
        });
      }
    } catch (error) {
      console.error("Verification Error:", error);
      Toast.show({
        type: 'error',
        text1: 'Verification Failed ⚠️',
        text2: error.message || 'Something went wrong.',
      });
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
