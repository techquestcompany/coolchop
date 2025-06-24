import React from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Image } from 'react-native';

const DATA = [
  {
    id: '1',
    name: "Sweet Mummy's Joint",
    rating: 3.5,
    visits: 85,
    deliveryTime: '30 mins',
    imageUrl: 'https://example.com/image1.jpg',
  },
  {
    id: '2',
    name: "Sweet Mummy's Joint",
    rating: 3.5,
    visits: 85,
    deliveryTime: '30 mins',
    imageUrl: 'https://example.com/image2.jpg', 
  },
  // Add more data as needed
];

const SearchScreen = () => {
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.rating}>⭐ {item.rating} - {item.visits} visits</Text>
        <Text style={styles.deliveryTime}>{item.deliveryTime}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Food Category</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search food category"
        placeholderTextColor="#888"
      />
      <FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
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
