import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { baseURL, getMyRestaurant } from '@/services/api';

export default function RestaurantDrawerLayout() {
  const [profile, setProfile] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = await SecureStore.getItemAsync('restaurant_token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const user = await getMyRestaurant(token);
        setProfile(user.profileImage);
      } catch (error) {
        console.error('Failed to load restaurant profile image:', error);
      }
    };

    loadProfile();
  }, []);

  return (
    <Drawer
      initialRouteName="index"
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
          backgroundColor: '#FFFFFF',
        },
        drawerActiveBackgroundColor: '#D32F2F',
        drawerActiveTintColor: '#FFFFFF',
        drawerInactiveTintColor: '#000000',
        drawerItemStyle: {
          borderRadius: 10,
          marginVertical: 5,
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
        name="index"
        options={{
          title: 'Vendor Orders',
          drawerLabel: 'Vendor Orders',
          drawerIcon: () => <FontAwesome name="shopping-cart" color="gray" size={20} />,
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: 'Settings',
          drawerIcon: () => <FontAwesome name="cogs" size={20} color="gray" />,
        }}
      />
      <Drawer.Screen
        name="help"
        options={{
          title: 'Help',
          drawerIcon: () => <Ionicons name="help" size={20} color="gray" />,
        }}
      />
    </Drawer>
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
