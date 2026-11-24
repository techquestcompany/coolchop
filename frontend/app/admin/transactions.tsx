import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, DataTable, Text } from 'react-native-paper';
import {
  deleteAdminTransaction,
  fetchAdminTransactions,
  getApiErrorMessage,
} from '@/services/api';
import { getStoredToken } from '@/services/authStorage';

interface AdminTransaction {
  id: number;
  userId: number;
  orderId?: number | null;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  channel?: string | null;
  createdAt: string;
  user?: { name?: string; email?: string } | null;
  order?: { orderNumber?: string; status?: string } | null;
}

export default function AdminTransactionsScreen() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadTransactions = useCallback(async (currentPage = 1) => {
    try {
      setLoading(true);
      const token = await getStoredToken('customer_token');
      if (!token) throw new Error('Admin session is missing');
      const result = await fetchAdminTransactions(token, currentPage, 20);
      setTransactions(Array.isArray(result?.data) ? result.data : []);
      setPage(result?.page ?? 1);
      setTotalPages(result?.totalPages ?? 1);
    } catch (error) {
      Alert.alert('Unable to load transactions', getApiErrorMessage(error, "We couldn't load transactions. Please try again."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const removeTransaction = (transaction: AdminTransaction) => {
    Alert.alert(
      'Delete transaction record?',
      'This only removes the app record; it does not reverse or refund a payment.',
      [
        { text: 'Keep record', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => { void deleteTransaction(transaction.id); },
        },
      ]
    );
  };

  const deleteTransaction = async (id: number) => {
    try {
      setDeletingId(id);
      const token = await getStoredToken('customer_token');
      if (!token) throw new Error('Admin session is missing');
      await deleteAdminTransaction(id, token);
      await loadTransactions(page);
    } catch (error) {
      Alert.alert('Unable to delete transaction', getApiErrorMessage(error, "We couldn't delete this transaction. Please try again."));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <View style={styles.loader}><ActivityIndicator size="large" /></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>All transactions</Text>
      <Text style={styles.notice}>Deleting a record does not reverse a payment or issue a refund.</Text>
      {transactions.length === 0 ? <Text>No transactions found.</Text> : transactions.map((transaction) => (
        <Card key={transaction.id} style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">{transaction.reference}</Text>
            <Text>Amount: {(transaction.amount / 100).toFixed(2)} {transaction.currency}</Text>
            <Text>Status: {transaction.status}</Text>
            <Text>Customer: {transaction.user?.name || transaction.user?.email || `User ${transaction.userId}`}</Text>
            <Text>Order: {transaction.order?.orderNumber || transaction.orderId || '—'}</Text>
            <Text>Channel: {transaction.channel || '—'}</Text>
            <Text>Created: {new Date(transaction.createdAt).toLocaleString()}</Text>
            <Button
              mode="outlined"
              textColor="#b42318"
              style={styles.button}
              loading={deletingId === transaction.id}
              disabled={deletingId !== null}
              onPress={() => removeTransaction(transaction)}
            >
              Delete transaction record
            </Button>
          </Card.Content>
        </Card>
      ))}
      <DataTable.Pagination
        page={page - 1}
        numberOfPages={totalPages}
        onPageChange={(newPage) => { void loadTransactions(newPage + 1); }}
        label={`Page ${page} of ${totalPages}`}
        showFastPaginationControls
        numberOfItemsPerPage={20}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, backgroundColor: '#f7f7f7', flexGrow: 1 },
  loader: { flex: 1, justifyContent: 'center' },
  title: { fontWeight: 'bold' },
  notice: { color: '#8a3b12' },
  card: { backgroundColor: '#fff' },
  button: { marginTop: 10, alignSelf: 'flex-start' },
});
