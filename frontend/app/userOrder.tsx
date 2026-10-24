import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { fetchOrdersByUser, updateOrder } from '../services/api';
import { getStoredToken } from '../services/authStorage';

const parseItems = (items) => {
  if (!items) return [];

  // If already an array, return it
  if (Array.isArray(items)) return items;

  // If it's a JSON string, parse it
  try {
    return JSON.parse(items);
  } catch (err) {
    console.error('Failed to parse items:', items);
    return [];
  }
};


const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);


  const itemsPerPage = 5;

  useEffect(() => {
    const init = async () => {
      try {
        const token = await getStoredToken('customer_token');
        if (!token) throw new Error('Customer session is missing');
        const data = await fetchOrdersByUser(token);
        setOrders(data);
        setFilteredOrders(data.slice(0, itemsPerPage));
      } catch (error) {
        console.error('Error initializing user orders:', error.message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const cancelOrder = async (order) => {
    try {
      const token = await getStoredToken('customer_token');
      if (!token) throw new Error('Customer session is missing');
      await updateOrder(order.id, { status: 'cancelled' }, token);
      const updatedOrders = orders.map(existingOrder =>
        existingOrder.id === order.id ? { ...existingOrder, status: 'cancelled' } : existingOrder
      );
      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders.slice(0, page * itemsPerPage));
      Alert.alert('Order cancelled successfully');
    } catch (error) {
      console.error('Cancel order error:', error);
      Alert.alert('Failed to cancel order');
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    const nextItems = orders.slice(0, nextPage * itemsPerPage);
    setFilteredOrders(nextItems);
    setPage(nextPage);
  };

 const renderItem = ({ item }) => {
  const parsedItems = parseItems(item.items);

  return (
    <View style={styles.orderCard}>
      <Text style={styles.label}>
        Order #: <Text style={styles.value}>{item.orderNumber}</Text>
      </Text>

      <Text style={styles.label}>Items:</Text>

      {parsedItems.length === 0 ? (
        <Text style={styles.value}>No items</Text>
      ) : (
        parsedItems.map((dish, index) => (
          <Text key={index} style={styles.value}>
            • {dish.dishName || `Dish ID ${dish.id}`} × {dish.quantity}
          </Text>
        ))
      )}

      <Text style={styles.label}>
        Amount: <Text style={styles.value}>GHS {item.totalAmount}</Text>
      </Text>

      <Text style={styles.label}>
        Status:{' '}
        <Text style={styles.status(item.status)}>
          {item.status}
        </Text>
      </Text>

      {item.status === 'pending' && !item.reference && (
        <TouchableOpacity
          onPress={() => cancelOrder(item)}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};



  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Orders</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 30 }} />
      ) : filteredOrders.length === 0 ? (
        <Text style={styles.noOrdersText}>No orders found</Text>
      ) : (
        <>
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.orderNumber.toString()}
            renderItem={renderItem}
          />
          {filteredOrders.length < orders.length && (
            <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
              <Text style={styles.loadMoreText}>Load More</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  orderCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    elevation: 2,
  },
  label: {
    fontWeight: '600',
    marginBottom: 5,
  },
  value: {
    fontWeight: '400',
  },
  status: (status) => ({
    color:
      status === 'pending' ? '#ffc107' :
      status === 'completed' ? '#28a745' :
      status === 'cancelled' ? '#dc3545' : '#6c757d',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  }),
  noOrdersText: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 30,
    color: '#6c757d',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadMoreButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 10,
  },
  loadMoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserOrders;
