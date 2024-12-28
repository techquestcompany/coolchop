import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Animated, ActivityIndicator, SafeAreaView, ScrollView, KeyboardAvoidingView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { submitDishes, api } from '../../services/api';
import Toast from 'react-native-toast-message'; 
import LottieView from 'lottie-react-native'; 
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';


const InputField = ({ iconName, placeholder, value, onChangeText, keyboardType, multiline }) => {
  return (
    <View style={styles.inputContainer}>
      <FontAwesome name={iconName} size={20} color="#B07A7A" style={styles.icon} />
      <TextInput
        style={[styles.input, multiline ? { height: 100 } : null]}
        placeholder={placeholder}
        placeholderTextColor="#B07A7A"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
};

export default function AddDishScreen() {
  const [dishName, setDishName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [category, setCategory] = useState('');
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [profileImage, setProfileImage] = useState(null);
  const [imageName, setImageName] = useState('');



    // Fade-in animation for the title
    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start();
    }, [fadeAnim]);


  const handleAddDish = () => {
    const newDish = { dishName, description, price, ingredients, category, imageName };
    setDishes([...dishes, newDish]);

    // Clear input fields after adding
    setDishName('');
    setDescription('');
    setPrice('');
    setIngredients('');
    setCategory('');
  };


  const handleSubmit = async () => {
 
    try {
      setLoading(true);
  
      // Get restaurantId from local storage
      const restaurantId = await SecureStore.getItemAsync('resId');
      if (!restaurantId) {
        Alert.alert('Error', 'Restaurant ID not found. Please log in again.');
        return;
      }
  
      // Prepare the array of dishes with restaurantId
      const dishesToSubmit = dishes.map((dish) => ({
        ...dish,
        restaurantId,
      }));
  
      // Submit the dishes to the backend
      const response = await submitDishes(dishesToSubmit);
      if (response.message === "Dishes saved successfully") {
        Toast.show({
          type: 'success',
          text1: 'Dishes saved successfully',
          text2: 'Your dish has been submitted!',
        });
        router.push('/reslogin');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Dish Submission Failed',
          text2: response.message || 'Please try again.',
        });
      }
    } catch (error) {
      console.log(error)
      Toast.show({
        type: 'error',
        text1: 'Dish Submission Failed',
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

        {/* Cool Animation using Lottie */}
        <LottieView
          source={require('../../assets/animations/fork.json')}
          autoPlay
          loop
          style={styles.lottieAnimation}
        />
        
        {/* Animated Title */}
        <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.title}>Add New Dishes</Text>
        </Animated.View>


          {/* Profile Picture Upload */}
          <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <FontAwesome name="camera" size={40} color="#B07A7A" />
            )}
            <Text style={styles.imagePickerText}>Upload Food Picture</Text>
          </TouchableOpacity>

                                                                                
          {/* Dish Name */}
          <InputField
            iconName="cutlery"
            placeholder="Dish Name"
            value={dishName}
            onChangeText={setDishName}
          />

          {/* Dish Description */}
          <InputField
            iconName="info-circle"
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {/* Price */}
          <InputField
            iconName="dollar"
            placeholder="Price"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />

          {/* Ingredients */}
          <InputField
            iconName="leaf"
            placeholder="Ingredients"
            value={ingredients}
            onChangeText={setIngredients}
          />

          {/* Category */}
          <InputField
            iconName="list-alt"
            placeholder="Category (e.g., Starter, Main Course)"
            value={category}
            onChangeText={setCategory}
          />

          {/* Add Dish Button */}
          <TouchableOpacity style={styles.addButton} onPress={handleAddDish}>
            <Text style={styles.buttonText}>Add Dish</Text>
          </TouchableOpacity>

          {/* Display Added Dishes */}
          {dishes.length > 0 && (
            <View style={styles.dishesContainer}>
              <Text style={styles.dishesTitle}>Added Dishes:</Text>
              {dishes.map((dish, index) => (
                <View key={index} style={styles.dishItem}>
                  <Text style={styles.dishName}>{dish.dishName}</Text>
                  <Text style={styles.dishDetails}>Category: {dish.category}</Text>
                  <Text style={styles.dishDetails}>Price: ${dish.price}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Submit Dishes</Text>
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
  title: {
    fontSize: 24,
    color: '#D32F2F',
    fontWeight: 'bold',
    marginBottom:40,
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
  addButton: {
    width: '100%',
    backgroundColor: '#D32F2F',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  dishesContainer: {
    width: '100%',
    marginTop: 20,
  },
  dishesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dishItem: {
    backgroundColor: '#FFF1F1',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  dishName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dishDetails: {
    fontSize: 14,
    color: '#555',
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  lottieAnimation: {
    width: 150,
    height: 150,
    marginBottom: 20, 
  },
});
