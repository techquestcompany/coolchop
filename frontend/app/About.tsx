import {View,Text,Button,StyleSheet,TouchableOpacity,SafeAreaView} from 'react-native'
import { FontAwesome } from '@expo/vector-icons';
import { router  } from 'expo-router';

const AboutCoolchop = () => {
    return (
     <SafeAreaView style={styles.contentContainer}>
     <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
     <FontAwesome name="arrow-left" size={24} color="#D32F2F" />
   </TouchableOpacity>
      <Text style={styles.title} >Who are we?</Text>
      <View style={styles.textContainer} >
        <Text>
          Coolchop is an food delivering company who  creates the medium for customers to be able to order food from Vendors at their own convenience
          and get it delivered to them at their own  by riders.
        </Text>
        <Text>
          We ensure your security and provide you the best of service you wont get anywhere
        </Text>
      </View>
     </SafeAreaView>
    );
  };
  const styles= StyleSheet.create({
    contentContainer:{ 
      flex:1,
      marginTop:15
    },
    title:{
      fontWeight:"bold",
      fontSize:20
    },
    textContainer:{
     margin:4,

    },
    backButton: {
      alignSelf: 'flex-start',
      marginBottom: 20,
    }

  })
export default AboutCoolchop  