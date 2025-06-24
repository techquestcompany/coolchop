import React, { useEffect, useState, useCallback,useContext } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { getUserData, getAllDishes, baseURL } from '@/services/api';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import debounce from 'lodash/debounce';
import { useCart } from '@/context/CartContext';

const Drawer = createDrawerNavigator();

const HomePage = () => {
  const [username, setUsername] = useState('');
  const [location, setLocation] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const { cartItems, addToCart, incrementQuantity, decrementQuantity } = useCart();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        router.push('login');
      } else {
        fetchUserData(token);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    fetchDishes();
  }, [searchQuery, page]);

  const fetchUserData = async (token) => {
    try {
      const userData = await getUserData(token);
      setUsername(userData.name || 'User');
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  };

  const fetchLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission to access location was denied');
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    setLocation(location);
  };

  const fetchDishes = async () => {
    try {
      const response = await getAllDishes(searchQuery, page);
      setDishes((prev) => (page === 1 ? response.data : [...prev, ...response.data]));
    } catch (error) {
      console.error('Failed to fetch dishes:', error);
    }
  };

  const debouncedSearch = useCallback(
    debounce((query) => {
      setSearchQuery(query);
      setPage(1);
    }, 500), []
  );

  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    setPage((prevPage) => prevPage + 1);
    setLoadingMore(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)} style={styles.headerContainer}>
        <Text style={styles.headerText}> {username}⌄</Text>
      </TouchableOpacity>
      {menuVisible && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity onPress={() => router.push('/userProfile')}>
            <Text style={styles.dropdownItem}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/userOrder')}>
            <Text style={styles.dropdownItem}>Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/Support')}>
            <Text style={styles.dropdownItem}>Support</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            SecureStore.deleteItemAsync('token');
            router.replace('/login');
          }}>
            <Text style={styles.dropdownItem}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Search restaurants"
        onChangeText={debouncedSearch}
      />
      <Text style={styles.title}>Featured Foods</Text>

      {dishes.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>No dishes found.</Text>
      ) : (
        <FlatList
          data={dishes}
          keyExtractor={(item, index) => `${item.dishId}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.card}>
            <Image
           source={{ uri: encodeURI(`${baseURL}/public/uploads/${item.profileImage}`) }}
            style={styles.image}
            onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
        />

              <Text style={styles.item}>Name: {item.dishName}</Text>
              <Text style={styles.item}>Price: {item.price}</Text>
              <TouchableOpacity style={styles.button} onPress={() => addToCart(item)}>
                <Text style={styles.buttonText}>Add to Cart</Text>
              </TouchableOpacity>

              {cartItems.find((cartItem) => cartItem.id === item.id) && (
                <View style={styles.quantityContainer}>
                  <TouchableOpacity onPress={() => decrementQuantity(item.id)}>
                    <Text style={styles.quantityButton}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>
                    {cartItems.find((cartItem) => cartItem.id === item.id)?.quantity}
                  </Text>
                  <TouchableOpacity onPress={() => incrementQuantity(item.id)}>
                    <Text style={styles.quantityButton}>+</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <ActivityIndicator size="large" /> : null}
        />
      )}

      <TouchableOpacity onPress={() => router.push('/cartPage')} style={styles.cartIconContainer}>
        <MaterialIcons name="shopping-cart" size={24} color="black" />
        <Text style={styles.cartCount}>{cartItems.length}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 8 },
  title: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  card: { padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 10 },
  image: { width: '100%', height: 150, borderRadius: 8 },
  item: { fontSize: 16, marginVertical: 5 },
  button: { backgroundColor: '#28a745', padding: 10, borderRadius: 5, marginTop: 5 },
  buttonText: { color: '#fff', textAlign: 'center' },
  cartIconContainer: { position: 'absolute', top: 10, right: 20, flexDirection: 'row', alignItems: 'center' },
  cartCount: { marginLeft: 5, fontWeight: 'bold', fontSize: 16 },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: { fontSize: 24, fontWeight: 'bold' },
  dropdownMenu: {
    backgroundColor: '#f9f9f9',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  dropdownItem: {
    paddingVertical: 8,
    fontSize: 16,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  quantityButton: {
    fontSize: 20,
    paddingHorizontal: 10,
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 5,
  },
});

export default HomePage;
