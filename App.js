import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import Toast from 'react-native-toast-message';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import HomeScreen from './components/HomeScreen';
import AddCategoryScreen from './components/AddCategoryScreen';

const Stack = createNativeStackNavigator();
const TOKEN_KEY = '@flashcard_token';

export default function App() {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkInitialToken();
  }, []);

  const checkInitialToken = async () => {
    try {
      console.log('Token kontrol ediliyor...');
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        console.log('Token bulundu, ana ekrana yönlendiriliyor');
        setToken(storedToken);
      } else {
        console.log('Token bulunamadı, giriş ekranına yönlendiriliyor');
        setToken(null);
      }
    } catch (error) {
      console.error('Token kontrol hatası:', error);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = async (newToken) => {
    try {
      console.log('Giriş başarılı, token kaydediliyor');
      await AsyncStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
    } catch (error) {
      console.error('Token kaydetme hatası:', error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Çıkış yapılıyor...');
      await AsyncStorage.removeItem(TOKEN_KEY);
      setToken(null);
    } catch (error) {
      console.error('Çıkış hatası:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!token ? (
            // Auth Stack
            <>
              <Stack.Screen 
                name="Login" 
                component={LoginScreen}
                initialParams={{ onLoginSuccess: handleLoginSuccess }}
              />
              <Stack.Screen 
                name="Register" 
                component={RegisterScreen}
                initialParams={{ onRegisterSuccess: handleLoginSuccess }}
              />
              <Stack.Screen 
                name="ForgotPassword" 
                component={ForgotPasswordScreen}
              />
            </>
          ) : (
            // App Stack
            <>
              <Stack.Screen 
                name="Home" 
                component={HomeScreen}
                initialParams={{ onLogout: handleLogout }}
              />
              <Stack.Screen 
                name="AddCategory" 
                component={AddCategoryScreen} 
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </>
  );
} 