import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function OrderSummary() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color="black" />
        <Text style={styles.headerText}>Your order summary</Text>
      </View>

      {/* Order Details */}
      <ScrollView style={styles.orderDetails}>
        <View style={styles.restaurantDetails}>
          <Text style={styles.restaurantName}>Name of restaurant</Text>
          <Text style={styles.serviceCharge}>Service charge</Text>
          <View style={styles.itemRow}>
            <Text>1x Waakye - Large</Text>
            <Text>GHS</Text>
          </View>
          <View style={styles.itemRow}>
            <Text>1x Wele, Fried beef, Sauce, Boiled egg, Salad & Gari</Text>
            <Text>GHS</Text>
          </View>
          <View style={styles.itemRow}>
            <Text>2x Wele</Text>
            <Text>GHS</Text>
          </View>
          <View style={styles.itemRow}>
            <Text>1x Fried beef</Text>
            <Text>GHS</Text>
          </View>
          <View style={styles.itemRow}>
            <Text>1x Gari</Text>
            <Text>GHS</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionButtons}>
          <TouchableOpacity>
            <Text style={styles.repeatOrder}>Repeat order list</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.editOrder}>Edit order list</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.deleteOrder}>Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Summary Footer */}
      <View style={styles.summaryFooter}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        <Text>Qty Items(s)</Text>
        <Text>Service Charge</Text>
        <Text>Delivery point: Chapel Square</Text>
        <Text style={styles.total}>Total [Delivery included]</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#ffa500",
  },
  orderDetails: {
    padding: 15,
  },
  restaurantDetails: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  serviceCharge: {
    color: "gray",
    marginTop: 5,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  repeatOrder: {
    color: "#ffa500",
  },
  editOrder: {
    color: "#ffa500",
  },
  deleteOrder: {
    color: "red",
  },
  summaryFooter: {
    backgroundColor: "#fff",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
  },
  summaryTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  total: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
});
