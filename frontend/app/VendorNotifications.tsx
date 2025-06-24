import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Picker, Alert } from 'react-native';
import axios from 'axios';

const NotificationPreferences = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null); // To store which notification method is being selected
  const [notificationMethod, setNotificationMethod] = useState({
    order: null,
    delivery: null,
    status: null
  });
    
  //Show modal with options based on selected preference (Order, Delivery, Status)
  const handlePreferencePress = (preference) => {
    setSelectedNotification(preference);
    setShowModal(true);
  };

  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Preferences</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handlePreferencePress('order')}>
        <Text style={styles.buttonText}>Order Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity   
        style={styles.button}
        onPress={() => handlePreferencePress('delivery')}>
        <Text style={styles.buttonText}>Delivery Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handlePreferencePress('status')}>
        <Text style={styles.buttonText}>Status Update Notifications</Text>
      </TouchableOpacity>

      {/* Modal for selecting notification method */}
      <Modal visible={showModal} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Choose Notification Method</Text>
          
          <Picker
            selectedValue={notificationMethod[selectedNotification]}
            onValueChange={(itemValue) => {
              setNotificationMethod(prev => ({
                ...prev,
                [selectedNotification ]: itemValue
              }));
            }}>
            <Picker.Item label="Select a method" value={null} />
            <Picker.Item label="SMS" value="sms" />
            <Picker.Item label="Push Notification" value="push" />
            <Picker.Item label="Email" value="email" />
          </Picker>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveNotificationPreference}>
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowModal(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 12,
    marginBottom: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 12,                                   
    borderRadius: 5,
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  cancelButton: {
    backgroundColor: '#D32F2F',
    padding: 12,
    borderRadius: 5,
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default NotificationPreferences;
