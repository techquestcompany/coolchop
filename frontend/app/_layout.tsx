import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { Provider as PaperProvider } from 'react-native-paper';

import { useColorScheme } from '@/hooks/useColorScheme';
import { CartProvider } from '@/context/CartContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <CartProvider>
        <PaperProvider>
        <Stack initialRouteName='index'> 
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(res_tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="admin" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="customer" options={{ headerShown: false }} />
          <Stack.Screen name="vendor" options={{ headerShown: false }} />
          <Stack.Screen name="verify" options={{ headerShown: false }} />
          <Stack.Screen name="location" options={{ headerShown: false }} />
          <Stack.Screen name="add_restaurants" options={{ headerShown: false }} />
          <Stack.Screen name="add_dish" options={{ headerShown: false }} />
          <Stack.Screen name="reslogin" options={{ headerShown: false }} />
          <Stack.Screen name="order" options={{ headerShown: false }} />
          <Stack.Screen name="order_cust" options={{ headerShown: false }} />
          <Stack.Screen name="res_info" options={{ headerShown: false }} />
          <Stack.Screen name="dish_info" options={{ headerShown: false }} />
          <Stack.Screen name="forgot_password" options={{ headerShown: false }} />
          <Stack.Screen name="manage_users" options={{ headerShown: false }} />
          <Stack.Screen name="manage_res" options={{ headerShown: false }} />
          <Stack.Screen name="users" options={{ headerShown: false }} />
          <Stack.Screen name="restaurants" options={{ headerShown: false }} />
          <Stack.Screen name="[id]" options={{ headerShown: false }} />
          <Stack.Screen name="vendorOrders" options={{ headerShown: false }} />
          <Stack.Screen name="vendorSettings" options={{ headerShown: false }} />
          <Stack.Screen name="About" options={{ headerShown: false }} />
          <Stack.Screen name="vendorPayments" options={{ headerShown: false }} />
          <Stack.Screen name="Support" options={{ headerShown: false }} />
          <Stack.Screen name="vendorProfile" options={{ headerShown: false }} />
          <Stack.Screen name="UserSettings" options={{ headerShown: false }} />
          <Stack.Screen name="UserHome" options={{ headerShown: false }} />
          <Stack.Screen name="UserSupport" options={{ headerShown: false }} />
          <Stack.Screen name="logout" options={{ headerShown: false }} />
          <Stack.Screen name="edit_profile" options={{ headerShown: false }} />
          <Stack.Screen name="cart" options={{ headerShown: false }} />
          <Stack.Screen name="passResetCode" options={{ headerShown: false }} />
          <Stack.Screen name="vendorContainer" options={{ headerShown: false }} />
          <Stack.Screen name="riderSignup" options={{ headerShown: false }} />
          <Stack.Screen name="editVendorScreen" options={{ headerShown: false }} />
          <Stack.Screen name="changePassword" options={{ headerShown: false }} />
          <Stack.Screen name="userProfile" options={{ headerShown: false }} />
          <Stack.Screen name="cartPage" options={{ headerShown: false }} />
          <Stack.Screen name="Account" options={{ headerShown: false }} />
          <Stack.Screen name="userOrder" options={{ headerShown: false }} />
          <Stack.Screen name="InitTransaction" options={{ headerShown: false }} />
          <Stack.Screen name="riderHomepage" options={{ headerShown: false }} />
          <Stack.Screen name="OrderDetails" options={{ headerShown: false }} />
          <Stack.Screen name="transactionsPage" options={{ headerShown: false }} />
          <Stack.Screen name="allTransactionsPage" options={{ headerShown: false }} />
          
          <Stack.Screen name="+not-found" />
        </Stack>
        <Toast></Toast>
        </PaperProvider>
      </CartProvider>
    </ThemeProvider>
  );
}
