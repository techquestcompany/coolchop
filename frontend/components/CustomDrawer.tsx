import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Button } from 'react-native';

const CustomDrawer = ({ isVisible, onClose }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.drawerContainer}>
        <View style={styles.drawerContent}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>X</Text>
          </TouchableOpacity>

          <Text style={styles.drawerItem}>Home</Text>
          <Text style={styles.drawerItem}>Profile</Text>
          <Text style={styles.drawerItem}>Settings</Text>
          <Text style={styles.drawerItem}>Logout</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Overlay color
  },
  drawerContent: {
    backgroundColor: 'white',
    width: 250,
    height: '100%',
    paddingTop: 50,
    paddingLeft: 20,
    paddingRight: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
    backgroundColor: '#ff5c5c',
    borderRadius: 20,
  },
  closeText: {
    color: 'white',
    fontSize: 18,
  },
  drawerItem: {
    fontSize: 18,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});

export default CustomDrawer;
