import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import api from '../services/api';

const NotificationSettingsScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    emailNotificationEnabled: false,
    notificationEnabled: false,
    weeklyDigest: false,
    marketingEmails: false,
    systemUpdates: false,
    securityAlerts: false,
  });
  const [initialSettings, setInitialSettings] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/me/notifications');
      const settingsData = {
        emailNotificationEnabled: response.data.emailNotificationEnabled || false,
        notificationEnabled: response.data.notificationEnabled || false,
        weeklyDigest: response.data.weeklyDigest || false,
        marketingEmails: response.data.marketingEmails || false,
        systemUpdates: response.data.systemUpdates || false,
        securityAlerts: response.data.securityAlerts || false,
      };
      setSettings(settingsData);
      setInitialSettings(settingsData);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('notifications.fetchError'),
      });
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    if (!initialSettings) return false;
    return (
      settings.emailNotificationEnabled !== initialSettings.emailNotificationEnabled ||
      settings.notificationEnabled !== initialSettings.notificationEnabled ||
      settings.weeklyDigest !== initialSettings.weeklyDigest ||
      settings.marketingEmails !== initialSettings.marketingEmails ||
      settings.systemUpdates !== initialSettings.systemUpdates ||
      settings.securityAlerts !== initialSettings.securityAlerts
    );
  };

  const handleSave = async () => {
    if (!hasChanges()) return;

    try {
      setSaving(true);
      await api.put('/users/me/notifications', settings);
      await new Promise(resolve => setTimeout(resolve, 300)); // 300ms bekle
      navigation.navigate('Profile');
    } catch (error) {
      console.error('Bildirim ayarları güncellenirken hata:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleSetting = (key) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: !prevSettings[key],
    }));
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  const notificationItems = [
    {
      id: 'emailNotificationEnabled',
      title: t('notifications.emailNotifications'),
      description: t('notifications.emailNotificationsDesc'),
      icon: 'mail-outline',
    },
    {
      id: 'notificationEnabled',
      title: t('notifications.pushNotifications'),
      description: t('notifications.pushNotificationsDesc'),
      icon: 'notifications-outline',
    },
    {
      id: 'weeklyDigest',
      title: t('notifications.weeklyDigest'),
      description: t('notifications.weeklyDigestDesc'),
      icon: 'calendar-outline',
    },
    {
      id: 'marketingEmails',
      title: t('notifications.marketingEmails'),
      description: t('notifications.marketingEmailsDesc'),
      icon: 'megaphone-outline',
    },
    {
      id: 'systemUpdates',
      title: t('notifications.systemUpdates'),
      description: t('notifications.systemUpdatesDesc'),
      icon: 'refresh-outline',
    },
    {
      id: 'securityAlerts',
      title: t('notifications.securityAlerts'),
      description: t('notifications.securityAlertsDesc'),
      icon: 'shield-checkmark-outline',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
          </View>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
            disabled={!hasChanges() || saving}
          >
            <Text style={[styles.saveButtonText, (!hasChanges() || saving) && styles.saveButtonDisabled]}>
              {saving ? t('common.loading') : t('common.update')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.settingsSection}>
            {notificationItems.map((item, index) => (
              <View 
                key={item.id} 
                style={[
                  styles.settingItem,
                  index === notificationItems.length - 1 && styles.settingItemLast
                ]}
              >
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingDescription}>{item.description}</Text>
                </View>
                <Switch
                  value={settings[item.id]}
                  onValueChange={() => toggleSetting(item.id)}
                  trackColor={{ false: '#2C2C2E', true: '#30D158' }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#2C2C2E"
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
      <Toast />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  saveButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    color: '#2C2C2E',
  },
  content: {
    flex: 1,
  },
  settingsSection: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    margin: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
});

export default NotificationSettingsScreen; 