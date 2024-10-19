import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const useCheckAuthAndNavigateToHome = () => {
  const router = useRouter();

  const checkAndRedirect = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const restaurantId = await AsyncStorage.getItem('restaurantId');

      if (userId) {
        router.push('/(tabs)');  
        return;
      }

      if (restaurantId) {
        router.push('/(res_tabs)');  
        return;
      }
    } catch (error) {
      console.error('Error checking user or restaurant ID:', error);
    }
  };

  useEffect(() => {
    checkAndRedirect();
  }, []);
};

export default useCheckAuthAndNavigateToHome;
