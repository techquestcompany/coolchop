import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';

const userData = {
  1: { name: 'John Doe', email: 'john.doe@example.com', role: 'Admin', phone: '123-456-7890', address: '123 Elm Street' },
  2: { name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Editor', phone: '987-654-3210', address: '456 Oak Avenue' },
  3: { name: 'Samuel Green', email: 'samuel.green@example.com', role: 'Viewer', phone: '555-123-4567', address: '789 Pine Road' },
  4: { name: 'Emily Brown', email: 'emily.brown@example.com', role: 'Admin', phone: '444-555-6666', address: '321 Maple Drive' },
};

const UserDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const user = userData[id];

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>User not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>{user.name}</Text>
          <Text style={styles.info}>Email: {user.email}</Text>
          <Text style={styles.info}>Role: {user.role}</Text>
          <Text style={styles.info}>Phone: {user.phone}</Text>
          <Text style={styles.info}>Address: {user.address}</Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  card: {
    width: '90%',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 4,
    borderRadius: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
  },
  info: {
    fontSize: 16,
    marginBottom: 8,
    color: '#34495e',
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
  },
});

export default UserDetails;
