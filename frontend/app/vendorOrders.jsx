import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, FlatList, Alert, Modal, Picker } from 'react-native';
import { fetchOrder, deleteOrder, updateOrder } from '../services/api';

const VendorOrders = () => {
  const [searchValue, setSearchValue] = useState('');
  const [status, setStatus] = useState('all');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await fetchOrder();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleSearch = () => {
    const filtered = orders.filter(
      (order) =>
        (status === 'all' || order.status === status) &&
        (order.customerName.toLowerCase().includes(searchValue.toLowerCase()) ||
          order.foodItem.toLowerCase().includes(searchValue.toLowerCase()))
    );
    setFilteredOrders(filtered);
  };

  const handleDelete = async () => {
    if (orderToDelete) {
      try {
        await deleteOrder(orderToDelete.orderNumber);
        Alert.alert('Order successfully deleted');
        const updatedOrders = orders.filter((order) => order.orderNumber !== orderToDelete.orderNumber);
        setOrders(updatedOrders);
        setFilteredOrders(updatedOrders);
        setOpenDeleteDialog(false);
      } catch (error) {
        console.error('Error deleting order:', error);
        Alert.alert('Order deletion failed');
      }
    }
  };

  const handleStatusChange = async (orderNumber, newStatus) => {
    try {
      await updateOrder(orderNumber, newStatus);
      const updatedOrders = orders.map(order =>
        order.orderNumber === orderNumber ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Status update failed');
    }
  };

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
      
      {filteredOrders.length === 0 ? (
        <Text style={styles.noOrdersText}>No orders at the moment</Text>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.orderNumber}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{item.orderNumber}</Text>
              <Text style={styles.tableCell}>{item.foodItem}</Text>
              <Text style={styles.tableCell}>{item.amount}</Text>
              <Text style={styles.tableCell}>{item.address}</Text>
              <Picker
                selectedValue={item.status}
                style={styles.picker}
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
  searchContainer: { flexDirection: 'row', marginBottom: 20 },
  searchInput: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderRadius: 5, padding: 10 },
  searchButton: { backgroundColor: '#007bff', padding: 10, borderRadius: 5 },
  searchButtonText: { color: '#fff' },
  noOrdersText: { textAlign: 'center', fontSize: 18, marginTop: 20, color: '#6c757d' },
  tableRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1 },
  tableCell: { flex: 1, textAlign: 'center', fontSize: 14 },
  picker: { flex: 1, height: 40 },
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
});

export default VendorOrders;
