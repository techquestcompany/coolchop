import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { getUserData, updateUserData, getApiErrorMessage } from '@/services/api';
import { getStoredToken } from '@/services/authStorage';

export default function EditUserProfileScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone : ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = await getStoredToken('customer_token');
      if (!token) throw new Error('Customer session is missing');
      const data = await getUserData(token);

      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone|| ''
      });
    } catch (error) {
      Alert.alert('Unable to load profile', getApiErrorMessage(error, "We couldn't load your profile. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await getStoredToken('customer_token');
      if (!token) throw new Error('Customer session is missing');
      await updateUserData({ ...formData }, token);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (error) {
      console.error(error);
      Alert.alert('Unable to update profile', getApiErrorMessage(error, "We couldn't update your profile. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Edit User Profile</Text>

        <TextInput
          style={styles.input}
          placeholder="Name"
          value={formData.name}
          onChangeText={(text) => handleChange('name', text)}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(text) => handleChange('email', text)}
        />

        <TextInput
          style={styles.input}
          placeholder="telephone"
          keyboardType="numeric"
          value={formData.phone}
          onChangeText={(text) => handleChange('phone', text)}
        />

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={isSubmitting}>
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  input: {
    height: 50,
    borderColor: '#D32F2F',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15
  },
  button: {
    backgroundColor: '#D32F2F',
    paddingVertical: 15,
    borderRadius: 10
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center'
  }
});
