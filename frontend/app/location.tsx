import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import users from '../assets/users.json'
import UserMarker from '@/components/UserMarker';
import ResMarker from '@/components/ResMarker';
import ListItem from '@/components/ListItem';
import BottomSheet, { BottomSheetView, BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { getAllRestaurants } from '@/services/api';


export default function App() {
  const [selectedRestaurant, setSelectedRestaurant ] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurants);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const [mapRegion, setMapRegion] = useState({
    latitude: 5.6037,
    longitude: -0.1870,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  })

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

  return (
    <GestureHandlerRootView  style={styles.container}>
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

        {users.map((user) => <UserMarker key={user.id} user={user} />)}

        {restaurants.map((res) => <ResMarker key={res.id} res={res} onPress={() => setSelectedRestaurant(res)} />)}

      </MapView>

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
});
