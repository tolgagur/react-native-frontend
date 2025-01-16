import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import Toast from 'react-native-toast-message';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import HomeScreen from './components/HomeScreen';
import AddCategoryScreen from './components/AddCategoryScreen';
import AddStudySetScreen from './components/AddStudySetScreen';
import AddFlashcardScreen from './components/AddFlashcardScreen';
import ProfileScreen from './components/ProfileScreen';
import NotificationSettingsScreen from './components/NotificationSettingsScreen';
import SettingsScreen from './components/SettingsScreen';
import './src/i18n';

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
      const [storedToken, storedRefreshToken] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem('@flashcard_refresh_token')
      ]);

      console.log('Stored tokens:', { token: storedToken, refreshToken: storedRefreshToken });

      if (storedToken && storedRefreshToken) {
        console.log('Token ve refresh token bulundu, ana ekrana yönlendiriliyor');
        setToken(storedToken);
      } else {
        console.log('Token veya refresh token bulunamadı, giriş ekranına yönlendiriliyor');
        setToken(null);
      }
    } catch (error) {
      console.error('Token kontrol hatası:', error);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = async (newToken, refreshToken) => {
    try {
      console.log('Giriş başarılı, tokenlar kaydediliyor');
      await AsyncStorage.setItem(TOKEN_KEY, newToken);
      if (refreshToken) {
        await AsyncStorage.setItem('@flashcard_refresh_token', refreshToken);
      }
      setToken(newToken);
    } catch (error) {
      console.error('Token kaydetme hatası:', error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Çıkış yapılıyor...');
      await AsyncStorage.multiRemove([TOKEN_KEY, '@flashcard_refresh_token']);
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!token ? (
              // Auth screens
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
              // App screens
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
                <Stack.Screen 
                  name="AddStudySet" 
                  component={AddStudySetScreen}
                />
                <Stack.Screen 
                  name="AddFlashcard" 
                  component={AddFlashcardScreen}
                />
                <Stack.Screen 
                  name="Profile" 
                  component={ProfileScreen}
                  initialParams={{ onLogout: handleLogout }}
                />
                <Stack.Screen 
                  name="NotificationSettings" 
                  component={NotificationSettingsScreen}
                />
                <Stack.Screen 
                  name="Settings" 
                  component={SettingsScreen}
                />
              </>
            )}
          </Stack.Navigator>
          <Toast />
        </NavigationContainer>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
} 