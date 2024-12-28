import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, FlatList, Alert, Modal } from 'react-native';
import axios from 'axios';

const VendorOrders = () => {
  const [searchValue, setSearchValue] = useState('');
  const [status, setStatus] = useState('all');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState([
    { orderNumber: '001', customerName: 'John Doe', foodItem: 'Burger', amount: '$12.99', address: '123 Main St', status: 'pending' },
    { orderNumber: '002', customerName: 'Jane Smith', foodItem: 'Pizza', amount: '$15.99', address: '456 Elm St', status: 'completed' },
    { orderNumber: '003', customerName: 'Mike Johnson', foodItem: 'Pasta', amount: '$11.99', address: '789 Oak St', status: 'completed' },
    { orderNumber: '004', customerName: 'Lucy Brown', foodItem: 'Salad', amount: '$9.99', address: '101 Pine St', status: 'pending' },
  ]);

  const handleSearch = () => {
    const filtered = filteredOrders.filter(
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
        const response = await axios.delete(`http://localhost:3000/api/orders/${orderToDelete.orderNumber}`);
        if (response.status === 200) {
          Alert.alert('Order successfully deleted');
          setFilteredOrders(filteredOrders.filter((order) => order.orderNumber !== orderToDelete.orderNumber));
          setOpenDeleteDialog(false);
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        Alert.alert('Order deletion failed');
      }
    }
  };

  const renderDeleteModal = () => (
    <Modal
      visible={openDeleteDialog}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setOpenDeleteDialog(false)}
    >
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
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Order History</Text>

      <View style={styles.statusContainer}>
        {['all', 'completed', 'pending'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.statusButton, status === tab && styles.activeStatus]}
            onPress={() => setStatus(tab)}
          >
            <Text style={styles.statusButtonText}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tableContainer}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableCell, styles.tableHeader]}>Order ID</Text>
          <Text style={[styles.tableCell, styles.tableHeader]}>Food Item</Text>
          <Text style={[styles.tableCell, styles.tableHeader]}>Amount</Text>
          <Text style={[styles.tableCell, styles.tableHeader]}>Address</Text>
          <Text style={[styles.tableCell, styles.tableHeader]}>Status</Text>
          <Text style={[styles.tableCell, styles.tableHeader]}>Actions</Text>
        </View>

        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.orderNumber}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{item.orderNumber}</Text>
              <Text style={styles.tableCell}>{item.foodItem}</Text>
              <Text style={styles.tableCell}>{item.amount}</Text>
              <Text style={styles.tableCell}>{item.address}</Text>
              <Text style={[styles.tableCell, item.status === 'completed' ? styles.completedStatus : styles.pendingStatus]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
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
      </View>

      {renderDeleteModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 20,
    marginTop: 20,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statusButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
  },
  activeStatus: {
    backgroundColor: '#17a2b8',
  },
  statusButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  tableContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    paddingBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#495057',
  },
  tableHeader: {
    fontWeight: 'bold',
    color: '#343a40',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    borderRadius: 5,
    padding: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  completedStatus: {
    color: '#28a745',
  },
  pendingStatus: {
    color: '#ffc107',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    color: '#212529',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#6c757d',
    marginHorizontal: 10,
  },
  modalConfirmButton: {
    backgroundColor: '#dc3545',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  modalConfirmText: {
    fontWeight: 'bold',
  },
});

export default VendorOrders;
