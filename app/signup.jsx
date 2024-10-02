// components/Signup.js
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';

const SignupScreen = () => {
    return (
        <View style={styles.container}>
  
            <Text style={styles.brandName}>CoolChop</Text>

            <TextInput
                style={styles.numberInput}
                placeholder="Phone Number"
                keyboardType="numeric"
                required
            />
            <TextInput
                style={styles.input}
                placeholder="First Name"
                required
            />
            <TextInput
                style={styles.input}
                placeholder="Last Name"
                required
            />
            <Text style={styles.loginLink}>
                Already have an account?{' '}
                <Text style={styles.link} onPress={() => console.log('Navigate to login')}>
                    Login here
                </Text>
            </Text>
            <TouchableOpacity style={styles.signupButton}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f0f0f0',
    },
    logo: {
        width: 100, // Adjust as needed
        height: 100, // Adjust as needed
        marginBottom: 10,
    },
    brandName: {
        fontSize: 24,
        color: '#333',
        marginBottom: 20,
    },
    numberInput: {
        backgroundColor: '#ffcccc', // Light red background
        borderWidth: 1,
        borderColor: '#ff9999',
        borderRadius: 4,
        padding: 10,
        width: '100%',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        width: '100%',
        marginBottom: 10,
    },
    loginLink: {
        marginBottom: 10,
    },
    link: {
        color: '#007BFF',
        textDecorationLine: 'underline',
    },
    signupButton: {
        backgroundColor: 'red',
        borderRadius: 4,
        padding: 10,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default SignupScreen;
