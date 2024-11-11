import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { confimrUserLocation } from '../../services/api';
import useCheckAuthAndNavigateToIndex from '../../components/checkId';

const HomeScreen = () => {
  useCheckAuthAndNavigateToIndex(); 
  const [userLocation, setUserLocation] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkUserLocation = async () => {
      const userId = await AsyncStorage.getItem('userId');
      const userData = await confimrUserLocation(userId); 
      setUserLocation("Yet to get user location");
    };

    checkUserLocation();
  }, []);

  // Dummy Restaurants Data
  const restaurants = [
    { id: '1', name: 'Restaurant 1', imageUrl: 'https://dummyimage.com/100x100/000/fff&text=Rest1' },
    { id: '2', name: 'Restaurant 2', imageUrl: 'https://dummyimage.com/100x100/000/fff&text=Rest2' },
    { id: '3', name: 'Restaurant 3', imageUrl: 'https://dummyimage.com/100x100/000/fff&text=Rest3' },
  ];

  // Dummy Dishes Data
  const dishes = [
    { id: '1', dishName: 'Jollof Rice', description: 'Delicious West African dish', location: 'Restaurant 1', price: 10, imageUrl: 'https://dummyimage.com/100x100/000/fff&text=Jollof' },
    { id: '2', dishName: 'Burger', description: 'Juicy grilled burger', location: 'Restaurant 2', price: 12, imageUrl: 'https://dummyimage.com/100x100/000/fff&text=Burger' },
    { id: '3', dishName: 'Shawarma', description: 'Tasty middle-eastern wrap', location: 'Restaurant 3', price: 8, imageUrl: 'https://dummyimage.com/100x100/000/fff&text=Shawarma' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.locationText}>Your location now is {userLocation || 'Fetching location...'}</Text>
      <Text style={styles.title}>COOL CHOP</Text>

      {/* Search Menu */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchInput}>search menu</Text>
      </View>

      {/* Restaurants Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Restaurants</Text>
        <FlatList
          data={restaurants}
          horizontal
          renderItem={({ item }) => (
            <View style={styles.restaurantCard}>
              <Image source={{ uri: item.imageUrl }} style={styles.restaurantImage} />
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{item.name}</Text>
                <Text style={styles.restaurantDescription}>Brief description here</Text>
                <Text style={styles.restaurantLocation}>Location</Text>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>


      {/* Dishes Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Dishes</Text>
        <FlatList
          data={dishes}
          renderItem={({ item }) => (
            <View style={styles.dishCard}>
              <Image source={{ uri: item.imageUrl }} style={styles.dishImage} />
              <View style={styles.dishInfo}>
                <Text style={styles.dishName}>{item.dishName}</Text>
                <Text style={styles.dishDescription}>{item.description}</Text>
                <Text style={styles.dishLocation}>{item.location}</Text>
                <Text style={styles.dishPrice}>${item.price}</Text>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  locationText: {
    marginTop: 20,
    color: '#999',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#D32F2F',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  searchInput: {
    width: '80%',
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#F1F1F1',
    textAlign: 'center',
  },
  sectionContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dishCard: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  dishImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  dishInfo: {
    marginLeft: 10,
    flex: 1,
    justifyContent: 'center',
  },
  dishName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dishDescription: {
    fontSize: 14,
    color: '#555',
  },
  dishLocation: {
    fontSize: 12,
    color: '#777',
  },
  dishPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
   restaurantCard: {
    width: 200,
    borderRadius: 20,
    backgroundColor: '#FFF',
    padding: 10,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  restaurantImage: {
    width: '100%',
    height: 120,
    borderRadius: 15,
  },
  restaurantInfo: {
    marginTop: 10,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  restaurantDescription: {
    fontSize: 14,
    color: '#555',
    marginVertical: 4,
  },
  restaurantLocation: {
    fontSize: 12,
    color: '#777',
  },
});

export default HomeScreen;
