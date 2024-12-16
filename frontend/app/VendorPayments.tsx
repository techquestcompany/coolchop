import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const Payments = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Payments</Text>

      <Text style={styles.subHeader}>Vendor Payment Process</Text>
      <Text style={styles.text}>
        As a vendor, you will only receive payment once the following conditions are met:
      </Text>
      
      <Text style={styles.bulletText}>1. The user places an order through the app.</Text>
      <Text style={styles.bulletText}>2. The rider picks up the order and is on their way to the customer's location.</Text>
      <Text style={styles.bulletText}>3. The rider successfully reaches your location to pick up the order.</Text>
      <Text style={styles.bulletText}>4. Payment will be processed and transferred to you once the rider reaches your location.</Text>

      <Text style={styles.text}>
        Please ensure that the items are ready for pickup before the rider arrives to avoid delays in the payment process.
      </Text>

      <Text style={styles.text}>
        If you have any concerns or questions regarding the payment process, feel free to contact support.
      </Text>

      <Text style={styles.subHeader}>Payment Methods</Text>
      <Text style={styles.text}>We offer various payment methods for vendors, including bank transfer, PayPal, and mobile money. Please ensure your payment details are updated in your account.</Text>

      <Text style={styles.subHeader}>Important Notes</Text>
      <Text style={styles.text}>- Payments are processed weekly or on the agreed payment cycle.</Text>
      <Text style={styles.text}>- Refunds or disputes should be directed to our support team for assistance.</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  subHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
  bulletText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
    paddingLeft: 20,
  },
});

export default Payments;
