/* import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getUserData, confirmNewLocation } from '../services/api';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as SecureStore from 'expo-secure-store';

const LocationScreen = () => {
  const initialLocation = {
    latitude: 5.6037,
    longitude: -0.1870,
  };

  const [region, setRegion] = useState({
    latitude: initialLocation.latitude,
    longitude: initialLocation.longitude,
    latitudeDelta: 0.0922, 
    longitudeDelta: 0.0421,
  });
  const [errorMsg, setErrorMsg] = useState(null);
  const mapRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserLocation();
  }, []);

  const fetchUserLocation = async () => {
    try {
      const userId = await SecureStore.getItemAsync('userId');
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

  const setNewLocation = async (latitude, longitude) => {
    try {
      const userId = await SecureStore.getItemAsync('userId');
      const user = await confirmNewLocation(userId, latitude, longitude);
      if(user.confirmLocation === true){
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
    if (region) {
      const newRegion = {
        latitude: region.latitude,
        longitude: region.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome name="arrow-left" size={24} color="#D32F2F" />
      </TouchableOpacity>

      {region ? (
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          ref={mapRef}
        >
          <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} title="You are here" />
        </MapView>
      ) : (
        <Text>{errorMsg || 'Waiting...'}</Text>
      )}

      <View style={styles.locationContainer}>
        <GooglePlacesAutocomplete
          placeholder="Search location"
          onPress={(data, details = null) => {
            const { lat, lng } = details.geometry.location;
            setRegion({
              latitude: lat,
              longitude: lng,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
            setNewLocation(lat, lng);
          }}
          query={{
            key: 'AIzaSyAXt5gQVUQBp6SvKxz6pSnvsUVf3jzXe6M',
            language: 'en',
          }}
          fetchDetails={true}
          styles={{
            textInput: styles.input,
          }}
        />
        <TouchableOpacity style={styles.confirmButton} onPress={() => focusOnLocation()}>
          <Text style={styles.confirmButtonText}>Yes, you're right!</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginBottom: 10,
    backgroundColor: '#D32F2F',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default LocationScreen; */
