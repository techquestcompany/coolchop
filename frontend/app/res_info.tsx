import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function App() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Pizzaman Chicken-man</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="arrow-back" size={24} color="black" />
        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={20} color="gray" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants..."
          />
        </View>
      </View>

      {/* Featured Banner */}
      <View style={styles.banner}>
        <Image
          style={styles.bannerImage}
          source={{ uri: "https://via.placeholder.com/300x150" }}
        />
        <View style={styles.bannerDetails}>
          <Text style={styles.bannerTitle}>Chapel Square</Text>
          <Text style={styles.bannerSubtitle}>⭐ 4.3 | 45 visits</Text>
          <Text style={styles.bannerDelivery}>
            Delivery time: GHS 15.00 to GHS 50.00
          </Text>
        </View>
      </View>

      {/* Menu Options */}
      <View style={styles.menuTabs}>
        <Text style={styles.menuTab}>Menu 1</Text>
        <Text style={styles.menuTab}>Menu 2</Text>
        <Text style={styles.menuTab}>Menu 3</Text>
        <Text style={styles.menuTab}>Menu 4</Text>
      </View>

      {/* Restaurant List */}
      <ScrollView style={styles.restaurantList}>
        {[...Array(5)].map((_, index) => (
          <View key={index} style={styles.restaurantCard}>
            <Image
              style={styles.restaurantImage}
              source={{
                uri: "https://via.placeholder.com/100x100",
              }}
            />
            <View style={styles.restaurantDetails}>
              <Text style={styles.restaurantName}>Sweet Mummy's Joint</Text>
              <Text style={styles.restaurantRating}>⭐ 3.5 | 85 visits</Text>
              <Text style={styles.restaurantDelivery}>Delivery time</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* View Order Button */}
      <TouchableOpacity style={styles.viewOrderButton}>
        <Text style={styles.viewOrderText}>VIEW ORDER</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    backgroundColor: "#fff",
    padding: 15,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 10,
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
  },
  searchInput: {
    marginLeft: 5,
    fontSize: 14,
    flex: 1,
  },
  banner: {
    backgroundColor: "#fff",
    padding: 10,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  bannerImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },
  bannerDetails: {
    marginTop: 10,
    alignItems: "center",
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "gray",
  },
  bannerDelivery: {
    fontSize: 12,
    color: "gray",
  },
  menuTabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  menuTab: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  restaurantList: {
    paddingHorizontal: 15,
    marginTop: 10,
  },
  restaurantCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  restaurantImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  restaurantDetails: {
    flex: 1,
    marginLeft: 10,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  restaurantRating: {
    fontSize: 14,
    color: "gray",
    marginVertical: 5,
  },
  restaurantDelivery: {
    fontSize: 12,
    color: "gray",
  },
  viewOrderButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#ffa500",
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 10,
  },
  viewOrderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
