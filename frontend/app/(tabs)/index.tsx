import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import UserHome from '../UserHome';
import UserSettings from '../UserSettings';
import UserSupport from '../UserSupport';
import Logout from '../logout';

const Drawer = createDrawerNavigator();

export default function App() {
  const userProfileImage = 'https://via.placeholder.com/40';

  return (
      <Drawer.Navigator
        initialRouteName="UserHome"
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
                  source={{ uri: userProfileImage }}
                  style={styles.profileImage}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      >
        <Drawer.Screen
          name="UserHome"
          component={UserHome}
          options={{
            drawerActiveBackgroundColor: '#D32F2F',
            drawerIcon: () => <FontAwesome name="shopping-cart" size={20} color="gray" />,
            drawerActiveTintColor: 'gray',
          }}
        />
        <Drawer.Screen
          name="UserSettings"
          component={UserSettings}
          options={{
            drawerActiveBackgroundColor: '#D32F2F',
            drawerIcon: () => <FontAwesome name="cogs" size={20} color="gray" />,
            drawerActiveTintColor: 'gray',
          }}
        />
        <Drawer.Screen
          name="UserSupport"
          component={UserSupport}
          options={{
            drawerActiveBackgroundColor: '#D32F2F',
            drawerIcon: () => <Ionicons name="help" size={20} color="gray" />,
            drawerActiveTintColor: 'black',
          }}
        />
        <Drawer.Screen
          name="Logout"
          component={Logout}
          options={{
            drawerActiveBackgroundColor: '#D32F2F',
            drawerIcon: () => <FontAwesome name="cogs" size={20} color="gray" />,
            drawerActiveTintColor: 'gray',
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
