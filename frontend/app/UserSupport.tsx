import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { router, Router } from 'expo-router';

const SupportScreen = () => {
  // Function to handle opening email
  const handleEmailPress = () => {
    Linking.openURL('mailto:support@example.com');
  };

  // Function to handle opening phone dialer
  const handlePhonePress = () => {
    Linking.openURL('tel:+1234567890');
  };

  // Function to navigate to 'About Coolchop' page
  const handleAboutPress = () => {
    router.navigate("AboutCoolchop"); 
  };

  const handleNavigation = (page) => {
    router.navigate(page); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Support</Text>

      {/* Email Section */}
      <TouchableOpacity style={styles.item} onPress={handleEmailPress}>
        <MaterialCommunityIcons name="email-outline" size={24} color="black" />
        <Text style={styles.text}>support@example.com</Text>
      </TouchableOpacity>

      {/* Phone Section */}
      <TouchableOpacity style={styles.item} onPress={handlePhonePress}>
        <MaterialIcons name="call" size={24} color="black" />
        <Text style={styles.text}>0245678965</Text>
      </TouchableOpacity>

      {/* About Coolchop Section */}
      <TouchableOpacity style={styles.item} onPress={handleAboutPress}>
        <Text style={styles.text}>About Coolchop</Text>
        <Ionicons name="arrow-forward" size={24} color="black" style={styles.icon} />
      </TouchableOpacity>

      {/* Account and data Section */}
      <TouchableOpacity style={styles.item} onPress={() => handleNavigation('Account')}>
        <Text style={styles.text}>Account and data</Text>
        <Ionicons name="arrow-forward" size={24} color="black" style={styles.icon} />
      </TouchableOpacity>

     

      {/* Payments and Pricing Section */}
      <TouchableOpacity style={styles.item} onPress={() => handleNavigation('VendorPayments')}>
        <Text style={styles.text}>Payments and Pricing</Text>
        <Ionicons name="arrow-forward" size={24} color="black" style={styles.icon} />
      </TouchableOpacity>

      {/* Pricing Section */}
      <TouchableOpacity style={styles.item} onPress={() => handleNavigation('Pricing')}>
        <Text style={styles.text}>Pricing</Text>
        <Ionicons name="arrow-forward" size={24} color="black" style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start', // Align items to the left
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
    justifyContent: 'space-between', // Ensure the icon goes to the far right
    width: '100%',
  },
  text: {
    fontSize: 18,
  },
  icon: {
    marginLeft: 10,
  },
});

export default SupportScreen;
