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
      // if (userData.confirmLocation == false) {
      //   router.push('/location'); 
      // }
    };
    checkUserLocation();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>COOL CHOP RESTAURANT DASHBOARD</Text>
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
