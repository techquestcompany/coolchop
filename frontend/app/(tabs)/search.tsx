import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Image, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import { getAllDishes, getAllRestaurants, baseURL } from '@/services/api'; // Ensure getAllRestaurants is defined

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dishes, setDishes] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isDishes, setIsDishes] = useState(true); // Toggle between dishes and restaurants
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [isDishes]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (isDishes) {
        const dishData = await getAllDishes();
        setDishes(dishData);
        setFilteredData(dishData);
      } else {
        const restaurantData = await getAllRestaurants();
        setRestaurants(restaurantData);
        setFilteredData(restaurantData);
      }
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch data.');
      setIsLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text === '') {
      setFilteredData(isDishes ? dishes : restaurants);
    } else {
      const filtered = (isDishes ? dishes : restaurants).filter((item) =>
        (isDishes ? item.dishName : item.restaurantName)
          .toLowerCase()
          .includes(text.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image
        source={{
          uri: `${baseURL}/public/uploads/${isDishes ? item.profileImage : item.profileImage}`,
        }}
        style={styles.image}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{isDishes ? item.dishName : item.restaurantName}</Text>
        <Text style={styles.rating}>
          {isDishes ? `⭐ 10.0 - ${item.visits} visits` : `Rating: ⭐ ${item.rating}`}
        </Text>
        {isDishes && <Text style={styles.deliveryTime}>{item.price}</Text>}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Food & Restaurant Category</Text>
      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterButton, isDishes && styles.activeFilter]}
          onPress={() => setIsDishes(true)}
        >
          <Text style={styles.filterText}>Dishes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, !isDishes && styles.activeFilter]}
          onPress={() => setIsDishes(false)}
        >
          <Text style={styles.filterText}>Restaurants</Text>
        </TouchableOpacity>
      </View>
      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder={`Search ${isDishes ? 'dishes' : 'restaurants'}`}
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={handleSearch}
      />
      {/* List */}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 16 }}>
            No {isDishes ? 'dishes' : 'restaurants'} found.
          </Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  filterBar: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee',
  },
  activeFilter: {
    backgroundColor: '#D32F2F',
  },
  filterText: {
    fontSize: 16,
    color: '#fff',
  },
  searchInput: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  list: {
    paddingBottom: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rating: {
    color: '#777',
  },
  deliveryTime: {
    color: '#888',
  },
});

export default SearchScreen;
