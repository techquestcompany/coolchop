import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getAllDishes, baseURL, getApiErrorMessage } from '@/services/api';
import { router } from 'expo-router';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchDishes(1);
  }, []);

  const fetchDishes = async (pageNumber = 1) => {
    setIsLoading(true);
    try {
      const response = await getAllDishes("", pageNumber);
      const newDishes = response.data;

      if (pageNumber === 1) {
        setDishes(newDishes);
        setFilteredDishes(newDishes);
      } else {
        const updated = [...dishes, ...newDishes];
        setDishes(updated);
        setFilteredDishes(updated);
      }

      setPage(pageNumber);
      setHasMore(pageNumber < response.totalPages);
    } catch (err) {
      console.error('Fetch error:', err?.response?.data || err.message);
      setError(getApiErrorMessage(err, "We couldn't load dishes. Please try again."));
    }

    setIsLoading(false);
  };

  
  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredDishes(dishes);
    } else {
      const filtered = dishes.filter((dish) =>
        dish.dishName.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredDishes(filtered);
    }
  };

  const renderItem = ({ item }) => {
    const dishImg = item.image || item.dishImage;
    const restaurantImg = item.restaurant?.profileImage;

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => router.push(`/dish_info?id=${item.id}`)}
      >
        <Image
          source={{
            uri: `${baseURL}/public/uploads/${dishImg || restaurantImg}`
          }}
          style={styles.image}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{item.dishName}</Text>
          <Text style={styles.rating}>⭐ {item.ratings || 0.0}</Text>
          <Text style={styles.deliveryTime}>Price: GH₵ {item.price}</Text>
          <Text style={styles.deliveryTime}>{item.description}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && page === 1) {
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
        ListFooterComponent={
          hasMore && !searchQuery ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={() => fetchDishes(page + 1)}
            >
              <Text style={styles.loadMoreText}>Load More</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  );
};

// ------------------ Styles ------------------

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
    backgroundColor: '#e6e6e6',
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
  loadMoreButton: {
    padding: 12,
    backgroundColor: '#000',
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 24,
  },
  loadMoreText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default SearchScreen;
