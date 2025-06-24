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
        <Text style={styles.contentText} >
          Coolchop is a food delivery company in Ghana registered under registrar of companies. We bridge the gap between food vendors and consumers by putting the neccesary procedures and tools in place so
          customers can order food from their place of comfort and get it delivered to them. We use our riders who serve as the linkup between the customer and the vendor.
          Our riders are professionally trained and have our customers at heart.

        </Text>

        <Text style={styles.title} >How does it work?</Text>
        <Text style={styles.contentText} >
         1. A customer browse through the list of foods and choose what to order. 
        </Text>
        <Text style={styles.contentText} >
         2. He makes the order and proceed to pay. 
        </Text>

        <Text style={styles.contentText} >
         3. The rider brings his food.
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
      fontSize:25
    },
    textContainer:{
     margin:4,

    },
    backButton: {
      alignSelf: 'flex-start',
      marginBottom: 20,
    },
    contentText:{
      fontSize:18
    }

  })
export default AboutCoolchop  