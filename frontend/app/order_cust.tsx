import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";

export default function FoodCustomization() {
  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.restaurantName}>Name of restaurant</Text>
          <Text style={styles.foodName}>Name of food</Text>
          <Text style={styles.deliveryTime}>Delivery time</Text>
        </View>

        {/* Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Options (Choose your preference)</Text>
          {[...Array(5)].map((_, index) => (
            <View key={index} style={styles.optionRow}>
              <Text>Option {index + 1} (Choose your preference)</Text>
              <View style={styles.optionControls}>
                <TouchableOpacity>
                  <Text style={styles.circleButton}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.circleButton}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Drinks/Refreshments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Drinks/Refreshment (optional)</Text>
          {["Bel-Cola 400ml", "Coca-Cola 400ml", "Malta Guinness Can 330ml"].map(
            (drink, index) => (
              <View key={index} style={styles.optionRow}>
                <Text>{drink}</Text>
                <View style={styles.optionControls}>
                  <TouchableOpacity>
                    <Text style={styles.circleButton}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text style={styles.circleButton}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leave a note here for the restaurant</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Type your suggestion here..."
            multiline
          />
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    alignItems: "center",
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  foodName: {
    fontSize: 16,
    color: "gray",
    marginTop: 5,
  },
  deliveryTime: {
    fontSize: 14,
    color: "gray",
    marginTop: 5,
  },
  section: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  optionControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  circleButton: {
    fontSize: 20,
    marginHorizontal: 10,
    color: "#ffa500",
  },
  noteInput: {
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 5,
    height: 100,
    textAlignVertical: "top",
  },
  viewOrderButton: {
    backgroundColor: "#ffa500",
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 10,
    margin: 15,
  },
  viewOrderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
