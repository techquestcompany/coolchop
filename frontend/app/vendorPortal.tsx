
import * as React from 'react';
import { NavigationContainer,useNavigation } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, Button } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import vendorOrders from "./vendorOrders"
import Settings from "./vendorSettings"
import SupportScreen from './Support';
import AddDishScreen from './(res_tabs)/add_dish';
const Drawer = createDrawerNavigator();




export default function App() {
  return (
    
      <Drawer.Navigator initialRouteName="vendorOrders">
        <Drawer.Screen name="vendorOrders" component={vendorOrders} options={{
          drawerActiveBackgroundColor:"#B07A7A",
          drawerIcon:()=>(
            <FontAwesome name="shopping-cart" colour="black" size={20} />
          ),
          drawerActiveTintColor:"black"
        }} />
        <Drawer.Screen name="Settings" component={Settings} options={{
          drawerActiveBackgroundColor:"gray",
          drawerIcon:() =>(
            <FontAwesome name='cogs' size={20} color="gray" />
              
          ),
          drawerActiveTintColor:"black"
        }} />

<Drawer.Screen name="Menu" component={AddDishScreen} options={{
          drawerActiveBackgroundColor:"gray",
          drawerIcon:() =>(
            <FontAwesome name='cogs' size={20} color="gray" />
              
          ),
          drawerActiveTintColor:"black"
        }} />


      <Drawer.Screen name="Help" component={SupportScreen} options={{
          drawerActiveBackgroundColor:"gray",
          drawerIcon:() =>(
            <Ionicons name='help' size={20} color="gray" />
              
          ),
          drawerActiveTintColor:"black"
        }} />
      </Drawer.Navigator>
  
  );
}
