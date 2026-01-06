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
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as SecureStore from 'expo-secure-store';
import { fetchOrdersByUser, deleteOrder, updateOrder } from '../services/api';

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
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    loadTokenAndOrders();
  }, []);

  const loadTokenAndOrders = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('restaurant_token');
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
      const data = await fetchOrdersByUser(jwtToken);
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

  const handleDelete = async () => {
    if (!orderToDelete) return;

    try {
      await deleteOrder(orderToDelete.orderNumber, token);
      Alert.alert('Success', 'Order deleted');

      const updated = orders.filter(
        (o) => o.orderNumber !== orderToDelete.orderNumber
      );
      setOrders(updated);
      setFilteredOrders(updated);
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Delete failed');
    }
  };

 const handleStatusChange = async (orderId, newStatus) => {
  try {
    await updateOrder(orderId, { status: newStatus });

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
            <Picker.Item label="Pending" value="pending" />
            <Picker.Item label="Preparing" value="preparing" />
            <Picker.Item label="Completed" value="completed" />
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
                      handleStatusChange(item.orderNumber, value)
                    }
                  >
                    <Picker.Item label="Pending" value="pending" />
                    <Picker.Item label="Preparing" value="preparing" />
                    <Picker.Item label="Completed" value="completed" />
                  </Picker>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                      setOrderToDelete(item);
                      setOpenDeleteDialog(true);
                    }}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Delete Modal */}
      <Modal visible={openDeleteDialog} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>
              Delete this order permanently?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setOpenDeleteDialog(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleDelete}
              >
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 10,
  },
  deleteButtonText: { color: '#fff' },

  noOrdersText: { textAlign: 'center', fontSize: 16, marginTop: 30 },

  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 10, margin: 20 },
  modalText: { fontSize: 18, textAlign: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalButton: { padding: 10, backgroundColor: '#6c757d', borderRadius: 6, flex: 1, marginHorizontal: 5 },
  modalConfirmButton: { backgroundColor: '#dc3545' },
  modalButtonText: { color: '#fff', textAlign: 'center' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
