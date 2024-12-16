import { View, StyleSheet, SafeAreaView, Text, TouchableOpacity, Linking } from "react-native";
import { useState } from "react";
import { router } from "expo-router";

const VendorProfile = () => {
  const [restaurantData, setRestaurantData] = useState([]);

  const handleProfilePress = () => {
    router.navigate("/About");
  };

  const handleLogoPress = () => {

    router.navigate("/VendorLogo");
  };

  const openSocialLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={handleProfilePress} style={styles.profileText}>
          Add Profile
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.infoSection}>
          <Text style={styles.title}>Business Name</Text>
          <Text>Amasted Restaurants</Text>
        </View>

        <View style={styles.infoSection}>
          <TouchableOpacity style={styles.linkButton} onPress={handleLogoPress}>
            Logo and Branding
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.title}>Contact Information</Text>
          <Text>Amasted Restaurants</Text>

          <Text style={{ fontWeight: "bold" }}>Telephone Number</Text>
          <Text>0534678965</Text>

          <Text style={{ fontWeight: "bold" }}>Email</Text>
          <Text>info@amastedrestaurants.com</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.title}>Operating Hours</Text>
          <Text>Mon-Fri: 9:00 AM - 10:00 PM</Text>
          <Text>Sat-Sun: 10:00 AM - 11:00 PM</Text>
        </View>

        <View style={styles.socialLinksSection}>
          
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  profileContainer: {
    backgroundColor: '#D32F2F',
    width: 120,
    borderRadius: 5,
    position: "absolute",
    right: 40,
    top: 40,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  profileText: {
    color: "#fff",
    fontSize: 14,
    textAlign: 'center', // Center-align text for better appearance
  },
  contentContainer: {
    marginTop: 80,  // To avoid overlapping with the profile button
  },
  title: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  infoSection: {
    marginBottom: 15,
  },
  linkButton: {
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
  socialLinksSection: {
    marginTop: 20,
  },
  socialLink: {
    color: '#007BFF',
    textDecorationLine: 'underline',
    marginBottom: 5,
  },
});

export default VendorProfile;
