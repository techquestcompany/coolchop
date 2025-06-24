import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const VendorSettings = () => {
  const handleNavigation = (page) => {
    router.navigate(page);
  };

  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'You can reach us at support@coolchop.com or call +123456789.');
  };

  const handleOpenWebsite = () => {
    Linking.openURL('https://www.coolchop.com');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      {/* Notifications Section */}
      <TouchableOpacity style={styles.item} onPress={() => handleNavigation('VendorNotifications')}>
        <Text style={styles.text}>Notification Settings</Text>
        <Ionicons name="arrow-forward" size={24} color="black" style={styles.icon} />
      </TouchableOpacity>

      {/* Social Media Section */}
      <TouchableOpacity style={styles.item} onPress={() => handleNavigation('VendorPayments')}>
        <Text style={styles.text}>Payments</Text>
        <Ionicons name="arrow-forward" size={24} color="black" style={styles.icon} />
      </TouchableOpacity>

      {/* Password Section */}
      <TouchableOpacity style={styles.item} onPress={() => handleNavigation('Pricing')}>
        <Text style={styles.text}>Password</Text>
        <Ionicons name="arrow-forward" size={24} color="black" style={styles.icon} />
      </TouchableOpacity>

      {/* Support Section */}
      <TouchableOpacity style={styles.item} onPress={handleContactSupport}>
        <Text style={styles.text}>Contact Support</Text>
        <MaterialCommunityIcons name="headset" size={24} color="black" style={styles.icon} />
      </TouchableOpacity>

      {/* Visit Website Section */}
      <TouchableOpacity style={styles.item} onPress={handleOpenWebsite}>
        <Text style={styles.text}>Visit Website</Text>
        <MaterialIcons name="web" size={24} color="black" style={styles.icon} />
      </TouchableOpacity>

      {/* About Section */}
      <TouchableOpacity style={styles.item} onPress={() => handleNavigation('AboutCoolchop')}>
        <Text style={styles.text}>About Coolchop</Text>
        <Ionicons name="information-circle-outline" size={24} color="black" style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  icon: {
    marginLeft: 10,
  },
});

export default VendorSettings;
