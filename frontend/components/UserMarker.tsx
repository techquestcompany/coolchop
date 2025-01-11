import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import { Marker } from 'react-native-maps';


const UserMarker = ({user}) => {
  return (
    <Marker 
        coordinate={{latitude: user.location.latitude, longitude: user.location.longitude}}
        title={user.name}
        description='You are here'
    >
        <View
        style={{
            padding: 2,
            paddingHorizontal: 8,
            borderRadius: 50,
            backgroundColor: 'white',
        }}
        >
        <Image source={{ uri: user.profileImage}} style={{width: 50, height: 50, borderRadius: 50}} />
        </View>
    </Marker>
  )
}

export default UserMarker

const styles = StyleSheet.create({})