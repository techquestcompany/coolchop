import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

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

  const handleAddDish = () => {
    const newDish = { dishName, description, price, ingredients, category };
    setDishes([...dishes, newDish]);

    // Clear input fields after adding
    setDishName('');
    setDescription('');
    setPrice('');
    setIngredients('');
    setCategory('');
  };

  const handleSubmit = () => {
    // Submit all dishes logic
    console.log("Dishes submitted: ", dishes);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>

          <Text style={styles.title}>Add New Dishes</Text>

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
            <Text style={styles.buttonText}>Submit Dishes</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
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
    marginBottom: 10,
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
});
