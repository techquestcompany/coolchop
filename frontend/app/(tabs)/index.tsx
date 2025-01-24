import React, { useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import UserSettings from '../UserSettings';
import UserHome from '../UserHome';
import Cart from '../cart';
import Orders from '../order';
import UserSupport from '../UserSupport';
import Logout from '../logout';
import { baseURL, getUserData } from '@/services/api';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

const Drawer = createDrawerNavigator();

export default function App() {
  const [profile, setProfile] = useState('');

  useEffect(() => {
    getProfileImage();
  }, []);

  const getProfileImage = async () => {
    const token = await SecureStore.getItemAsync('userId');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const user = await getUserData(token);
    setProfile(user.profileImage);
  };

  return (
    <Drawer.Navigator
      initialRouteName="UserHome"
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: '#fff',
          height: 80,
        },
        headerTitle: () => (
          <Text style={styles.headerTitle}>
            COOL <Text style={styles.headerChop}>CHOP</Text>
          </Text>
        ),
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
            <Ionicons name="menu" size={28} color="black" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity style={styles.profileContainer} onPress={() => router.push('/profile')}>
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
      })}
    >
      <Drawer.Screen
        name="UserHome"
        component={UserHome}
        options={{
          drawerIcon: () => <FontAwesome name="home" size={20} color="black" />,
          drawerLabel: "Home"
        }}
      />
      <Drawer.Screen
        name="cart"
        component={Cart}
        options={{
          drawerIcon: () => <FontAwesome name="shopping-cart" size={20} color="black" />,
          drawerLabel: "Cart"
        }}
      />
      <Drawer.Screen
        name="order"
        component={Orders}
        options={{
          drawerIcon: () => <FontAwesome name="motorcycle" size={20} color="black" />,
          drawerLabel: "Orders"
        }}
      />
      <Drawer.Screen
        name="UserSettings"
        component={UserSettings}
        options={{
          drawerIcon: () => <FontAwesome name="cogs" size={20} color="black" />,
          drawerLabel: "Settings"
        }}
      />
      <Drawer.Screen
        name="UserSupport"
        component={UserSupport}
        options={{
          drawerIcon: () => <Ionicons name="help" size={20} color="black" />,
          drawerLabel: "Support"
        }}
      />
      <Drawer.Screen
        name="Logout"
        component={Logout}
        options={{
          drawerIcon: () => <MaterialIcons name="logout" size={24} color="black" />,
          drawerLabel: "Logout"
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Roboto', // Use a custom font if needed
  },
  headerChop: {
    color: '#D32F2F', 
  },
  menuButton: {
    marginLeft: 10,
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
