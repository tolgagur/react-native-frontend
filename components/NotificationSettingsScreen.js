import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { components } from '../src/theme/components';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationSettingsScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    emailNotificationEnabled: false,
    notificationEnabled: false,
    weeklyDigest: false,
    marketingEmails: false,
    systemUpdates: false,
    securityAlerts: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      const response = await api.get('users/me/notifications');
      setSettings({
        emailNotificationEnabled: response.data.emailNotifications || false,
        notificationEnabled: response.data.pushNotifications || false,
        weeklyDigest: response.data.weeklyDigest || false,
        marketingEmails: response.data.marketingEmails || false,
        systemUpdates: response.data.systemUpdates || false,
        securityAlerts: response.data.securityAlerts || false,
      });
    } catch (error) {
      console.error('Bildirim ayarları yüklenirken hata:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('notifications.loadError'),
        visibilityTime: 3000,
        position: 'top',
      });
    }
  };

  const toggleSwitch = (key) => {
    if (isLoading) return;
    
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: !prevSettings[key]
    }));
  };

  const updateSettings = async () => {
    setIsLoading(true);
    try {
      const updateResponse = await api.put('users/me/notifications', {
        emailNotifications: settings.emailNotificationEnabled,
        pushNotifications: settings.notificationEnabled,
        weeklyDigest: settings.weeklyDigest,
        marketingEmails: settings.marketingEmails,
        systemUpdates: settings.systemUpdates,
        securityAlerts: settings.securityAlerts
      });

      if (updateResponse.data) {
        const updatedSettings = {
          emailNotificationEnabled: updateResponse.data.emailNotifications,
          notificationEnabled: updateResponse.data.pushNotifications,
          weeklyDigest: updateResponse.data.weeklyDigest,
          marketingEmails: updateResponse.data.marketingEmails,
          systemUpdates: updateResponse.data.systemUpdates,
          securityAlerts: updateResponse.data.securityAlerts
        };
        
        setSettings(updatedSettings);
      }
    } catch (error) {
      console.error('Ayarlar güncellenirken hata:', error.response?.data || error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.response?.data?.message || t('notifications.updateError'),
        visibilityTime: 3000,
        position: 'top',
      });
      
      fetchNotificationSettings();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: 'Çıkış yapılırken bir hata oluştu',
        visibilityTime: 3000,
        position: 'top',
      });
    }
  };

  const notificationItems = [
    {
      id: 'emailNotificationEnabled',
      title: t('notifications.emailNotifications'),
      icon: 'mail-outline',
      description: t('notifications.emailNotificationsDesc'),
    },
    {
      id: 'notificationEnabled',
      title: t('notifications.pushNotifications'),
      icon: 'phone-portrait-outline',
      description: t('notifications.pushNotificationsDesc'),
    },
    {
      id: 'weeklyDigest',
      title: t('notifications.weeklyDigest'),
      icon: 'calendar-outline',
      description: t('notifications.weeklyDigestDesc'),
    },
    {
      id: 'marketingEmails',
      title: t('notifications.marketingEmails'),
      icon: 'megaphone-outline',
      description: t('notifications.marketingEmailsDesc'),
    },
    {
      id: 'systemUpdates',
      title: t('notifications.systemUpdates'),
      icon: 'refresh-outline',
      description: t('notifications.systemUpdatesDesc'),
    },
    {
      id: 'securityAlerts',
      title: t('notifications.securityAlerts'),
      icon: 'shield-checkmark-outline',
      description: t('notifications.securityAlertsDesc'),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {notificationItems.map((item) => (
            <View key={item.id} style={styles.notificationItem}>
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon} size={24} color="#2C2C2C" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
              <Switch
                trackColor={components.switch.track}
                thumbColor={settings[item.id] ? components.switch.thumb.true : components.switch.thumb.false}
                ios_backgroundColor={components.switch.ios_background}
                onValueChange={() => toggleSwitch(item.id)}
                value={settings[item.id]}
                disabled={isLoading}
                style={[
                  components.switch.style,
                  { transform: components.switch.transform }
                ]}
              />
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.updateButton,
              isLoading && styles.updateButtonDisabled
            ]}
            onPress={updateSettings}
            disabled={isLoading}
          >
            <Text style={styles.updateButtonText}>
              {isLoading ? t('common.loading') : t('common.update')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingTop: 15,
    gap: 20,
  },
  backButton: {
    padding: 4,
    width: 30,
  },
  headerTitle: {
    ...components.text.header
  },
  content: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 16,
    backgroundColor: '#fff',
  },
  updateButton: {
    backgroundColor: '#000',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsItemText: {
    fontSize: 16,
    marginLeft: 15,
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  logoutText: {
    color: '#000',
    marginBottom: 8,
  },
  versionText: {
    color: '#666',
    fontSize: 12,
  },
});

export default NotificationSettingsScreen; 