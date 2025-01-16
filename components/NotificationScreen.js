import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const NotificationScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: false,
    pushNotifications: false,
    weeklyDigest: false,
    marketingEmails: false,
    systemUpdates: false,
    securityAlerts: false
  });
  const [originalSettings, setOriginalSettings] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      const response = await api.get('/notifications/settings');
      setNotificationSettings(response.data);
      setOriginalSettings(response.data);
      setHasChanges(false);
    } catch (error) {
      console.error('Bildirim ayarları yüklenirken hata:', error);
    }
  };

  const handleNotificationToggle = (type) => {
    const newSettings = { ...notificationSettings };
    newSettings[type] = !notificationSettings[type];
    setNotificationSettings(newSettings);
    
    // Orijinal ayarlarla karşılaştır ve değişiklik varsa butonu aktif et
    const hasAnyChange = Object.keys(newSettings).some(
      key => newSettings[key] !== originalSettings[key]
    );
    setHasChanges(hasAnyChange);
  };

  const handleUpdateSettings = async () => {
    try {
      await api.post('/notifications/settings', notificationSettings);
      setOriginalSettings(notificationSettings);
      setHasChanges(false);
    } catch (error) {
      console.error('Bildirim ayarları güncellenirken hata:', error);
      setNotificationSettings(originalSettings);
      setHasChanges(false);
    }
  };

  const handleResetSettings = () => {
    setNotificationSettings(originalSettings);
    setHasChanges(false);
  };

  const renderNotificationItem = (type, title, description) => (
    <TouchableOpacity
      key={type}
      style={styles.notificationItem}
      onPress={() => handleNotificationToggle(type)}
    >
      <View style={styles.iconContainer}>
        <Ionicons 
          name={getIconName(type)} 
          size={24} 
          color="#666"
        />
      </View>
      <View style={styles.notificationInfo}>
        <Text style={styles.notificationTitle}>{title}</Text>
      </View>
      <View style={[
        styles.toggle,
        notificationSettings[type] && styles.toggleActive
      ]} />
    </TouchableOpacity>
  );

  const getIconName = (type) => {
    switch (type) {
      case 'emailNotifications': return 'mail-outline';
      case 'pushNotifications': return 'phone-portrait-outline';
      case 'weeklyDigest': return 'calendar-outline';
      case 'marketingEmails': return 'megaphone-outline';
      case 'systemUpdates': return 'refresh-outline';
      case 'securityAlerts': return 'shield-checkmark-outline';
      default: return 'notifications-outline';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (hasChanges) {
              handleResetSettings();
            }
            navigation.goBack();
          }}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notifications.settings')}</Text>
      </View>

      <View style={styles.settingsContainer}>
        {renderNotificationItem(
          'emailNotifications',
          t('notifications.emailTitle'),
          t('notifications.emailDescription')
        )}
        {renderNotificationItem(
          'pushNotifications',
          t('notifications.pushTitle'),
          t('notifications.pushDescription')
        )}
        {renderNotificationItem(
          'weeklyDigest',
          t('notifications.weeklyTitle'),
          t('notifications.weeklyDescription')
        )}
        {renderNotificationItem(
          'marketingEmails',
          t('notifications.marketingTitle'),
          t('notifications.marketingDescription')
        )}
        {renderNotificationItem(
          'systemUpdates',
          t('notifications.systemTitle'),
          t('notifications.systemDescription')
        )}
        {renderNotificationItem(
          'securityAlerts',
          t('notifications.securityTitle'),
          t('notifications.securityDescription')
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.updateButton,
          !hasChanges && styles.disabledButton
        ]}
        onPress={handleUpdateSettings}
        disabled={!hasChanges}
      >
        <Text style={[
          styles.updateButtonText,
          !hasChanges && styles.disabledButtonText
        ]}>
          {t('notifications.updateSettings')}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  settingsContainer: {
    flex: 1,
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
    marginRight: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  toggle: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    backgroundColor: '#e9e9ea',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#007AFF',
  },
  updateButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  disabledButtonText: {
    color: '#666',
  },
});

export default NotificationScreen; 