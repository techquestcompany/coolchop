import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Marker } from 'react-native-maps';
import Ionicons from '@expo/vector-icons/Ionicons';


const ResMarker = ({res, onPress}) => {
  return (
    <Marker 
      onPress={onPress}
      coordinate={{latitude: res.latitude, longitude: res.longitude}}
    >
      <View
        style={{
            padding: 5,
            paddingHorizontal: 8,
        }}
        >
        <Ionicons name="restaurant" size={30} color="black" />
      </View>
    </Marker>
  )
}

export default ResMarker

const styles = StyleSheet.create({})