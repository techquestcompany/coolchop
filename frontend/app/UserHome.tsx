import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import debounce from 'lodash/debounce';
import { useCart } from '@/context/CartContext';
import { baseURL, getUserData, updateUserLocation, getAllDishes, getApiErrorMessage } from '@/services/api';
import { router } from 'expo-router';
import { getCurrentLocation } from './hooks/useUserLocation';
import { getStoredToken } from '@/services/authStorage';

type FeaturedDish = {
  id: number;
  dishName: string;
  price: number | string;
  profileImage?: string | null;
  restaurant?: { restaurantName?: string };
};

const HomeScreen = () => {
  const [username, setUsername] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [dishes, setDishes] = useState<FeaturedDish[]>([]);
  const [dishError, setDishError] = useState<string | null>(null);
  const [loadingDishes, setLoadingDishes] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [dishRetry, setDishRetry] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // CART FUNCTIONS
  const { cartItems = [], addToCart, refreshCart } = useCart();

useEffect(() => {
  const loadUser = async () => {
    setLoadingUser(true);
    try {
      const token = await getStoredToken("customer_token");

      if (!token) return router.replace('/login');

      const data = await getUserData(token);
      setUsername(data?.name || data?.email || 'User');
      await refreshCart().catch((error) => {
        console.error('Failed to restore cart:', error);
      });

      // 📍 Ask & update location
      Alert.alert(
        "Enable Location",
        "We use your location to deliver food accurately.",
        [
          { text: "Later", style: "cancel" },
          { text: "Allow", onPress: sendUserLocation }
        ]
      );
    } catch (err) {
      console.error('Error fetching user:', err);
      setUserError(getApiErrorMessage(err, "We couldn't load your account. Please sign in again."));
    } finally {
      setLoadingUser(false);
    }
  };

  loadUser();
}, []);


  /** Fetch dishes */
  useEffect(() => {
    let active = true;
    const fetchDishesData = async () => {
      setLoadingDishes(true);
      setDishError(null);
      try {
        const response = await getAllDishes(searchQuery, page);
        if (!Array.isArray(response?.data)) {
          throw new Error('Unexpected dishes response from server');
        }
        if (active) {
          setDishes((prev) => {
            const combined = page === 1 ? response.data : [...prev, ...response.data];
            const dishesById = new Map<number, FeaturedDish>();
            combined.forEach((dish: FeaturedDish) => dishesById.set(dish.id, dish));
            return Array.from(dishesById.values());
          });
          setTotalPages(Number(response.totalPages) || 1);
        }
      } catch (err) {
        if (active) {
          console.error('Failed to fetch dishes:', err);
          setDishError(getApiErrorMessage(err, "We couldn't load featured foods. Please try again."));
        }
      } finally {
        if (active) setLoadingDishes(false);
      }
    };
    fetchDishesData();
    return () => {
      active = false;
    };
  }, [searchQuery, page, dishRetry]);

  const debouncedSearch = useCallback(
    debounce((query) => {
      setSearchQuery(query);
      setPage(1);
    }, 500),
    []
  );


const sendUserLocation = async () => {
  try {
    const token = await getStoredToken("customer_token");

    if (!token) {
      return router.replace('/login');
    }

    const { latitude, longitude } = await getCurrentLocation();

    await updateUserLocation(token, latitude, longitude, true);

    console.log("📍 User location updated");
  } catch (error) {
    console.error("Location update failed:", error);
    Alert.alert("Unable to update location", getApiErrorMessage(error, "We couldn't update your location. Please try again."));
  }
};


  const handleLoadMore = () => {
    if (loadingDishes || page >= totalPages) return;
    setPage((prev) => prev + 1);
  };

  /** Render Dish Card */
  const renderDishCard = ({ item }: { item: FeaturedDish }) => (
    <View style={styles.card}>
      <Image
        source={{
          uri: item.profileImage?.startsWith('http')
            ? item.profileImage
            : encodeURI(`${baseURL.replace(/\/api\/?$/, '')}/public/uploads/${item.profileImage}`),
        }}
        style={styles.image}
      />

      <View style={styles.detailRow}>
        <MaterialIcons name="restaurant-menu" size={20} color="#555" />
        <Text style={styles.itemText}>{item.dishName}</Text>
      </View>

  <View style={styles.detailRow}>
  
  <Text style={styles.priceText}> GH₵ {item.price}</Text>
</View>


      <View style={styles.detailRow}>
        <MaterialIcons name="store" size={20} color="#555" />
        <Text style={styles.itemText}>{item.restaurant?.restaurantName}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push(`/dish_info?id=${item.id}`)}
      >
        <Text style={styles.buttonText}>View Details</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#000" }]}
        onPress={() => addToCart(item).catch((error) => {
          console.error('Failed to add dish to cart:', error);
          Alert.alert('Unable to update cart', getApiErrorMessage(error, "We couldn't update your cart. Please try again."));
        })}
      >
        <Text style={styles.buttonText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );

  /** Loading User */
  if (loadingUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D32F2F" />
        <Text style={{ marginTop: 10 }}>Loading user data...</Text>
      </View>
    );
  }

  /** User error */
  if (userError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: 'red', fontSize: 16 }}>{userError}</Text>
        <TouchableOpacity
          style={[styles.button, { marginTop: 10, backgroundColor: '#D32F2F' }]}
          onPress={() => router.replace('/login')}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Welcome, {username}</Text>

      <TextInput
        style={styles.input}
        placeholder="Search restaurants..."
        onChangeText={debouncedSearch}
      />

      <Text style={styles.title}>🍴 Featured Foods</Text>

      {dishError ? (
        <TouchableOpacity onPress={() => setDishRetry((retry) => retry + 1)}>
          <Text style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>{dishError} Tap to retry.</Text>
        </TouchableOpacity>
      ) : null}
      {loadingDishes && dishes.length === 0 ? (
        <ActivityIndicator size="large" color="#D32F2F" />
      ) : dishes.length === 0 && !dishError ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>No featured foods are available yet.</Text>
      ) : (
        <FlatList
          data={dishes}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderDishCard}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingDishes && dishes.length > 0 ? <ActivityIndicator size="small" color="#D32F2F" /> : null}
        />
      )}

      {/* 🛒 CART ICON WITH BADGE */}
      <TouchableOpacity
        onPress={() => router.push('/cartPage')}
        style={styles.cartIconContainer}
      >
        <MaterialIcons name="shopping-cart" size={28} color="black" />

        {Array.isArray(cartItems) && cartItems.length > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

// ------------------ Styles ------------------
const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
    borderRadius: 8
  },
  title: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#fafafa'
  },
  image: { width: '100%', height: 150, borderRadius: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  itemText: { fontSize: 16, color: '#333' },
  priceText: { fontSize: 18, fontWeight: 'bold', color: '#28a745' },
  button: { backgroundColor: '#D32F2F', padding: 10, borderRadius: 5, marginTop: 10 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },

  cartIconContainer: {
    position: 'absolute',
    top: 14,
    right: 18,
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'red',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  headerText: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
});

export default HomeScreen;
