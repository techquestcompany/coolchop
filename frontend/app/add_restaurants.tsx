import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Image, ScrollView, KeyboardAvoidingView, SafeAreaView, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; 
import { router } from 'expo-router';
import { registerRestaurant, uploadImage } from '../services/api';
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

export default function RestaurantRegistrationScreen() {
  const [restaurantName, setRestaurantName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle restaurant registration
  const handleRegistration = async () => {
    if (!restaurantName || !email || !address) {
      Alert.alert("All fields are required");
      return;
    }
    else if (password !== confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await registerRestaurant(restaurantName, email, phone, address, password, profileImage);
      if (response.message == "Restaurant registered successfully") {
        Toast.show({
          type: 'success',
          text1: 'Registration Successful',
          text2: 'Your restaurant has been registered!',
        });
        router.push('/add_dish');
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
    } finally {
      setLoading(false);
    }
  };

     // Select Profile Image
     const pickImage = async () => {
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
        const response = await uploadImage(profileImage);
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
    };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={24} color="#D32F2F" />
          </TouchableOpacity>

          {/* Logo */}
          <Image source={require('../assets/images/restaurant.webp')} style={styles.logo} />

          {/* Title */}
          <Text style={styles.title}>Register Your Restaurant</Text>
          <Text style={styles.subTitle}>Please provide the details below to register your restaurant 🍽️</Text>

          {/* Profile Picture Upload */}
          <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <FontAwesome name="camera" size={40} color="#B07A7A" />
            )}
            <Text style={styles.imagePickerText}>Upload Profile Picture</Text>
          </TouchableOpacity>


          {/* Restaurant Name Input */}
          <InputField
            iconName="building"
            placeholder="Restaurant Name"
            value={restaurantName}
            onChangeText={setRestaurantName}
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

          {/* Address Input */}
          <InputField
            iconName="map-marker"
            placeholder="Restaurant Address"
            value={address}
            onChangeText={setAddress}
          />
          
          {/* Password Input */}
          <InputField
            iconName="lock"
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Re-type Password Input */}
          <InputField
            iconName="lock"
            placeholder="Re-type Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {/* Register Button */}
          <TouchableOpacity style={styles.registerButton} onPress={(handleRegistration)}>
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
          </TouchableOpacity>
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
  logo: {
    width: 180,
    height: 380,
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
  registerButton: {
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
});
