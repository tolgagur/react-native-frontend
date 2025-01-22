import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import api, { authService } from '../services/api';
import LanguageModal from './LanguageModal';

const languages = [
  { id: 'TURKISH', name: 'Türkçe', icon: '🇹🇷' },
  { id: 'ENGLISH', name: 'English', icon: '🇬🇧' }
];

const ProfileScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user?.language) {
      setSelectedLanguage(user.language);
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/me');
      setUser(response.data);
      if (response.data.preferredLanguage) {
        setSelectedLanguage(response.data.preferredLanguage);
        const lang = languages.find(l => l.id === response.data.preferredLanguage);
        if (lang) {
          await i18n.changeLanguage(lang.id === 'TURKISH' ? 'tr' : 'en');
        }
      }
      setError(null);
    } catch (err) {
      console.error('Kullanıcı bilgileri yüklenirken hata:', err.response?.data || err.message);
      setError('Kullanıcı bilgileri alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageSelect = async (langId) => {
    if (langId === selectedLanguage) {
      setIsLanguageModalVisible(false);
      return;
    }

    const previousLanguage = selectedLanguage;
    
    try {
      const i18nCode = langId === 'TURKISH' ? 'tr' : 'en';
      await i18n.changeLanguage(i18nCode);
      
      const updateResponse = await api.put(`/users/me/language?language=${langId}`);
      console.log('Dil güncelleme yanıtı:', updateResponse.data);
      
      const userResponse = await api.get('/users/me');
      setUser(userResponse.data);
      setSelectedLanguage(langId);
      setIsLanguageModalVisible(false);
    } catch (error) {
      console.error('Dil değiştirme hatası:', error);
      setSelectedLanguage(previousLanguage);
      const i18nCode = previousLanguage === 'TURKISH' ? 'tr' : 'en';
      await i18n.changeLanguage(i18nCode);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('profile.languageUpdateError'),
        visibilityTime: 3000,
        position: 'top',
      });
    }
  };

  const menuItems = [
    {
      id: 'personal',
      title: t('profile.personalInfo'),
      icon: 'person-outline',
      onPress: () => navigation.navigate('PersonalInfo')
    },
    {
      id: 'notifications',
      title: t('profile.notificationSettings'),
      icon: 'notifications-outline',
      onPress: () => navigation.navigate('NotificationSettings')
    },
    {
      id: 'language',
      title: t('profile.languageSettings'),
      icon: 'language-outline',
      onPress: () => setIsLanguageModalVisible(true),
      value: i18n.language === 'tr' ? 'Türkçe' : 'English'
    },
    {
      id: 'password',
      title: t('profile.changePassword'),
      icon: 'lock-closed-outline',
      onPress: () => navigation.navigate('ChangePassword')
    }
  ];

  const handleLogout = async () => {
    try {
      console.log('Çıkış işlemi başlatılıyor...');
      await authService.logout();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('profile.logoutError'),
        visibilityTime: 3000,
        position: 'top',
      });
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{t('profile.fetchError')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserData}>
          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{t('profile.title')}</Text>
      
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{user?.username?.[0].toUpperCase() || '?'}</Text>
        </View>
        <Text style={styles.email}>{user?.email || t('profile.guestUser')}</Text>
      </View>

      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === 0 && styles.firstMenuItem,
                index === menuItems.length - 1 && styles.lastMenuItem,
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Icon name={item.icon} size={22} color="#666" />
                </View>
                <Text style={styles.menuText}>{item.title}</Text>
              </View>
              <View style={styles.menuItemRight}>
                {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
                <Icon name="chevron-forward" size={20} color="#666" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>{t('common.logout')}</Text>
      </TouchableOpacity>

      <Text style={styles.version}>SÜRÜM 0.0.1</Text>

      <LanguageModal
        visible={isLanguageModalVisible}
        onClose={() => setIsLanguageModalVisible(false)}
        currentLanguage={i18n.language}
        onLanguageSelect={handleLanguageSelect}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#1C1C1E',
    padding: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  email: {
    color: '#999',
    fontSize: 16,
  },
  settingsContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 34,
    color: '#fff',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  menuContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  firstMenuItem: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    color: '#fff',
    fontSize: 17,
  },
  menuValue: {
    color: '#666',
    marginRight: 8,
    fontSize: 17,
  },
  logoutButton: {
    backgroundColor: '#1C1C1E',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 17,
    fontWeight: '400',
  },
  version: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 15,
  },
  retryButton: {
    padding: 10,
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ProfileScreen; 