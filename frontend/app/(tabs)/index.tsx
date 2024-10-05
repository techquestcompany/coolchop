import { Image, View, StyleSheet, Platform, SafeAreaView, Text, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>
          Serve your meals to hungry customers nearby
        </Text>
      </View>

      <Image
        style={styles.image}
        source={require("../../assets/images/pexels-norma-mortenson-4393668.jpg")}
      />

      <View style={styles.secondTextContainer}>
        <Text style={{ fontWeight: "bold" }}>
          Reach more customers with your food servings
        </Text>
        <Text style={{ fontWeight: "bold" }}>
          Restaurants on <Text style={{ fontWeight: "bold", color: "red" }}>COOL-CHOP</Text> see a sales boost of up to
          45% within the first 90 days
        </Text>
      </View>

      {/* New View for Managing Orders */}
      <View style={styles.orderManagementContainer}>
        <Text style={styles.orderManagementText}>
          Manage your online orders with COOL-CHOP
        </Text>
    

      {/* Three View Elements */}
      <View style={styles.threeViewsContainer}>
        <View style={styles.deepRedView}>
          <Text style={styles.viewText}>Order Tracking</Text>
        </View>
        <View style={styles.deepRedView}>
          <Text style={styles.viewText}>Customer Feedback</Text>
        </View>
        <View style={styles.deepRedView}>
          <Text style={styles.viewText}>Sales Reports</Text>
        </View>
      </View>

      {/* Button Below the Views */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>ADD MY RESTAURANT</Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "auto",
    marginBottom:30
  },
  headerContainer: {
    marginTop: 70,
  },
  headerText: {
    color: "red",
    fontWeight: "bold",
    fontSize: 24,
    textAlign: "center",
  },
  image: {
    height: 278,
    width: "90%",
    borderRadius: 10,
    marginLeft: 24,
  },
  secondTextContainer: {
    maxWidth: "100%",
    marginTop: 50,
    marginLeft: 20,
  },
  orderManagementContainer: {
    backgroundColor: '#ffcccc', 
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  orderManagementText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  threeViewsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  deepRedView: {
    backgroundColor: '#a40000', // Deep red color
    padding: 20,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5, 
    alignItems: 'center',
  },
  viewText: {
    color: 'white',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: 'red',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 30,
    marginHorizontal: 20,
    width:"90%"
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
