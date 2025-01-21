import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const languages = [
  { id: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { id: 'en', name: 'English', flag: '🇬🇧' },
];

const LanguageSettingsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  useEffect(() => {
    loadCurrentLanguage();
  }, []);

  const loadCurrentLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('@app_language');
      setSelectedLanguage(savedLanguage || 'tr');
    } catch (error) {
      console.error('Dil bilgisi yüklenirken hata:', error);
      setSelectedLanguage('tr');
    }
  };

  const handleLanguageSelect = async (langId) => {
    if (selectedLanguage === langId) return;

    try {
      // AsyncStorage'a kaydet
      await AsyncStorage.setItem('@app_language', langId);
      
      // i18n dilini değiştir
      await i18n.changeLanguage(langId);
      
      // API'ye kaydet
      try {
        await api.put('/users/me', {
          language: langId
        });
      } catch (error) {
        console.error('API güncelleme hatası:', error);
      }

      setSelectedLanguage(langId);
      navigation.goBack();
      
    } catch (error) {
      console.error('Dil güncellenirken hata:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('settings.language')}</Text>
        </View>

        <View style={styles.content}>
          {languages.map((language, index) => (
            <TouchableOpacity
              key={language.id}
              style={[
                styles.languageItem,
                index === languages.length - 1 && styles.languageItemLast
              ]}
              onPress={() => handleLanguageSelect(language.id)}
            >
              <View style={styles.languageInfo}>
                <Text style={styles.languageFlag}>{language.flag}</Text>
                <Text style={styles.languageName}>{language.name}</Text>
              </View>
              {selectedLanguage === language.id && (
                <Ionicons name="checkmark" size={24} color="#007AFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    marginTop: 20,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginHorizontal: 16,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  languageItemLast: {
    borderBottomWidth: 0,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageFlag: {
    fontSize: 22,
    marginRight: 12,
  },
  languageName: {
    fontSize: 17,
    color: '#FFFFFF',
  },
});

export default LanguageSettingsScreen; 