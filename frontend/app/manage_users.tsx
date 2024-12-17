import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Alert, Pressable } from 'react-native';
import { DataTable, Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';

const App = () => {
  const [users, setUsers] = useState([
    { id: '1', name: 'John Doe', email: 'john.doe@example.com', role: 'Admin' },
    { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Vendor' },
    { id: '3', name: 'Samuel Green', email: 'samuel.green@example.com', role: 'Customer' },
    { id: '4', name: 'Emily Brown', email: 'emily.brown@example.com', role: 'Customer' },
  ]);

  const router = useRouter();

  const deleteUser = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setUsers(users.filter((user) => user.id !== id)),
        },
      ],
      { cancelable: true }
    );
  };

  const renderRow = ({ item }) => (
    <DataTable.Row>
        <Pressable style={{ flex: 1 }} onPress={() => router.push(`/${item.id}`)}>
            <DataTable.Cell>{item.name}</DataTable.Cell>
        </Pressable>
        <Pressable style={{ flex: 1 }} onPress={() => router.push(`/${item.id}`)}>
            <DataTable.Cell>{item.email}</DataTable.Cell>
        </Pressable>
        <Pressable style={{ flex: 1 }} onPress={() => router.push(`/${item.id}`)}>
            <DataTable.Cell>{item.role}</DataTable.Cell>
        </Pressable>
      <DataTable.Cell>
        <Button
          mode="contained"
          buttonColor="#e74c3c"
          textColor="#fff"
          onPress={() => deleteUser(item.id)}
        >
          Delete
        </Button>
      </DataTable.Cell>
    </DataTable.Row>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Management</Text>
      <DataTable style={styles.table}>
        <DataTable.Header>
          <DataTable.Title>Name</DataTable.Title>
          <DataTable.Title>Email</DataTable.Title>
          <DataTable.Title>Role</DataTable.Title>
          <DataTable.Title>Action</DataTable.Title>
        </DataTable.Header>
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderRow}
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
