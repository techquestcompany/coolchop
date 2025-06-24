import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

const RiderHomePage = () => {
  const [username, setUsername] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync('userId');
      if (!token) {
        router.push('login');
      } else {
        fetchUserData(token);
        fetchOrders(token);
      }
    };
    checkAuth();
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await axios.get('http://localhost:3000/rider', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsername(response.data.username);
    } catch (error) {
      console.error('Error fetching user data', error);
    }
  };

  const fetchOrders = async (token) => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders', error);
    }
    setLoading(false);
  };

  const handleAcceptOrder = (orderId) => {
    console.log(`Accepted order ${orderId}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome, {username}!</Text>
      <Text style={styles.subHeader}>New Orders</Text>
      {loading ? (
        <Text>Loading orders...</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <Text style={styles.orderText}>Order #{item.id}</Text>
              <Text style={styles.orderText}>Customer: {item.customerName}</Text>
              <Text style={styles.orderText}>Location: {item.location}</Text>
              <TouchableOpacity style={styles.button} onPress={() => handleAcceptOrder(item.id)}>
                <Text style={styles.buttonText}>Accept Order</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator>
      <Drawer.Screen 
        name="Home" 
        component={RiderHomePage} 
        options={{ drawerIcon: () => <MaterialIcons name="home" size={24} color="black" /> }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ drawerIcon: () => <MaterialIcons name="account-circle" size={24} color="black" /> }}
      />
      <Drawer.Screen 
        name="Orders" 
        component={OrdersScreen} 
        options={{ drawerIcon: () => <MaterialIcons name="history" size={24} color="black" /> }}
      />
      <Drawer.Screen 
        name="Account Settings" 
        component={AccountSettingsScreen} 
        options={{ drawerIcon: () => <MaterialIcons name="settings" size={24} color="black" /> }}
      />
      <Drawer.Screen 
        name="Contact Us" 
        component={ContactUsScreen} 
        options={{ drawerIcon: () => <MaterialIcons name="contact-mail" size={24} color="black" /> }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  orderCard: { padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 10 },
  orderText: { fontSize: 16, marginBottom: 5 },
  button: { backgroundColor: '#28a745', padding: 10, borderRadius: 5, marginTop: 5 },
  buttonText: { color: '#fff', textAlign: 'center' },
});

export default DrawerNavigator;
