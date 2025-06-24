import React, { useState } from 'react';
import { View, Text,TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Image, ScrollView, KeyboardAvoidingView, SafeAreaView, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import {Picker} from '@react-native-picker/picker';
import { signUp } from '../services/api';


const InputField = ({ iconName, placeholder, secureTextEntry, value, onChangeText, keyboardType }) => {

  return (
    <View style={styles.inputContainer}>
      <FontAwesome name={iconName} size={20} color="#B07A7A" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#B07A7A"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [role,setRole] = useState("customer")
  const navigation = useNavigation()  

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }
    
    try {
        setLoading(true);
        const response = await signUp(name, email, phone, password,role);
        
        console.log("Signup Response:", response); 
        if (response.success) { 
          Alert.alert("User created successfully");
          navigation.navigate("verify", { email }); 
        } else {
          Alert.alert(response.error || "Account creation failed");
        }
      } catch (error) {
        console.error("Signup Error:", error);
        Alert.alert("Something went wrong, please try again.");
      } finally {
        setLoading(false);
      }
    };
    const handleRoleChange = (roleValue)=>{
      setRole(roleValue)
    }
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <FontAwesome name="arrow-left" size={30} color="#D32F2F" />
          </TouchableOpacity>
          <Image source={require('../assets/images/coolchop.png')} style={styles.logo} />
          <Text style={styles.title}>Sign Up</Text>
          <Text style={styles.subTitle}>Please sign up to get started 😊</Text>

          <InputField iconName="user" placeholder="Name" value={name} onChangeText={setName} />
          <InputField iconName="envelope" placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <InputField iconName="phone" placeholder="Phone" keyboardType="numeric" value={phone} onChangeText={setPhone} />
          <InputField iconName="lock" placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
          <InputField iconName="lock" placeholder="Re-type Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
          <View style={styles.inputContainer}>
         <FontAwesome name="user" size={20} color="#B07A7A" style={styles.icon} />
           <Picker
          selectedValue={role}
          onValueChange={(itemValue) => setRole(itemValue)}
          style={{ flex: 1, color: '#000' }}
          dropdownIconColor="#B07A7A"
        >
        <Picker.Item label="Rider" value="rider" />
        <Picker.Item label="Customer" value="customer" />
        </Picker>
</View>

          

          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            {loading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.buttonText}>Sign Up</Text>}
          </TouchableOpacity>

          <Text style={styles.footerText}>By continuing with an account located in Ghana, you agree to our <Text style={styles.linkText}>Terms of Service</Text> and acknowledge that you have read our <Text style={styles.linkText}>Privacy Policy</Text>.</Text>
          <Text style={{ marginTop: 20, marginBottom: 30 }}>
            Already have an account?{' '}
            <TouchableOpacity onPress={() => navigation.navigate("login")}>
            <Text style={{ color:'#D32F2F' }}>Login</Text>
            </TouchableOpacity>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
       

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  backButton: { alignSelf: 'flex-start', marginBottom: 20, marginTop: 20 },
  logo: { width: 180, height: 180, marginBottom: 5 },
  title: { fontSize: 24, color: '#D32F2F', fontWeight: 'bold', marginBottom: 10 },
  subTitle: { fontSize: 16, marginBottom: 30 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#FAD4D4', borderRadius: 10, marginBottom: 20, padding: 10, backgroundColor: '#FAD4D4' },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#000' },
  signUpButton: { width: '100%', backgroundColor: '#D32F2F', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18 },
  footerText: { marginTop: 20, textAlign: 'center', color: '#7B7B7B' },
  linkText: { color: '#D32F2F', textDecorationLine: 'underline' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: 300, padding: 20, backgroundColor: '#FFF', borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  picker: {
      width: '100%',
      marginBottom: 20,
      backgroundColor: '#FAD4D4',
      color: '#000',
      borderRadius: 10,
      padding: 10,
    }
});
