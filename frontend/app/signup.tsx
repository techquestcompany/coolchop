import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Image, ScrollView, KeyboardAvoidingView, SafeAreaView, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { signUp, api } from '../services/api';
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

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imageName, setImageName] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle Sign Up
  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await signUp(name, email, phone, password, imageName);
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

          {/* CoolChop Logo */}
          <Image source={require('../assets/images/coolchop.png')} style={styles.logo} />

          {/* Title */}
          <Text style={styles.title}>Sign Up</Text>
          <Text style={styles.subTitle}>Please sign up to get started 😊</Text>

            {/* Profile Picture Upload */}
            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <FontAwesome name="camera" size={40} color="#B07A7A" />
            )}
            <Text style={styles.imagePickerText}>Upload Profile Picture</Text>
          </TouchableOpacity>


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

          {/* Re-type Password Input */}
          <InputField
            iconName="lock"
            placeholder="Re-type Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
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

          {/* Login Link */}
          <Text style={{marginTop: 20, marginBottom: 30,}}>
            Already have an account?{' '}
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={{ color: '#D32F2F', }} >Login</Text>
            </TouchableOpacity>
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