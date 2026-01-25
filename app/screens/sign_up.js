import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';

export default function SignUpScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      
      <View style={styles.container}>
        <Text style={styles.title}>CREATE YOUR ACCOUNT</Text>

        
        <Text style={styles.label}>Full Name</Text>
        <TextInput placeholder="Enter your full name" style={styles.input} />

        <Text style={styles.label}>Username</Text>
        <TextInput placeholder="Choose a username" style={styles.input} />

        <Text style={styles.label}>Email</Text>
        <TextInput 
          placeholder="example@email.com" 
          style={styles.input} 
          keyboardType="email-address" // Shows the @ symbol on keyboard
        />

        <Text style={styles.label}>Password</Text>
        <TextInput 
          placeholder="Create a password" 
          style={styles.input} 
          secureTextEntry={true} 
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput 
          placeholder="Retype password" 
          style={styles.input} 
          secureTextEntry={true} 
        />

        <View style={styles.buttonContainer}>
          <Button 
            title="Sign-Up" 
            onPress={() => alert('Account Created!')} 
          />
        </View>

        
        <View style={styles.linkContainer}>
          <Button 
            title="Back to Login" 
            color="#666"
            onPress={() => navigation.goBack()} 
          />
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'rgb(77 , 156, 252)', 
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: 'rgb(77 , 156, 252)',
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: 'rgb(204, 204, 204)',
    marginBottom: 20,
    fontSize: 16,
    paddingHorizontal: 5,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  linkContainer: {
    marginTop: 10,
    alignItems: 'center',
  }
});