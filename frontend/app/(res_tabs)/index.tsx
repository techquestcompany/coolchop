
import React, { useEffect, useState } from 'react';
import { NavigationContainer,useNavigation } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, Button, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { baseURL, getAllRestaurants } from '@/services/api';
import * as SecureStore from 'expo-secure-store';
import vendorOrders from "../vendorOrders"
import Settings from "../vendorSettings"
import SupportScreen from '../Support';
const Drawer = createDrawerNavigator();




export default function App() {
  const [profile, setProfile] = useState('');

  useEffect(() => {
    getProfileImage();
  }, []);


   const getProfileImage = async () => {

    const token = await SecureStore.getItemAsync('restaurantId');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const user = await getAllRestaurants(token);
    setProfile(user.profileImage);
  
   }

  return (
    
      <Drawer.Navigator initialRouteName="vendorOrders"  
      screenOptions={{
        headerTitle: 'COOL CHOP',
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
          <View style={styles.headerRightContainer}>
            <TouchableOpacity style={styles.profileContainer}>
              <Image
                source={{  uri: `${baseURL}/public/uploads/${profile}` }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>
        ),
      }}
      >
        <Drawer.Screen name="vendorOrders" component={vendorOrders} options={{
          drawerActiveBackgroundColor:"#D32F2F",
          drawerIcon:()=>(
            <FontAwesome name="shopping-cart" colour="gray" size={20} />
          ),
          drawerActiveTintColor:"gray"
        }} />
        <Drawer.Screen name="Settings" component={Settings} options={{
          drawerActiveBackgroundColor:"#D32F2F",
          drawerIcon:() =>(
            <FontAwesome name='cogs' size={20} color="gray" />
              
          ),
          drawerActiveTintColor:"gray"
        }} />


      <Drawer.Screen name="Help" component={SupportScreen} options={{
          drawerActiveBackgroundColor:"#D32F2F",
          drawerIcon:() =>(
            <Ionicons name='help' size={20} color="gray" />
              
          ),
          drawerActiveTintColor:"black"
        }} />
      </Drawer.Navigator>
  
  );
}



const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  headerLocation: {
    color: '#fff',
    marginRight: 10,
    fontSize: 14,
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
