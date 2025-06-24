import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { DataTable, Button, Text, Menu, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getAllRestaurants, deleteRestaurantById, approveRestaurantById } from '../services/api';

const App = () => {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [menuVisible, setMenuVisible] = useState({}); 

  const fetchRestaurants = async (currentPage = 1) => {
    try {
      const result = await getAllRestaurants(currentPage);
      setRestaurants(result.data);
      setPage(result.page);
      setTotalPages(result.totalPages);
    } catch (error) {
      Alert.alert('Error', 'Failed to load restaurants');
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const openMenu = (id) => {
    setMenuVisible((prev) => ({ ...prev, [id]: true }));
  };

  const closeMenu = (id) => {
    setMenuVisible((prev) => ({ ...prev, [id]: false }));
  };

  const deleteRestaurant = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this restaurant?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRestaurantById(id);
              setRestaurants((prev) => prev.filter((r) => r.id !== id));
              Alert.alert('Success', 'Restaurant deleted');
            } catch (err) {
              Alert.alert('Error', 'Failed to delete restaurant.');
            }
          },
        },
      ],
      { cancelable: true }  
    );
  };

  const approveRestaurant = async (id) => {
    try {
      await approveRestaurantById(id);
      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isVerified: true } : r))
      ); 
      Alert.alert('Success', 'Restaurant approved');
    } catch (err) {
      Alert.alert('Error', 'Failed to approve restaurant.');
    }
  };

  const renderRow = ({ item }) => (
    <DataTable.Row key={item.id}>
      <DataTable.Cell style={{ flex: 1 }}>{item.restaurantName}</DataTable.Cell>
      <DataTable.Cell style={{ flex: 1 }}>{item.email}</DataTable.Cell>
      <DataTable.Cell style={{ flex: 1 }}>{item.phone}</DataTable.Cell>
      <DataTable.Cell>
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
          {!item.verified && (
            <Menu.Item
              onPress={() => {
                closeMenu(item.id);
                approveRestaurant(item.id);
              }}
              title="Approve"
              leadingIcon="check-circle-outline"
            />
          )}
          <Menu.Item
            onPress={() => {
              closeMenu(item.id);
              deleteRestaurant(item.id);
            }}
            title="Delete"
            leadingIcon="delete-outline"
          />
        </Menu>
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
