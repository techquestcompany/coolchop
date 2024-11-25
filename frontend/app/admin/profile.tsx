import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          style={styles.avatar}
          source={{
            uri: "https://via.placeholder.com/150",
          }}
        />
        <Text style={styles.name}>John Doe</Text>
        <Text style={styles.tagline}>Foodie Lover 🍔</Text>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Account Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Details</Text>
        <View style={styles.row}>
          <FontAwesome5 name="user" size={20} color="#FF7F50" />
          <Text style={styles.rowText}>John Doe</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="mail" size={20} color="#FF7F50" />
          <Text style={styles.rowText}>johndoe@example.com</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="call" size={20} color="#FF7F50" />
          <Text style={styles.rowText}>+123 456 7890</Text>
        </View>
      </View>

      {/* Address Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saved Addresses</Text>
        <TouchableOpacity style={styles.row}>
          <MaterialIcons name="location-on" size={20} color="#FF7F50" />
          <Text style={styles.rowText}>123 Food Street, City</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-circle" size={20} color="#FF7F50" />
          <Text style={styles.addButtonText}>Add Address</Text>
        </TouchableOpacity>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.row}>
          <Ionicons name="fast-food" size={20} color="#FF7F50" />
          <Text style={styles.rowText}>Favorite Cuisine: Italian</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="leaf" size={20} color="#FF7F50" />
          <Text style={styles.rowText}>Dietary Preference: Vegan</Text>
        </View>
      </View>

      {/* Other Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <TouchableOpacity style={styles.row}>
          <Ionicons name="notifications" size={20} color="#FF7F50" />
          <Text style={styles.rowText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Ionicons name="help-circle" size={20} color="#FF7F50" />
          <Text style={styles.rowText}>Help Center</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Ionicons name="log-out" size={20} color="#FF7F50" />
          <Text style={styles.rowText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    backgroundColor: "#FF7F50",
    paddingVertical: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  tagline: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 20,
  },
  editButtonText: {
    color: "#FF7F50",
    fontWeight: "bold",
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  rowText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    marginLeft: 5,
    color: "#FF7F50",
    fontSize: 16,
    fontWeight: "bold",
  },
});