import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { Card } from 'react-native-paper';

import { fetchAllOrders, getAllUsers } from '@/services/api';
import { getStoredToken } from '@/services/authStorage';

/* =========================
   Helpers
========================= */
const safeNumber = (value: unknown) => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

const screenWidth = Dimensions.get('window').width;

interface DashboardOrder {
  createdAt: string;
}

/* =========================
   Component
========================= */
const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [ordersChart, setOrdersChart] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [chartLabels, setChartLabels] = useState(['', '', '', '', '', '', '']);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const token = await getStoredToken('customer_token');
      if (!token) throw new Error('Admin session is missing');
      const [ordersRes, usersRes] = await Promise.all([
        fetchAllOrders(token),
        getAllUsers(token, 1, 100),
      ]);

      const orders: DashboardOrder[] = Array.isArray(ordersRes?.orders) ? ordersRes.orders : [];

      setTotalUsers(usersRes.totalUsers || 0);
      setTotalOrders(ordersRes.totalOrders ?? orders.length);

      const days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - (6 - index));
        return date;
      });
      const countsByDate = new Map<string, number>(
        days.map((date) => [date.toDateString(), 0] as const)
      );

      orders.forEach(order => {
        const date = new Date(order.createdAt);
        if (!Number.isNaN(date.getTime())) {
          const dateKey = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toDateString();
          if (countsByDate.has(dateKey)) {
            countsByDate.set(dateKey, (countsByDate.get(dateKey) ?? 0) + 1);
          }
        }
      });

      setOrdersChart(days.map((date) => safeNumber(countsByDate.get(date.toDateString()))));
      setChartLabels(days.map((date) => date.toLocaleDateString(undefined, { weekday: 'short' })));
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: chartLabels,
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

      <Text style={styles.sectionTitle}>System management</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/manage_users')}>
          <Text style={styles.actionText}>Manage users and riders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/manage_res')}>
          <Text style={styles.actionText}>Approve and manage restaurants</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/admin/orders')}>
          <Text style={styles.actionText}>View and manage orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/admin/transactions')}>
          <Text style={styles.actionText}>View and manage transactions</Text>
        </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },
  actions: {
    gap: 10,
    paddingBottom: 24,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    elevation: 2,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminDashboard;
