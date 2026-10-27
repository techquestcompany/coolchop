import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { DataTable, Text, Menu, IconButton } from 'react-native-paper';
import { getAllRestaurants, approveRestaurantById, getApiErrorMessage } from '../services/api';
import { getStoredToken } from '../services/authStorage';

interface ManagedRestaurant {
  id: number;
  restaurantName: string;
  email: string;
  phone: string;
  isVerified: boolean;
}

const App = () => {
  const [restaurants, setRestaurants] = useState<ManagedRestaurant[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [menuVisible, setMenuVisible] = useState<Record<number, boolean>>({});

  const fetchRestaurants = async (currentPage = 1) => {
    try {
      const result = await getAllRestaurants(currentPage);
      setRestaurants(result.data);
      setPage(result.page);
      setTotalPages(result.totalPages);
    } catch (error) {
      Alert.alert('Unable to load restaurants', getApiErrorMessage(error, "We couldn't load restaurants. Please try again."));
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const openMenu = (id: number) => {
    setMenuVisible((prev) => ({ ...prev, [id]: true }));
  };

  const closeMenu = (id: number) => {
    setMenuVisible((prev) => ({ ...prev, [id]: false }));
  };

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
      Alert.alert('Unable to approve restaurant', getApiErrorMessage(err, "We couldn't approve this restaurant. Please try again."));
    }
  };

  const renderRow = ({ item }: { item: ManagedRestaurant }) => (
    <DataTable.Row key={item.id}>
      <DataTable.Cell style={{ flex: 1 }}>{item.restaurantName}</DataTable.Cell>
      <DataTable.Cell style={{ flex: 1 }}>{item.email}</DataTable.Cell>
      <DataTable.Cell style={{ flex: 1 }}>{item.phone}</DataTable.Cell>
      <DataTable.Cell>
        {item.isVerified ? (
          <Text>Approved</Text>
        ) : (
          <Menu
            visible={menuVisible[item.id] || false}
            onDismiss={() => closeMenu(item.id)}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={24}
                onPress={() => openMenu(item.id)}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                closeMenu(item.id);
                approveRestaurant(item.id);
              }}
              title="Approve"
              leadingIcon="check-circle-outline"
            />
          </Menu>
        )}
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
          <DataTable.Title>Action</DataTable.Title>
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
