import { StyleSheet, Text, View, Image } from 'react-native'
import React, { useState } from 'react'
import { Marker } from 'react-native-maps';
import { baseURL } from '@/services/api';


const UserMarker = ({user, onSaveCoordinates}) => {
  const [newCoordinates, setNewCoordinates] = useState({
    latitude: user.latitude,
    longitude: user.longitude,
  });

  const handleDragEnd = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setNewCoordinates({ latitude, longitude });

    onSaveCoordinates({ latitude, longitude });

  };
  return (
    <Marker 
     coordinate={newCoordinates}
      title={user.name}
      description='You are here'
      draggable
      onDragEnd={handleDragEnd}
    >
        <View
        style={styles.markerContainer}
        >
        <Image source={{ uri: `${baseURL}/public/uploads/${user.profileImage}`}} style={styles.markerImage} />
        </View>
    </Marker>
  )
}

export default UserMarker

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 2,
    paddingHorizontal: 8,
  },
  markerImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
})