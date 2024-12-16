import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, FlatList, Alert, Modal } from 'react-native';
import axios from 'axios';
                     
const vendorOrders = () => {
  const [searchValue, setSearchValue] = useState('');
  const [status, setStatus] = useState('all');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // Control modal visibility
  const [orderToDelete, setOrderToDelete] = useState(null); // Store the order to be deleted
  const [filteredOrders, setFilteredOrders] = useState([
    { orderNumber: '001', customerName: 'John Doe', foodItem: 'Burger', amount: '$12.99', address: '123 Main St', status: 'pending' },
    { orderNumber: '002', customerName: 'Jane Smith', foodItem: 'Pizza', amount: '$15.99', address: '456 Elm St', status: 'completed' },
    { orderNumber: '003', customerName: 'Mike Johnson', foodItem: 'Pasta', amount: '$11.99', address: '789 Oak St', status: 'completed' },
    { orderNumber: '004', customerName: 'Lucy Brown', foodItem: 'Salad', amount: '$9.99', address: '101 Pine St', status: 'pending' },
  ]);

  // Filter orders based on search and status
  const handleSearch = () => {
    const filtered = orders.filter((order) => 
      (order.status === status || status === 'all') && 
      (order.customerName.toLowerCase().includes(searchValue.toLowerCase()) || 
      order.foodItem.toLowerCase().includes(searchValue.toLowerCase()))
    );
    setFilteredOrders(filtered);
  };

  // Delete order function
  const handleDelete = async () => {
    if (orderToDelete) {
      try {
        const response = await axios.delete(`http://localhost:3000/api/orders/${orderToDelete.orderNumber}`);
        if (response.status === 200) {
          Alert.alert('Order Successfully deleted');
          setFilteredOrders(filteredOrders.filter((order) => order.orderNumber !== orderToDelete.orderNumber));
          setOpenDeleteDialog(false); // Close the modal after successful deletion
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        Alert.alert('Order deletion failed');
      }
    }
  };

  // Render the modal for confirmation
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
              <Text style={styles.modalButtonText}>No</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleDelete}>
              <Text style={styles.modalButtonText}>Yes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'white' }]}>
      <View>
        <Text style={styles.title}>Order History</Text>
      </View>

      <View style={styles.secondContainer}>
        <TextInput
          value={searchValue}
          onChangeText={(text) => setSearchValue(text)}
          placeholder="Search by Name or Food Item"
          style={styles.searchInput}
          onEndEditing={handleSearch} // Trigger search when text input ends
        />

        <View style={styles.statusContainer}>
          <TouchableOpacity
            style={[styles.statusButton, status === 'completed' && styles.activeStatus]}
            onPress={() => setStatus('completed')}
          >
            <Text style={styles.statusButtonText}>Completed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusButton, status === 'pending' && styles.activeStatus]}
            onPress={() => setStatus('pending')}
          >
            <Text style={styles.statusButtonText}>Pending</Text>
          </TouchableOpacity>
        
        </View>
      </View>

      <View style={styles.tableContainer}>
        <View style={styles.tableRow}>
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
              <Text style={styles.tableCell}>{item.status}</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  setOrderToDelete(item); // Set the order to be deleted
                  setOpenDeleteDialog(true); // Open the delete modal
                }}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      {renderDeleteModal()} {/* Show the modal */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  secondContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchInput: {
    backgroundColor: 'white',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    width: '70%',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '28%',
  },
  statusButton: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    width: '30%',
    alignItems: 'center',
  },
  activeStatus: {
    backgroundColor: '#4CAF50',
  },
  statusButtonText: {
    fontSize: 16,
    color: '#333',
  },
  tableContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableCell: {
    flex: 1,
    fontSize: 16,
    textAlign: 'center',
    color: 'black',
  },
  tableHeader: {
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  deleteButton: {
    backgroundColor: 'red',
    color: 'white',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    marginHorizontal: 10,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#333',
  },
});

export default vendorOrders;
