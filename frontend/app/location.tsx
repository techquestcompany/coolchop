import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, Button } from 'react-native';
import UserMarker from '@/components/UserMarker';
import ResMarker from '@/components/ResMarker';
import ListItem from '@/components/ListItem';
import BottomSheet, { BottomSheetView, BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { getAllRestaurants, getUserData, updateUserCoordinates } from '@/services/api';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';


export default function App() {
  const [selectedRestaurant, setSelectedRestaurant ] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [user, setUser] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurants);
  const [mapRegion, setMapRegion] = useState({
    latitude: 7.9465, // Approximate latitude for Ghana
    longitude: -1.0232, // Approximate longitude for Ghana
    latitudeDelta: 2.5, 
    longitudeDelta: 2.5, 
  });
  const [showPopup, setShowPopup] = useState(true);
  

  useEffect(() => {
    fetchRestaurants();
    fectUser();
  }, []);


    // ref
    const bottomSheetRef = useRef<BottomSheet>(null);

    // callbacks
    const handleSheetChanges = useCallback((index: number) => {
      console.log('handleSheetChanges', index);
    }, []);

    const snapPoints = useMemo(() => [65, '50%', '90%'], []);

    const fetchRestaurants = async () => {
      try {
        const response = await getAllRestaurants();
        setRestaurants(response);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      }
    };
  

    const fectUser = async () => {
      try {
        const userId = await SecureStore.getItemAsync('userId');
        const data = await getUserData(userId);
        setUser(data);
      } catch (err) {
        console.log("Failed to load restaurant data.");
      }
    };

    const handleSearch = (query: string) => {
      setSearchQuery(query);
      if (query.trim() === '') {
        setFilteredRestaurants(restaurants);
      } else {
        setFilteredRestaurants(
          restaurants.filter((res) =>
            res.restaurantName.toLowerCase().includes(query.toLowerCase())
          )
        );
      }
    };

    const handleSaveCoordinates = async ({ latitude, longitude }) => {
      try {
        const userId = await SecureStore.getItemAsync('userId'); 
        const response = await updateUserCoordinates(userId, latitude, longitude);
        console.log('Coordinates updated successfully:', response);
      } catch (error) {
        console.error('Failed to update coordinates:', error);
      }
    };
    


  return (
    <GestureHandlerRootView  style={styles.container}>

      {/* Popup Instructions */}
      <Modal visible={showPopup} transparent animationType="slide">
        <View style={styles.popupContainer}>
          <View style={styles.popup}>
            <Text style={styles.popupTitle}>Set Your Location</Text>
            <Text style={styles.popupMessage}>
              Drag the marker to adjust your location or tap the "Set Location" button to
              confirm your current position.
            </Text>
            <Button title="Got it!" onPress={() => setShowPopup(false)} />
          </View>
        </View>
      </Modal>

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search restaurants..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <MapView 
        style={styles.map}
       initialRegion={mapRegion}
       region={mapRegion}
      >

        {/* {user.map((user) => <UserMarker key={user.id} user={user} />)} */}
        <UserMarker key={user.id} user={user} onSaveCoordinates={handleSaveCoordinates} />

        {restaurants.map((res) => <ResMarker key={res.id} res={res} onPress={() => setSelectedRestaurant(res)} />)}

      </MapView>

          {/* Set Location Button */}
    <TouchableOpacity
      style={styles.setLocationButton}
      onPress={() => router.push('/(tabs)')}
    >
      <Text style={styles.setLocationButtonText}>Set Location</Text>
    </TouchableOpacity>


    {/* Display selected restaurant */}
      {selectedRestaurant && (
          <ListItem 
            restaurant={selectedRestaurant} 
            containerStyle={{
              position: 'absolute',
              bottom: typeof snapPoints[0] == 'number' ? snapPoints[0] + 10 : 100,
              padding: 10,
              left: 10,
              right: 10,
            }} 
          />
      )}

      <BottomSheet
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        snapPoints={snapPoints}
        index={0}
      >
        <BottomSheetView style={styles.contentContainer}>
          <Text style={styles.listTitle}>Over {restaurants.length} restaurants</Text>

          <BottomSheetFlatList
            data={restaurants}
            contentContainerStyle={{gap: 10, padding: 10}}
            renderItem={({item}) => <ListItem restaurant={item} />}
          />
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    // padding: 36,
    // alignItems: 'center',
  },
  listTitle: {
    textAlign: 'center',
    fontFamily: 'InterBold',
    fontSize: 16,
    marginBottom: 20,
    marginVertical: 5,
  },
  popupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  popup: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  popupMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  topBar: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    height: 80,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    fontSize: 18,
  },
  filterButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setLocationButton: {
    position: 'absolute',
    bottom: 90,
    left: '10%',
    right: '10%',
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  setLocationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
