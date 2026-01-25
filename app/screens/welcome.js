import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';


export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>HealUP!</Text>
      <Text style={styles.title}>Welcome Back!</Text>
      <View style={styles.buttonContainer}>
        <Button title="LOG-IN" onPress={() => navigation.navigate('Login')} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="SIGN-UP" onPress={() => navigation.navigate('SignUp')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgb(69,93,117)' },
  logo: { fontSize: 32, fontWeight: 'bold', color: 'rgb(77 , 156, 252)', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color:"rgb(255, 255, 255)" },
  buttonContainer: { width: '80%', marginVertical: 10 }
});