import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Image, ScrollView, KeyboardAvoidingView, SafeAreaView, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; 
import { router } from 'expo-router';
import { signUp, uploadImage } from '../services/api';
import Toast from 'react-native-toast-message'; 
import * as ImagePicker from 'expo-image-picker';

const InputField = ({ iconName, placeholder, secureTextEntry, value, onChangeText, keyboardType }) => {
  return (
    <View style={styles.inputContainer}>
      <FontAwesome name={iconName} size={20} color="#B07A7A" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#B07A7A"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle Sign Up
  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await signUp(name, email, phone, password);
      if (response.message == "User created successfully") {
        Toast.show({
          type: 'success',
          text1: 'Sign up Successful',
          text2: 'Welcome! 🎉',
        });
        router.push('/login');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Sign up Failed',
          text2: response.message || 'Please try again.',  
        });
      }   
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Sign Up Failed',
        text2: error.message || 'Something went wrong.',
      });
    } finally {
      setLoading(false);
    }
  };

   // Select Profile Image
   /*const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }

    try{
      console.log(result.assets[0].uri);
      const response = await uploadImage(result.assets[0].uri);
      console.log(response);
      if (response.message == "Restaurant registered successfully") {
        Toast.show({
          type: 'success',
          text1: 'Registration Successful',
          text2: 'Your restaurant has been registered!',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: response.message || 'Please try again.',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error.message || 'Something went wrong.',
      });
    }
  };*/

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={24} color="#D32F2F" />
          </TouchableOpacity>

          {/* CoolChop Logo */}
          <Image source={require('../assets/images/coolchop.png')} style={styles.logo} />

          {/* Title */}
          <Text style={styles.title}>Sign Up</Text>
          <Text style={styles.subTitle}>Please sign up to get started 😊</Text>

          {/* Name Input */}
          <InputField
            iconName="user"
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />

          {/* Email Input */}
          <InputField
            iconName="envelope"
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          
          {/* Phone Input */}
          <InputField
            iconName="phone"
            placeholder="Phone"
            keyboardType="numeric"
            value={phone}
            onChangeText={setPhone}
          />

          {/* Password Input */}
          <InputField
            iconName="lock"
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

         

          {/* Sign Up Button */}
          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
          </TouchableOpacity>

          {/* Footer Text */}
          <Text style={styles.footerText}>
            By continuing with an account located in Ghana, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text> and acknowledge that you have read our{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast ref={(ref) => Toast.setRef(ref)} />
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
  imagePicker: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  imagePickerText: {
    color: '#B07A7A',
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
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
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
