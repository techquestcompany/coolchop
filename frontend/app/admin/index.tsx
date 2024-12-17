import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Card, DataTable, Avatar } from 'react-native-paper';

const AdminDashboard = () => {
  const screenWidth = Dimensions.get('window').width;

  // Dummy data for the chart
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [200, 450, 300, 500, 700, 800, 900],
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Admin Dashboard</Text>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Total Revenue</Text>
          <Text style={styles.cardValue}>$12,450</Text>
        </Card>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Total Orders</Text>
          <Text style={styles.cardValue}>350</Text>
        </Card>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Pending Payments</Text>
          <Text style={styles.cardValue}>$2,300</Text>
        </Card>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Active Delivery Agents</Text>
          <Text style={styles.cardValue}>25</Text>
        </Card>
      </View>

      {/* Graph */}
      <View style={styles.graphContainer}>
        <Text style={styles.graphTitle}>Weekly Sales</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#1e2923',
            backgroundGradientFrom: '#08130D',
            backgroundGradientTo: '#1e2923',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#ffa726',
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Customer</DataTable.Title>
            <DataTable.Title numeric>Order Value</DataTable.Title>
            <DataTable.Title>Status</DataTable.Title>
          </DataTable.Header>
          <DataTable.Row>
            <DataTable.Cell>John Doe</DataTable.Cell>
            <DataTable.Cell numeric>$45.00</DataTable.Cell>
            <DataTable.Cell>Delivered</DataTable.Cell>
          </DataTable.Row>
          <DataTable.Row>
            <DataTable.Cell>Jane Smith</DataTable.Cell>
            <DataTable.Cell numeric>$30.00</DataTable.Cell>
            <DataTable.Cell>Pending</DataTable.Cell>
          </DataTable.Row>
        </DataTable>
      </View>

      {/* Top Performing Restaurants */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Restaurants</Text>
        <View style={styles.restaurantList}>
          <Avatar.Image size={50} source={{ uri: 'https://via.placeholder.com/150' }} />
          <Text style={styles.restaurantName}>Pizza Palace</Text>
        </View>
        <View style={styles.restaurantList}>
          <Avatar.Image size={50} source={{ uri: 'https://via.placeholder.com/150' }} />
          <Text style={styles.restaurantName}>Sushi Spot</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '48%',
    marginBottom: 10,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    color: '#555',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  graphContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 3,
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  chart: {
    marginTop: 10,
    borderRadius: 10,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  restaurantList: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  restaurantName: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminDashboard;
