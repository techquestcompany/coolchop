import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Card } from 'react-native-paper';

import { fetchAllOrders, getAllUsers } from '@/services/api';

/* =========================
   Helpers
========================= */
const safeNumber = (value) => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

const screenWidth = Dimensions.get('window').width;

/* =========================
   Component
========================= */
const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [ordersChart, setOrdersChart] = useState([0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [ordersRes, usersRes] = await Promise.all([
        fetchAllOrders(),
        getAllUsers(1, 500),
      ]);

      const orders = ordersRes?.orders || ordersRes || [];
      const users = usersRes?.users || [];

      setTotalUsers(usersRes.totalUsers);

      setTotalOrders(ordersRes.totalOrders);

      // Orders per day (Sun - Sat)
      const weeklyOrders = [0, 0, 0, 0, 0, 0, 0];

      orders.forEach(order => {
        const day = new Date(order.createdAt).getDay();
        weeklyOrders[day] += 1;
      });

      setOrdersChart(weeklyOrders.map(safeNumber));
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [{ data: ordersChart }],
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Admin Dashboard</Text>

      {/* ===== Stats Cards ===== */}
      <View style={styles.statsRow}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Total Users</Text>
          <Text style={styles.cardValue}>{totalUsers}</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Total Orders</Text>
          <Text style={styles.cardValue}>{totalOrders}</Text>
        </Card>
      </View>

      {/* ===== Orders Chart ===== */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Orders (Last 7 Days)</Text>

        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: opacity => `rgba(37, 99, 235, ${opacity})`,
            labelColor: opacity => `rgba(0,0,0,${opacity})`,
            propsForDots: {
              r: '5',
              strokeWidth: '2',
              stroke: '#2563eb',
            },
          }}
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
};

/* =========================
   Styles
========================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '48%',
    padding: 16,
  },
  cardTitle: {
    fontSize: 14,
    color: '#666',
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
  },
  chartContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chart: {
    borderRadius: 10,
  },
});

export default AdminDashboard;
