import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Image, ScrollView, KeyboardAvoidingView, SafeAreaView, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { registerRestaurant, api } from '../services/api';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';



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
  const [description, setDescription] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [imageName, setImageName] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle restaurant registration
  const handleRegistration = async () => {
    if (!restaurantName || !email || !address) {
      Alert.alert("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const response = await registerRestaurant(restaurantName, email, phone, address, description, imageName);
      if (response.message == "Restaurant registered successfully") {
        Toast.show({
          type: 'success',
          text1: 'Registration Successful',
          text2: 'Your restaurant has been registered!',
        });
        router.push('/reslogin ');
        setAddress('');
        setEmail('');
        setProfileImage('');
        setImageName('');
        setDescription('');
        setRestaurantName('');
        setPhone('');
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
      // Request permission to access media library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need permission to access your media library.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        // Get the URI of the selected image
        const sourceUri = result.assets[0].uri;

        try {
          const fileInfo = await FileSystem.getInfoAsync(sourceUri);
          const formData = new FormData();
          formData.append('file', {
            uri: sourceUri,
            name: fileInfo.uri.split('/').pop(),
            type: 'image/jpeg',
          });

          // Upload the image to your server
          const response = await api.post('/upload/upload_image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          if (response.data.success) {
            const serverImageUrl = response.data.url;
            setProfileImage(serverImageUrl);
            setImageName(response.data.imageName);

          } else {
            Alert.alert('Error', 'Failed to upload the image');
          }
        } catch (error) {
          console.error('Error uploading the image:', error);
          Alert.alert('Error', 'Failed to upload the image');
        }
      }
    };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={30} color="#D32F2F" />
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

          {/* Description Input */}
          <InputField
            iconName="pencil-square-o"
            placeholder="Restaurant Description"
            value={description}
            onChangeText={setDescription}
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
    marginTop: 20,
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