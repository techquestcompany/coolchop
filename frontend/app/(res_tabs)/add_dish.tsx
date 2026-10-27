import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Animated, ActivityIndicator, SafeAreaView, ScrollView, KeyboardAvoidingView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { submitDishes, api, getApiErrorMessage } from '../../services/api';
import Toast from 'react-native-toast-message'; 
import LottieView from 'lottie-react-native'; 
import * as ImagePicker from 'expo-image-picker';
import { getStoredToken } from '@/services/authStorage';

// Reusable Input Field
const InputField = ({ iconName, placeholder, value, onChangeText, keyboardType, multiline }) => (
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

export default function AddDishScreen() {
  const [dishName, setDishName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [category, setCategory] = useState('');
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [dishImages, setDishImages] = useState([]); // Array for multiple images

  // Fade-in animation for the title
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Pick Image Function (up to 3 images)
  const pickImage = async () => {
    if (dishImages.length >= 3) {
      Alert.alert('Limit reached', 'You can only upload up to 3 images per dish.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need permission to access your media library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const sourceUri = result.assets[0].uri;

      try {
        const token = await getStoredToken('restaurant_token');
        if (!token) {
          Alert.alert('Sign in required', 'Please sign in to your restaurant account before uploading images.');
          return;
        }

        const asset = result.assets[0];
        const fileName = asset.fileName || sourceUri.split(/[?#]/)[0].split('/').pop() || 'dish-image.jpg';
        const formData = new FormData();
        formData.append('file', {
          uri: sourceUri,
          name: fileName,
          type: asset.mimeType || 'image/jpeg',
        });

        const response = await api.post('/upload/upload_image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          const newImage = {
            uri: response.data.url,
            name: response.data.imageName,
          };
          setDishImages(prev => [...prev, newImage]);
        } else {
          Alert.alert('Error', 'Failed to upload the image');
        }
      } catch (error) {
        console.error('Error uploading the image:', error);
        Alert.alert(
          'Unable to upload image',
          getApiErrorMessage(error, "We couldn't upload your image. Please try again.")
        );
      }
    }
  };

  // Delete a selected image
  const handleDeleteImage = (index) => {
    const updatedImages = [...dishImages];
    updatedImages.splice(index, 1);
    setDishImages(updatedImages);
  };

  // Add dish to list
  const handleAddDish = () => {
    if (!dishName || !description || !price || !ingredients || !category || dishImages.length === 0) {
      Alert.alert('Error', 'Please fill in all fields and upload at least one image.');
      return;
    }

    const newDish = {
      dishName,
      description,
      price,
      ingredients,
      category,
      images: dishImages, // Array of images
    };

    setDishes([...dishes, newDish]);

    // Clear input fields
    setDishName('');
    setDescription('');
    setPrice('');
    setIngredients('');
    setCategory('');
    setDishImages([]);
  };

  // Delete dish from list
  const handleDeleteDish = (index) => {
    const updatedDishes = [...dishes];
    updatedDishes.splice(index, 1);
    setDishes(updatedDishes);
  };

  // Submit dishes to backend
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('restaurant_token');
      console.log('dish TOKEN:', token); 
      if (!token) {
        Alert.alert('Error', 'Token not found. Please log in again.');
        return;
      }

      const dishesToSubmit = dishes.map(d => ({
        dishName: d.dishName,
        price: d.price,
        description: d.description,
        ingredients: d.ingredients,
        category: d.category,
        images: d.images.map(img => ({ name: img.name })), 
      }));

      const response = await submitDishes(dishesToSubmit, token);
      if (response.message === "Dishes saved successfully") {
        Toast.show({ type: 'success', text1: 'Dishes saved successfully', text2: 'Your dishes have been submitted!' });
        router.push('/(res_tabs)');
      } else {
        Toast.show({ type: 'error', text1: 'Dish Submission Failed', text2: response.message || 'Please try again.' });
      }
    } catch (error) {
      console.error("Dish submission failed:", error);
      Toast.show({
        type: 'error',
        text1: 'Dish Submission Failed',
        text2: getApiErrorMessage(error, "We couldn't submit your dishes. Please try again."),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <LottieView source={require('../../assets/animations/fork.json')} autoPlay loop style={styles.lottieAnimation} />
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.title}>Add New Dishes</Text>
          </Animated.View>

          {/* Image Upload */}
          <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
            <FontAwesome name="camera" size={40} color="#B07A7A" />
            <Text style={styles.imagePickerText}>Upload Food Image (up to 3)</Text>
          </TouchableOpacity>

          {/* Show uploaded images */}
          <View style={styles.imagePreviewContainer}>
            {dishImages.map((img, i) => (
              <View key={i} style={styles.imageWrapper}>
                <Image source={{ uri: img.uri }} style={styles.dishImage} />
                <TouchableOpacity style={styles.removeImageButton} onPress={() => handleDeleteImage(i)}>
                  <Text style={styles.removeImageText}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Dish Fields */}
          <InputField iconName="cutlery" placeholder="Dish Name" value={dishName} onChangeText={setDishName} />
          <InputField iconName="info-circle" placeholder="Description" value={description} onChangeText={setDescription} multiline />
          <InputField iconName="dollar" placeholder="Price" value={price} onChangeText={setPrice} keyboardType="numeric" />
          <InputField iconName="leaf" placeholder="Ingredients" value={ingredients} onChangeText={setIngredients} />
          <InputField iconName="list-alt" placeholder="Category (e.g., Starter, Main Course)" value={category} onChangeText={setCategory} />

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
                  {dish.images.map((img, i) => (
                    <Image key={i} source={{ uri: img.uri }} style={styles.dishImage} />
                  ))}
                  <Text style={styles.dishName}>{dish.dishName}</Text>
                  <Text style={styles.dishDetails}>Category: {dish.category}</Text>
                  <Text style={styles.dishDetails}>Price: ₵{dish.price}</Text>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteDish(index)}>
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            {loading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.buttonText}>Submit Dishes</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  title: { fontSize: 24, color: '#D32F2F', fontWeight: 'bold', marginBottom: 40 },
  imagePicker: { alignItems: 'center', marginBottom: 10 },
  imagePickerText: { color: '#B07A7A', marginTop: 5 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#FAD4D4', borderRadius: 10, marginBottom: 20, padding: 10, backgroundColor: '#FAD4D4' },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#000' },
  addButton: { width: '100%', backgroundColor: '#D32F2F', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18 },
  dishesContainer: { width: '100%', marginTop: 20 },
  dishesTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  dishItem: { backgroundColor: '#FFF1F1', padding: 15, borderRadius: 10, marginBottom: 10 },
  dishName: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  dishDetails: { fontSize: 14, color: '#555' },
  submitButton: { width: '100%', backgroundColor: '#28A745', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  dishImage: { width: 100, height: 100, borderRadius: 10, marginBottom: 10 },
  lottieAnimation: { width: 150, height: 150, marginBottom: 20 },
  deleteButton: { marginTop: 10, backgroundColor: '#FF5252', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 5, alignSelf: 'flex-start' },
  deleteButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  imagePreviewContainer: { flexDirection: 'row', marginBottom: 10 },
  imageWrapper: { marginRight: 10, position: 'relative' },
  removeImageButton: { position: 'absolute', top: -5, right: -5, backgroundColor: '#FF5252', borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  removeImageText: { color: '#fff', fontWeight: 'bold' },
});
