import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";

import { useColorScheme } from '@/hooks/useColorScheme';
import { NotificationProvider } from '@/components/NotificationContext';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  ({ data, error, executionInfo }) => {
    console.log("✅ Received a notification in the background!", {
      data,
      error,
      executionInfo,
    });
    // Do something with the notification data
  }
);

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);


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
    <NotificationProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(res_tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="admin" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
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
          <Stack.Screen name="+not-found" />
          <Toast />
        </Stack>
      </ThemeProvider>
    </NotificationProvider>
  );
}
