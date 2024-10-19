import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const useCheckAuthAndNavigateToIndex = () => {
  const router = useRouter();

  const checkAndRedirect = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const restaurantId = await AsyncStorage.getItem('restaurantId');

      if (!userId && !restaurantId) {
        router.push('/'); 
      }
    } catch (error) {
      console.error('Error checking user or restaurant ID:', error);
    }
  };

  useEffect(() => {
    checkAndRedirect();
  }, []);
};

export default useCheckAuthAndNavigateToIndex;
