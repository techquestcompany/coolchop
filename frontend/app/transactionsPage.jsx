import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import * as SecureStore from "expo-secure-store";
import { fetchUserTransactions, getUserData } from "../services/api";
import { router } from "expo-router";

export default function TransactionsHistoryScreen() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [token, setToken] = useState(null); 

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = await SecureStore.getItemAsync("customer_token");
      if (!storedToken) {
        router.push("/login");
      } else {
        setToken(storedToken); 
        await getUserData(storedToken); 
        loadTransactions(1, storedToken); 
      }
    };
    checkAuth();
  }, []);

 const loadTransactions = async (nextPage = 1, authToken = token) => {
  if (loading || nextPage > totalPages) return;
  setLoading(true);
  try {
    const data = await fetchUserTransactions(authToken, nextPage);
    setTransactions((prev) => (nextPage === 1 ? data.data : [...prev, ...data.data]));
    setTotalPages(data.totalPages || 1);
    setPage(nextPage);
  } catch (err) {
    console.error("Error fetching transactions:", err);
  } finally {
    setLoading(false);
  }
};

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.amount}>Amount:₵{item.amount/100}</Text>
      <Text>Status: {item.status}</Text>
      <Text>Order Ref: {item.reference || "N/A"}</Text>
      <Text>Date:{new Date(item.createdAt).toLocaleString()}</Text>
    </View>
  );

return (
  <FlatList
    data={transactions}
    renderItem={renderItem}
    keyExtractor={(item) => item.id.toString()}
    onEndReached={() => loadTransactions(page + 1)}
    onEndReachedThreshold={0.5}
    ListFooterComponent={loading && <ActivityIndicator style={{ margin: 16 }} />}

    // 👉 Show message when empty
    ListEmptyComponent={
      !loading && (
        <View style={{ padding: 20, alignItems: "center" }}>
          <Text style={{ fontSize: 16, color: "#555" }}>
            No transactions found
          </Text>
        </View>
      )
    }

    contentContainerStyle={
      transactions.length === 0
        ? { flex: 1, justifyContent: "center" } // center empty state
        : { padding: 16 }
    }
  />
);

}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 3,
  },
  amount: { fontSize: 18, fontWeight: "bold", color: "#28a745" },
});
