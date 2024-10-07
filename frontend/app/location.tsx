import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserData, confirmNewLocation } from '../services/api';

const LocationScreen = () => {
  const initialLocation = {
    latitude: 5.6037,
    longitude: -0.1870,
  };

  const [myLocation, setMyLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: initialLocation.latitude,
    longitude: initialLocation.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [errorMsg, setErrorMsg] = useState(null);
  const [locationInput, setLocationInput] = useState('');
  const mapRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserLocation();
    //_getLocation();
  }, []);

  const fetchUserLocation = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const user = await getUserData(userId); 
      if (user.latitude && user.longitude) {
        setRegion({
          latitude: user.latitude,
          longitude: user.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.error("Error fetching user location:", error);
    }
  };

  const setNewLocation = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const user = await confirmNewLocation(userId);
      if(user.confirmLocation == true){
        router.push("/(tabs)");
      } 
    } catch (error) {
      console.error("Error fetching user location:", error);
    }
  };


  const _getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setMyLocation(location.coords);
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (err) {
      console.warn(err);
    }
  };

  const focusOnLocation = () => {
    if (myLocation) {
      const newRegion = {
        latitude: myLocation.latitude,
        longitude: myLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    }
  };

  let text = 'Waiting...';
  if (errorMsg) {
    text = errorMsg;
  } else if (myLocation) {
    text = 'Your current location';
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome name="arrow-left" size={24} color="#D32F2F" />
      </TouchableOpacity>

      {myLocation ? (
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          ref={mapRef}
        >
          <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} title="You are here" />
        </MapView>
      ) : (
        <Text>{text}</Text>
      )}

      {/* White container with input box */}
      <View style={styles.locationContainer}>
        <Text style={styles.heading}>Set your location to continue</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm your location"
          value={locationInput}
          onChangeText={setLocationInput}
        />
        <TouchableOpacity style={styles.confirmButton} onPress={setNewLocation}>
          <Text style={styles.confirmButtonText}>Set New Location</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton} onPress={() => focusOnLocation()}>
          <Text style={styles.confirmButtonText}>Yes, you're right!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  locationContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#F9E4E4',
    alignItems: 'center',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  heading: {
    fontSize: 18,
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#D32F2F',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default LocationScreen;
