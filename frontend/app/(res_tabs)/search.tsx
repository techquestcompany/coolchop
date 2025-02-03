import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getAllDishes, baseURL } from '@/services/api';
import { router } from 'expo-router';


const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    setIsLoading(true);
    try {
      const response = await getAllDishes();
      setDishes(response);
      setFilteredDishes(response);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch dishes.');
      setIsLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text === '') {
      setFilteredDishes(dishes);
    } else {
      const filtered = dishes.filter((dish) =>
        dish.dishName.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredDishes(filtered);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => router.push(`/dish_info?id=${item.id}`)}>
      <Image source={{ uri: `${baseURL}/public/uploads/${item.profileImage}` }}  style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.dishName}</Text>
        <Text style={styles.rating}>⭐ 10.0 - {item.visits} visits</Text>
        <Text style={styles.deliveryTime}>{item.price}</Text>
      </View>
    </TouchableOpacity>
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
    <View style={styles.container}>
      <Text style={styles.header}>Food Category</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search food category"
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredDishes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 16 }}>
            No dishes found.
          </Text>
        }
      />
    </View>
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
