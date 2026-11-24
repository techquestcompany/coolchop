import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Button, DataTable, Text } from 'react-native-paper';
import { getAdminRestaurants, approveRestaurantById, getApiErrorMessage as getApiError, setRestaurantActiveStatus } from '../services/api';
import { getStoredToken } from '../services/authStorage';

interface ManagedRestaurant {
  id: number;
  restaurantName: string;
  email: string;
  phone: string;
  isVerified: boolean;
  isActive: boolean;
}

const App = () => {
  const [restaurants, setRestaurants] = useState<ManagedRestaurant[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const fetchRestaurants = async (currentPage = 1) => {
    try {
      const token = await getStoredToken('customer_token');
      if (!token) throw new Error('Admin session is missing');
      const result = await getAdminRestaurants(token, currentPage, 10);
      setRestaurants(result.data);
      setPage(result.page);
      setTotalPages(result.totalPages);
    } catch (error) {
      Alert.alert('Unable to load restaurants', getApiError(error, "We couldn't load restaurants. Please try again."));
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const approveRestaurant = async (id: number) => {
    try {
      const token = await getStoredToken('customer_token');
      if (!token) throw new Error('Admin session is missing');
      await approveRestaurantById(id, token);
      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isVerified: true } : r))
      ); 
      Alert.alert('Success', 'Restaurant approved');
    } catch (err) {
      Alert.alert('Unable to approve restaurant', getApiError(err, "We couldn't approve this restaurant. Please try again."));
    }
  };

  const changeRestaurantStatus = async (restaurant: ManagedRestaurant) => {
    const isActive = !restaurant.isActive;
    const update = async () => {
      try {
        const token = await getStoredToken('customer_token');
        if (!token) throw new Error('Admin session is missing');
        await setRestaurantActiveStatus(restaurant.id, isActive, token);
        await fetchRestaurants(page);
      } catch (error) {
        Alert.alert('Unable to update restaurant', getApiError(error, "We couldn't update this restaurant. Please try again."));
      }
    };

    if (isActive) {
      await update();
      return;
    }

    Alert.alert(
      'Deactivate restaurant?',
      'The restaurant will lose platform access and stop appearing to customers. Its order history will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Deactivate', style: 'destructive', onPress: () => { void update(); } },
      ]
    );
  };

  const renderRow = ({ item }: { item: ManagedRestaurant }) => (
    <DataTable.Row key={item.id}>
      <DataTable.Cell style={{ flex: 1 }}>{item.restaurantName}</DataTable.Cell>
      <DataTable.Cell style={{ flex: 1 }}>{item.email}</DataTable.Cell>
      <DataTable.Cell style={{ flex: 1 }}>{item.phone}</DataTable.Cell>
      <DataTable.Cell>
        <View>
          <Text>{item.isVerified ? 'Approved' : 'Pending'}</Text>
          <Text>{item.isActive ? 'Active' : 'Inactive'}</Text>
          {!item.isVerified && (
            <Button compact onPress={() => approveRestaurant(item.id)}>Approve</Button>
          )}
          <Button compact onPress={() => changeRestaurantStatus(item)}>
            {item.isActive ? 'Deactivate' : 'Reactivate'}
          </Button>
        </View>
      </DataTable.Cell>
    </DataTable.Row>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restaurant Management</Text>
      <DataTable style={styles.table}>
        <DataTable.Header>
          <DataTable.Title>Name</DataTable.Title>
          <DataTable.Title>Email</DataTable.Title>
          <DataTable.Title>Phone</DataTable.Title>
          <DataTable.Title>Status / actions</DataTable.Title>
        </DataTable.Header>

        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRow}
        />

        <DataTable.Pagination
          page={page - 1}
          numberOfPages={totalPages}
          onPageChange={(newPage) => fetchRestaurants(newPage + 1)}
          label={`Page ${page} of ${totalPages}`}
          showFastPaginationControls
          numberOfItemsPerPage={10}
        />
      </DataTable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#2c3e50',
  },
  table: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
  },
});

export default App;
