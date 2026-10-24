import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Drawer, DrawerToggleButton } from 'expo-router/drawer';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { baseURL, getUserData } from '@/services/api';

export default function CustomerDrawerLayout() {
  const [profile, setProfile] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token =
          (await SecureStore.getItemAsync('customer_token')) ??
          (await SecureStore.getItemAsync('token'));
        if (!token) {
          throw new Error('No authentication token found');
        }

        const user = await getUserData(token);
        setProfile(user.profileImage);
      } catch (error) {
        console.error('Failed to load customer profile image:', error);
      }
    };

    loadProfile();
  }, []);

  return (
    <Drawer
      initialRouteName="index"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
          height: 80,
        },
        headerTitle: () => (
          <Text style={styles.headerTitle}>
            COOL <Text style={styles.headerChop}>CHOP</Text>
          </Text>
        ),
        headerLeft: () => <DrawerToggleButton tintColor="black" />,
        headerRight: () => (
          <TouchableOpacity
            style={styles.profileContainer}
            onPress={() => router.push('/profile')}
          >
            <Image
              source={{ uri: `${baseURL}/public/uploads/${profile}` }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        ),
        drawerStyle: {
          backgroundColor: '#FFFFFF',
        },
        drawerActiveBackgroundColor: '#D32F2F',
        drawerActiveTintColor: 'white',
        drawerInactiveTintColor: 'black',
        drawerItemStyle: {
          borderRadius: 10,
          marginVertical: 5,
        },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: 'Home',
          drawerLabel: 'Home',
          drawerIcon: () => <FontAwesome name="home" size={20} color="black" />,
        }}
      />
      <Drawer.Screen
        name="customer-cart"
        options={{
          title: 'Cart',
          drawerIcon: () => <FontAwesome name="shopping-cart" size={20} color="black" />,
        }}
      />
      <Drawer.Screen
        name="customer-orders"
        options={{
          title: 'Orders',
          drawerIcon: () => <FontAwesome name="motorcycle" size={20} color="black" />,
        }}
      />
      <Drawer.Screen
        name="customer-settings"
        options={{
          title: 'Settings',
          drawerIcon: () => <FontAwesome name="cogs" size={20} color="black" />,
        }}
      />
      <Drawer.Screen
        name="customer-support"
        options={{
          title: 'Support',
          drawerIcon: () => <Ionicons name="help" size={20} color="black" />,
        }}
      />
      <Drawer.Screen
        name="customer-logout"
        options={{
          title: 'Logout',
          drawerIcon: () => <MaterialIcons name="logout" size={24} color="black" />,
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Roboto',
  },
  headerChop: {
    color: '#D32F2F',
  },
  profileContainer: {
    width: 50,
    height: 50,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    marginRight: 10,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
