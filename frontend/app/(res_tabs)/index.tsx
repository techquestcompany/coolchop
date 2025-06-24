import React, { useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { baseURL, getAllRestaurants } from '@/services/api';
import * as SecureStore from 'expo-secure-store';
import vendorOrders from "../vendorOrders";
import Settings from "../vendorSettings";
import SupportScreen from '../Support';

const Drawer = createDrawerNavigator();

export default function App() {
  const [profile, setProfile] = useState('');

  useEffect(() => {
    getProfileImage();
  }, []);

  const getProfileImage = async () => {
    const token = await SecureStore.getItemAsync('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const user = await getAllRestaurants(token);
    setProfile(user.profileImage);
  };

  return (
    <Drawer.Navigator
      initialRouteName="vendorOrders"
      screenOptions={{
        headerTitle: 'COOL CHOP',
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#000',
        },
        drawerStyle: {
          backgroundColor: '#FFFFFF', // Drawer background
        },
        drawerActiveBackgroundColor: '#D32F2F', // Active item background
        drawerActiveTintColor: '#FFFFFF', // Active item text color
        drawerInactiveTintColor: '#000000', // Inactive item text color
        drawerItemStyle: {
          borderRadius: 10, // Rounded corners for the active bar
          marginVertical: 5, // Add spacing between items
        },
        headerRight: () => (
          <View style={styles.headerRightContainer}>
            <TouchableOpacity style={styles.profileContainer}>
              <Image
                source={{ uri: `${baseURL}/public/uploads/${profile}` }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>
        ),
      }}
    >
      <Drawer.Screen
        name="vendorOrders"
        component={vendorOrders}
        options={{
          drawerIcon: () => (
            <FontAwesome name="shopping-cart" color="gray" size={20} />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={Settings}
        options={{
          drawerIcon: () => (
            <FontAwesome name="cogs" size={20} color="gray" />
          ),
        }}
      />
      <Drawer.Screen
        name="Help"
        component={SupportScreen}
        options={{
          drawerIcon: () => (
            <Ionicons name="help" size={20} color="gray" />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  profileContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
