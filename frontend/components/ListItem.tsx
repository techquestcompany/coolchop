import { StyleSheet, Text, View, Image, ViewStyle } from 'react-native'
import React from 'react'
import { baseURL } from '@/services/api';

type ListItem = {
    restaurant: any;
    containerStyle?: ViewStyle;
}

const ListItem = ({restaurant, containerStyle={}} : ListItem) => {
  return (
    <View style={[styles.card, containerStyle]}>
        <Image source={{uri: `${baseURL}/public/uploads/${restaurant.profileImage}` }} style={styles.image} />
        <View style={styles.rightContainer}>
            <Text style={styles.title} >{restaurant.restaurantName}</Text>
            <Text style={styles.description} >Great food at this fantastic cuisine</Text>
            <View style={styles.footer}>
                <Text style={styles.status} >{restaurant.rating}</Text>
                <Text style={styles.status} >{restaurant.status}</Text>
            </View>
        </View>
    </View>
  )
}

export default ListItem

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        flexDirection: 'row',
        borderRadius: 20,
        overflow: 'hidden',
    },
    title:{
        fontFamily: 'InterBold',
        marginBottom: 10,
        fontSize: 16,
    },
    image: {
        width: 150,
        aspectRatio: 1,
    },
    rightContainer: {
        padding: 10,
        flex: 1,
    },
    status: {
        fontFamily: 'InterBold',
    },
    description: {
        color: 'gray',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 'auto'
    }
})