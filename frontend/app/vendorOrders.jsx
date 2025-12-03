import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TextInput, 
  TouchableOpacity, FlatList, Alert, Modal, ActivityIndicator 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as SecureStore from 'expo-secure-store';
import { fetchOrdersByUser, deleteOrder, updateOrder } from '../services/api';

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
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error fetching orders');
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const filtered = orders.filter(
      (order) =>
        (statusFilter === 'all' || order.status === statusFilter) &&
        (order.customerName.toLowerCase().includes(searchValue.toLowerCase()) ||
          order.foodItem.toLowerCase().includes(searchValue.toLowerCase()))
    );
    setFilteredOrders(filtered);
  };

  const handleDelete = async () => {
    if (orderToDelete) {
      try {
        await deleteOrder(orderToDelete.orderNumber, token);
        Alert.alert('Success', 'Order successfully deleted');
        const updatedOrders = orders.filter(order => order.orderNumber !== orderToDelete.orderNumber);
        setOrders(updatedOrders);
        setFilteredOrders(updatedOrders);
        setOpenDeleteDialog(false);
      } catch (error) {
        console.error('Error deleting order:', error);
        Alert.alert('Error', 'Order deletion failed');
      }
    }
  };

  const handleStatusChange = async (orderNumber, newStatus) => {
    try {
      await updateOrder(orderNumber, newStatus, token);
      const updatedOrders = orders.map(order =>
        order.orderNumber === orderNumber ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
    } catch (error) {
      console.error('Error updating order status:', error);
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
      <Text style={styles.title}>Order History</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by customer or food item"
          value={searchValue}
          onChangeText={setSearchValue}
          
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
      <Text style={{ marginRight: 10 }}>Status Filter:</Text>
      <View style={styles.pickerWrapper}>
      <Picker
      selectedValue={statusFilter}
      style={styles.picker}
      onValueChange={(value) => setStatusFilter(value)}
      
    >
      <Picker.Item label="All" value="all" />
      <Picker.Item label="Pending" value="pending" />
      <Picker.Item label="Completed" value="completed" />
    </Picker>
  </View>
</View>

      {filteredOrders.length === 0 ? (
        <Text style={styles.noOrdersText}>No orders at the moment</Text>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.orderNumber.toString()}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{item.orderNumber}</Text>
              <Text style={styles.tableCell}>{item.foodItem}</Text>
              <Text style={styles.tableCell}>{item.amount}</Text>
              <Text style={styles.tableCell}>{item.address}</Text>
              <Picker
                selectedValue={item.status}
                style={styles.statusPicker}
                onValueChange={(value) => handleStatusChange(item.orderNumber, value)}
              >
                <Picker.Item label="Pending" value="pending" />
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
          )}
        />
      )}

      <Modal visible={openDeleteDialog} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Are you sure you want to delete this order?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setOpenDeleteDialog(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalConfirmButton]} onPress={handleDelete}>
                <Text style={[styles.modalButtonText, styles.modalConfirmText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  searchContainer: { flexDirection: 'row', marginBottom: 10 },
  searchInput: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderRadius: 5, padding: 10 },
  searchButton: { backgroundColor: '#007bff', padding: 10, borderRadius: 5, marginLeft: 10 },
  searchButtonText: { color: '#fff' },
  filterContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
pickerWrapper: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, overflow: 'hidden' },
picker: { width: '100%', height: 40},

  statusPicker: { flex: 1, height: 40 },
  noOrdersText: { textAlign: 'center', fontSize: 18, marginTop: 20, color: '#6c757d' },
  tableRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, alignItems: 'center' },
  tableCell: { flex: 1, textAlign: 'center', fontSize: 14 },
  deleteButton: { backgroundColor: '#dc3545', padding: 5, borderRadius: 5 },
  deleteButtonText: { color: '#fff' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center' },
  modalText: { fontSize: 18, marginBottom: 20 },
  modalButtons: { flexDirection: 'row' },
  modalButton: { padding: 10, borderRadius: 5, backgroundColor: '#6c757d', marginHorizontal: 10 },
  modalConfirmButton: { backgroundColor: '#dc3545' },
  modalButtonText: { color: '#fff' },
  modalConfirmText: { fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default VendorOrders;
