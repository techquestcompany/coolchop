import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { getApiErrorMessage, fetchAllOrders, updateOrder } from '@/services/api';
import { getStoredToken } from '@/services/authStorage';

interface AdminOrder {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  userId: number;
  createdAt: string;
  user?: { name?: string; email?: string } | null;
  rider?: { name?: string; email?: string } | null;
}

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getStoredToken('customer_token');
      if (!token) throw new Error('Admin session is missing');
      const result = await fetchAllOrders(token);
      setOrders(Array.isArray(result?.orders) ? result.orders : []);
    } catch (error) {
      Alert.alert('Unable to load orders', getApiErrorMessage(error, "We couldn't load orders. Please try again."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const cancelOrder = (order: AdminOrder) => {
    Alert.alert(
      'Cancel order?',
      'A successfully paid order cannot be cancelled here. This action does not issue a refund.',
      [
        { text: 'Keep order', style: 'cancel' },
        {
          text: 'Cancel order',
          style: 'destructive',
          onPress: () => { void updateOrderStatus(order.id); },
        },
      ]
    );
  };

  const updateOrderStatus = async (orderId: number) => {
    try {
      setUpdatingId(orderId);
      const token = await getStoredToken('customer_token');
      if (!token) throw new Error('Admin session is missing');
      await updateOrder(orderId, { status: 'cancelled' }, token);
      await loadOrders();
    } catch (error) {
      Alert.alert('Unable to cancel order', getApiErrorMessage(error, "We couldn't cancel this order. Please try again."));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <View style={styles.loader}><ActivityIndicator size="large" /></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>All orders</Text>
      {orders.length === 0 ? <Text>No orders found.</Text> : orders.map((order) => (
        <Card key={order.id} style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Order {order.orderNumber || order.id}</Text>
            <Text>Status: {order.status}</Text>
            <Text>Customer: {order.user?.name || order.user?.email || `User ${order.userId}`}</Text>
            <Text>Rider: {order.rider?.name || order.rider?.email || 'Unassigned'}</Text>
            <Text>Total: {order.totalAmount} GHS</Text>
            <Text>Created: {new Date(order.createdAt).toLocaleString()}</Text>
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <Button
                mode="outlined"
                textColor="#b42318"
                style={styles.button}
                loading={updatingId === order.id}
                disabled={updatingId !== null}
                onPress={() => cancelOrder(order)}
              >
                Cancel order
              </Button>
            )}
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, backgroundColor: '#f7f7f7', flexGrow: 1 },
  loader: { flex: 1, justifyContent: 'center' },
  title: { fontWeight: 'bold', marginBottom: 8 },
  card: { backgroundColor: '#fff' },
  button: { marginTop: 10, alignSelf: 'flex-start' },
});
