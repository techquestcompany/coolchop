import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { fetchRestaurantOrders, updateOrder } from '../services/api';
import { getStoredToken } from '../services/authStorage';

/* ---------- Helper to safely parse order items ---------- */
const parseItems = (items) => {
  if (!items) return [];
  if (Array.isArray(items)) return items;

  try {
    return JSON.parse(items);
  } catch (e) {
    console.error('Failed to parse items:', items);
    return [];
  }
};

const VendorOrders = () => {
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    loadTokenAndOrders();
  }, []);

  const loadTokenAndOrders = async () => {
    try {
      const storedToken = await getStoredToken('restaurant_token');
      if (!storedToken) {
        Alert.alert('Error', 'No token found. Please log in.');
        return;
      }
      setToken(storedToken);
      await loadOrders(storedToken);
    } catch (error) {
      console.error('Error loading token or orders:', error);
    }
  };

  const loadOrders = async (jwtToken) => {
    try {
      setLoading(true);
      const data = await fetchRestaurantOrders(jwtToken);
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const filtered = orders.filter((order) => {
      const items = parseItems(order.items);
      const matchesItems = items.some((i) =>
        i.dishName?.toLowerCase().includes(searchValue.toLowerCase())
      );

      return (
        (statusFilter === 'all' || order.status === statusFilter) &&
        (matchesItems || searchValue === '')
      );
    });

    setFilteredOrders(filtered);
  };

 const handleStatusChange = async (orderId, newStatus) => {
  try {
    await updateOrder(orderId, { status: newStatus }, token);

    const updated = orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );

    setOrders(updated);
    setFilteredOrders(updated);
  } catch (err) {
    console.error(err);
    Alert.alert('Error', 'Status update failed');
  }
};


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DA0808FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Vendor Orders</Text>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search dish name"
          value={searchValue}
          onChangeText={setSearchValue}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Status:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={statusFilter}
            onValueChange={setStatusFilter}
          >
            <Picker.Item label="All" value="all" />
            <Picker.Item label="Preparing" value="preparing" />
            <Picker.Item label="On delivery" value="on_delivery" />
            <Picker.Item label="Delivered" value="delivered" />
          </Picker>
        </View>
      </View>

      {/* Orders */}
      {filteredOrders.length === 0 ? (
        <Text style={styles.noOrdersText}>No orders available</Text>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.orderNumber.toString()}
          renderItem={({ item }) => {
            const parsedItems = parseItems(item.items);

            return (
              <View style={styles.orderCard}>
                <Text style={styles.orderNumber}>
                  Order #{item.orderNumber}
                </Text>

                <Text style={styles.sectionTitle}>Items</Text>
                {parsedItems.map((dish, index) => (
                  <Text key={index} style={styles.orderText}>
                    • {dish.dishName} × {dish.quantity}
                  </Text>
                ))}

                <Text style={styles.orderText}>
                  Total: <Text style={styles.bold}>GHS {item.totalAmount}</Text>
                </Text>

                <View style={styles.statusRow}>
                  <Picker
                    selectedValue={item.status}
                    style={styles.statusPicker}
                    onValueChange={(value) =>
                      handleStatusChange(item.id, value)
                    }
                  >
                    <Picker.Item label="Preparing" value="preparing" />
                    <Picker.Item label="On delivery" value="on_delivery" />
                    <Picker.Item label="Delivered" value="delivered" />
                  </Picker>
                </View>
              </View>
            );
          }}
        />
      )}

    </SafeAreaView>
  );
};

export default VendorOrders;

/* --------------------- Styles --------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },

  searchContainer: { flexDirection: 'row', marginBottom: 10 },
  searchInput: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderRadius: 6, padding: 10 },
  searchButton: { backgroundColor: '#007bff', padding: 10, borderRadius: 6, marginLeft: 10 },
  searchButtonText: { color: '#fff' },

  filterContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  filterLabel: { fontWeight: 'bold', fontSize: 16, marginRight: 10 },
  pickerWrapper: { flex: 1, borderWidth: 1, borderRadius: 6 },

  orderCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },

  orderNumber: { fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { marginTop: 10, fontWeight: '600' },
  orderText: { fontSize: 14, marginVertical: 2 },
  bold: { fontWeight: 'bold' },

  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  statusPicker: { flex: 1 },


  noOrdersText: { textAlign: 'center', fontSize: 16, marginTop: 30 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
