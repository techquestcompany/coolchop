import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { confimrUserLocation } from '../../services/api';

const HomeScreen = () => {
  const [userLocation, setUserLocation] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkUserLocation = async () => {
      const userId = await AsyncStorage.getItem('userId'); 
      const userData = await confimrUserLocation(userId); 
      setUserLocation("Yet to get user location")
      if (userData.confirmLocation == false) {
        router.push('/location'); 
      }
    };
    checkUserLocation();
  }, []);

  const categories = [
    { id: '1', name: 'Category 1' },
    { id: '2', name: 'Category 2' },
    { id: '3', name: 'Category 3' },
    { id: '4', name: 'Category 4' },
    { id: '5', name: 'Category 5' },
    { id: '6', name: 'Category 6' },
  ];

  const mostPopular = [
    { id: '1', name: 'Jollof', image: require('./assets/jollof.jpg') },
    { id: '2', name: 'Burger', image: require('./assets/burger.jpg') },
    { id: '3', name: 'Noodles', image: require('./assets/noodles.jpg') },
  ];

  const promos = [
    { id: '1', name: 'Fried rice', image: require('./assets/fried_rice.jpg') },
    { id: '2', name: 'Kelewele', image: require('./assets/kelewele.jpg') },
    { id: '3', name: 'Shawarma', image: require('./assets/shawarma.jpg') },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.locationText}>Your location now is {userLocation || 'Fetching location...'}</Text>
      <Text style={styles.title}>COOL CHOP</Text>
      
      {/* Search Menu */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchInput}>search menu</Text>
      </View>

      {/* Categories */}
      <FlatList
        data={categories}
        renderItem={({ item }) => (
          <View style={styles.categoryBox}>
            <Text>{item.name}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        numColumns={3}
        style={styles.categoryList}
      />

      {/* Most Popular and Promos */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Most popular</Text>
        <FlatList
          data={mostPopular}
          horizontal
          renderItem={({ item }) => (
            <View style={styles.foodBox}>
              <Image source={item.image} style={styles.foodImage} />
              <Text>{item.name}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />

        <Text style={styles.sectionTitle}>Promos</Text>
        <FlatList
          data={promos}
          horizontal
          renderItem={({ item }) => (
            <View style={styles.foodBox}>
              <Image source={item.image} style={styles.foodImage} />
              <Text>{item.name}</Text>
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
  categoryList: {
    marginBottom: 20,
  },
  categoryBox: {
    width: '30%',
    height: 100,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F1F1',
    borderRadius: 10,
  },
  sectionContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  foodBox: {
    marginRight: 10,
    alignItems: 'center',
  },
  foodImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
});

export default HomeScreen;
