import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image, Button } from "react-native";
import * as ExpoImagePicker from "expo-image-picker";

const VendorLogo = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Request permission and pick an image
  const pickImage = async () => {
    // Request media library permission
    const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access media library is required!");
      return;
    }

    // Open the image picker
    let result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], 
      quality: 1, // Quality of the picked image
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose an Image for your brand</Text>
      
      {/* Show selected image or default message */}
      {selectedImage ? (
        <Image source={{ uri: selectedImage }} style={styles.image} />
      ) : (
        <Text>No logo selected</Text>
      )}

      <TouchableOpacity onPress={pickImage} style={styles.button}>
        <Text style={styles.buttonText}>Pick an Image</Text>
      </TouchableOpacity>
      
      {/* Alternatively, you can use Button component */}
      {/* <Button title="Pick an Image" onPress={pickImage} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#D32F2F",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default VendorLogo;
  