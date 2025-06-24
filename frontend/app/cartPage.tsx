import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { getCartItems, getUserData, baseURL } from '@/services/api';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { useCart } from '@/context/CartContext';

const CartPage = () => {
  const { cartItems, setCartItems, incrementQuantity, decrementQuantity } = useCart();  
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCart = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const userData = await getUserData(token);
      const cartData = await getCartItems(userData.id, token);
      setCartItems(cartData); 
    } catch (error) { 
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const getTotal = () =>
    new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(
      cartItems.reduce((sum, item) => sum + item.Dish?.price * item.quantity, 0)
    );

  const getTotalAmount = () =>
    cartItems.reduce((sum, item) => sum + item.Dish?.price * item.quantity, 0);

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>
      {cartItems.length === 0 ? (
        <Text style={styles.empty}>Cart is empty.</Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image
                  source={{ uri: `${baseURL}/public/uploads/${item.Dish?.profileImage}` }}
                  style={styles.image}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.item}>{item.Dish?.dishName}</Text>
                  <Text>{item.Dish?.price} x {item.quantity} = ₵{item.Dish?.price * item.quantity}</Text>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity onPress={() => decrementQuantity(item.id)}>
                      <Text style={styles.quantityButton}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => incrementQuantity(item.id)}>
                      <Text style={styles.quantityButton}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
          <Text style={styles.total}>Total: {getTotal()}</Text>
          <TouchableOpacity
            style={styles.checkout}
            onPress={() => router.push({ pathname: '/InitTransaction', params: { amount: getTotalAmount()* 100 } })}
          >
            <Text style={styles.checkoutText}>Proceed to checkout</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  empty: { textAlign: 'center', marginTop: 20 },
  card: { flexDirection: 'row', marginBottom: 15, borderWidth: 1, borderRadius: 8, padding: 10, borderColor: '#ccc' },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 10 },
  item: { fontSize: 16, fontWeight: 'bold' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  quantityButton: { fontSize: 20, paddingHorizontal: 10, fontWeight: 'bold' },
  quantityText: { fontSize: 16, marginHorizontal: 10 },
  total: { fontSize: 18, fontWeight: 'bold', textAlign: 'right', marginTop: 20 },
  checkout: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  checkoutText: {
    textAlign: "center",
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  }
});

export default CartPage;
