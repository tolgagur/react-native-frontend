import './src/i18n';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, Platform, NativeModules } from 'react-native';
import Toast from 'react-native-toast-message';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import HomeScreen from './components/HomeScreen';
import AddCategoryScreen from './components/AddCategoryScreen';
import AddStudySetScreen from './components/AddStudySetScreen';
import AddFlashcardScreen from './components/AddFlashcardScreen';
import AddCardScreen from './components/AddCardScreen';
import ProfileScreen from './components/ProfileScreen';
import NotificationSettingsScreen from './components/NotificationSettingsScreen';
import SettingsScreen from './components/SettingsScreen';
import CategoryScreen from './components/CategoryScreen';
import StudySetScreen from './components/StudySetScreen';
import PersonalInfoScreen from './components/PersonalInfoScreen';
import ChangePasswordScreen from './components/ChangePasswordScreen';
import StudySetDetailScreen from './components/StudySetDetailScreen';
import LanguageSettingsScreen from './components/LanguageSettingsScreen';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

const Stack = createNativeStackNavigator();
const TOKEN_KEY = '@flashcard_token';

// Desteklenen diller
const SUPPORTED_LANGUAGES = ['tr', 'en'];

export default function App() {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { i18n } = useTranslation();

  useEffect(() => {
    checkInitialToken();
    setupDefaultLanguage();
  }, []);

  const getDeviceLanguage = () => {
    try {
      // Expo'da doğrudan Platform.OS'i kontrol ediyoruz
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        // Locale'i al
        const locale = Platform.select({
          ios: NativeModules.SettingsManager?.settings?.AppleLocale,
          android: NativeModules.I18nManager?.localeIdentifier,
        });

        // Eğer locale alınamazsa varsayılan dili döndür
        if (!locale) {
          console.log('Locale alınamadı, varsayılan dil kullanılıyor');
          return 'en';
        }

        // Locale'den dil kodunu çıkar
        const languageCode = locale.split(/[-_]/)[0].toLowerCase();
        console.log('Tespit edilen dil kodu:', languageCode);
        return languageCode;
      }
    } catch (error) {
      console.log('Dil tespiti sırasında hata:', error);
    }

    // Hata durumunda veya desteklenmeyen platform için varsayılan dil
    return 'en';
  };

  const setupDefaultLanguage = async () => {
    try {
      console.log('Varsayılan dil ayarlanıyor...');
      
      // Daha önce seçilmiş bir dil var mı kontrol et
      const savedLanguage = await AsyncStorage.getItem('@app_language');
      console.log('Kaydedilmiş dil:', savedLanguage);
      
      if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
        console.log('Kaydedilmiş dil kullanılıyor:', savedLanguage);
        await i18n.changeLanguage(savedLanguage);
        return;
      }

      // Sistem dilini al
      const deviceLang = getDeviceLanguage();
      console.log('Cihaz dili:', deviceLang);

      // Sistem dili desteklenen diller arasında mı kontrol et
      const languageToUse = SUPPORTED_LANGUAGES.includes(deviceLang) ? deviceLang : 'en';
      console.log('Kullanılacak dil:', languageToUse);

      // Dili ayarla ve kaydet
      await i18n.changeLanguage(languageToUse);
      await AsyncStorage.setItem('@app_language', languageToUse);
      
    } catch (error) {
      console.error('Dil ayarlama hatası:', error);
      // Hata durumunda varsayılan olarak İngilizce'yi ayarla
      try {
        await i18n.changeLanguage('en');
        await AsyncStorage.setItem('@app_language', 'en');
      } catch (innerError) {
        console.error('Varsayılan dil ayarlama hatası:', innerError);
      }
    }
  };

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
    <ActionSheetProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
                fullScreenGestureEnabled: true,
                gestureResponseDistance: 'horizontal',
              }}
            >
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
                    name="AddCard" 
                    component={AddCardScreen}
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
                  <Stack.Screen 
                    name="Category" 
                    component={CategoryScreen}
                  />
                  <Stack.Screen 
                    name="StudySet" 
                    component={StudySetScreen}
                  />
                  <Stack.Screen 
                    name="StudySetDetail" 
                    component={StudySetDetailScreen}
                  />
                  <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
                  <Stack.Screen 
                    name="LanguageSettings" 
                    component={LanguageSettingsScreen}
                    options={{ headerShown: false }}
                  />
                </>
              )}
            </Stack.Navigator>
            <Toast />
          </NavigationContainer>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ActionSheetProvider>
  );
} 