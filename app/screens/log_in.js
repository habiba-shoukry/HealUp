import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function LoginScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SIGN-IN</Text>
      <TextInput placeholder="Username" style={styles.input} />
      <TextInput placeholder="Password" style={styles.input} secureTextEntry={true} />
      <Button title="Log-In" onPress={() => alert('Log in logic!')} />
      
      <View style={{ marginTop: 20 }}>
        <Text>Don't have an account?</Text>
        <Button title="Sign-up" onPress={() => navigation.navigate('SignUp')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', height: 50, borderBottomWidth: 1, marginBottom: 20, fontSize: 16 }
});