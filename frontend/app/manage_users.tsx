import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { DataTable, Text } from 'react-native-paper';
import { getAllUsers } from '../services/api';
import { getStoredToken } from '../services/authStorage';

interface ManagedUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
}

const App = () => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async (currentPage = 1) => {
    try {
      const token = await getStoredToken('customer_token');
      if (!token) throw new Error('Admin session is missing');
      const result = await getAllUsers(token, currentPage, 10);

      // ✅ SAFELY EXTRACT USERS
      const userList = result?.users ?? [];
      const current = result?.page ?? 1;
      const pages = result?.totalPages ?? 1;

      setUsers(Array.isArray(userList) ? userList : []);
      setPage(current);
      setTotalPages(pages);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Management</Text>

      <DataTable style={styles.table}>
        <DataTable.Header>
          <DataTable.Title style={{ flex: 1 }}>Name</DataTable.Title>
          <DataTable.Title style={{ flex: 1 }}>Email</DataTable.Title>
          <DataTable.Title style={{ flex: 1 }}>Phone</DataTable.Title>
        </DataTable.Header>

        {users.length === 0 ? (
          <DataTable.Row>
            <DataTable.Cell>No users found</DataTable.Cell>
          </DataTable.Row>
        ) : (
          users.map(user => (
            <DataTable.Row key={user.id}>
              <DataTable.Cell style={{ flex: 1 }}>{user.name}</DataTable.Cell>
              <DataTable.Cell style={{ flex: 1 }}>{user.email}</DataTable.Cell>
              <DataTable.Cell style={{ flex: 1 }}>{user.phone}</DataTable.Cell>
            </DataTable.Row>
          ))
        )}

        <DataTable.Pagination
          page={page - 1}
          numberOfPages={totalPages}
          onPageChange={(newPage) => fetchUsers(newPage + 1)}
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
    backgroundColor: '#fff',
    elevation: 2,
  },
});

export default App;
