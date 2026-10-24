import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';

export default function VendorTabLayout() {
  return (
    <Tabs
      initialRouteName="(vendorDrawer)"
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="(vendorDrawer)"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="manage_dishes"
        options={{
          title: 'Dishes',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'restaurant' : 'restaurant-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add_dish"
        options={{
          title: 'Add Dish',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'add' : 'add-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
