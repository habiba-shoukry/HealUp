import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// import the screens here
import WelcomeScreen from './app/screens/welcome';
import LoginScreen from './app/screens/log_in';
import SignUpScreen from './app/screens/sign_up';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen} 
          options={{ headerShown: false }} 
        />
        
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }} 
        />
        
        <Stack.Screen 
          name="SignUp" 
          component={SignUpScreen} 
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }} 
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}