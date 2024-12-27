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

export default function VendorProfileScreen() {
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
        <Text style={styles.name}>Vendor Name</Text>
        <Text style={styles.tagline}>Delivering Happiness 🚚</Text>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Business Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Details</Text>
        <View style={styles.row}>
          <FontAwesome5 name="store" size={20} color="#D32F2F" />
          <Text style={styles.rowText}>Business Name: Foodies Heaven</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="mail" size={20} color="#D32F2F" />
          <Text style={styles.rowText}>vendor@example.com</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="call" size={20} color="#D32F2F" />
          <Text style={styles.rowText}>+123 456 7890</Text>
        </View>
      </View>

      {/* Address Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Address</Text>
        <TouchableOpacity style={styles.row}>
          <MaterialIcons name="location-on" size={20} color="#D32F2F" />
          <Text style={styles.rowText}>123 Market Street, City</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-circle" size={20} color="#D32F2F" />
          <Text style={styles.addButtonText}>Edit Address</Text>
        </TouchableOpacity>
      </View>

      {/* Operational Hours */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Operational Hours</Text>
        <View style={styles.row}>
          <Ionicons name="time" size={20} color="#D32F2F" />
          <Text style={styles.rowText}>9:00 AM - 9:00 PM</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="create" size={20} color="#D32F2F" />
          <Text style={styles.addButtonText}>Edit Hours</Text>
        </TouchableOpacity>
      </View>

      {/* Payment Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Information</Text>
        <View style={styles.row}>
          <Ionicons name="card" size={20} color="#D32F2F" />
          <Text style={styles.rowText}>Bank Account: **** 1234</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-circle" size={20} color="#D32F2F" />
          <Text style={styles.addButtonText}>Update Payment Info</Text>
        </TouchableOpacity>
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <TouchableOpacity style={styles.row}>
          <Ionicons name="notifications" size={20} color="#D32F2F" />
          <Text style={styles.rowText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Ionicons name="help-circle" size={20} color="#D32F2F" />
          <Text style={styles.rowText}>Help Center</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Ionicons name="log-out" size={20} color="#D32F2F" />
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
    backgroundColor: "#D32F2F",
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
    color: "#D32F2F",
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
    color: "#D32F2F",
    fontSize: 16,
    fontWeight: "bold",
  },
});
