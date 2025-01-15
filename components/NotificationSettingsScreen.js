import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import Toast from 'react-native-toast-message';

const NotificationSettingsScreen = ({ navigation }) => {
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
        text1: 'Hata',
        text2: 'Bildirim ayarları yüklenemedi',
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

        Toast.show({
          type: 'success',
          text1: 'Başarılı',
          text2: 'Bildirim ayarları güncellendi',
          visibilityTime: 2000,
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Ayarlar güncellenirken hata:', error.response?.data || error);
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: error.response?.data?.message || 'Ayarlar güncellenemedi',
        visibilityTime: 3000,
        position: 'top',
      });
      
      fetchNotificationSettings();
    } finally {
      setIsLoading(false);
    }
  };

  const notificationItems = [
    {
      id: 'emailNotificationEnabled',
      title: 'E-posta Bildirimleri',
      icon: 'mail-outline',
      description: 'Önemli güncellemeler ve bildirimler için e-posta al',
    },
    {
      id: 'notificationEnabled',
      title: 'Mobil Bildirimler',
      icon: 'phone-portrait-outline',
      description: 'Anlık bildirimler ve uyarılar',
    },
    {
      id: 'weeklyDigest',
      title: 'Haftalık Özet',
      icon: 'calendar-outline',
      description: 'Haftalık ilerleme ve aktivite özeti',
    },
    {
      id: 'marketingEmails',
      title: 'Pazarlama E-postaları',
      icon: 'megaphone-outline',
      description: 'Özel teklifler ve kampanyalar hakkında bilgi al',
    },
    {
      id: 'systemUpdates',
      title: 'Sistem Güncellemeleri',
      icon: 'refresh-outline',
      description: 'Yeni özellikler ve sistem güncellemeleri',
    },
    {
      id: 'securityAlerts',
      title: 'Güvenlik Uyarıları',
      icon: 'shield-checkmark-outline',
      description: 'Hesap güvenliği ile ilgili önemli bildirimler',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#2C2C2C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bildirim Ayarları</Text>
        </View>

        <ScrollView style={styles.content}>
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
                trackColor={{ false: '#E0E0E0', true: '#A7C8FF' }}
                thumbColor={settings[item.id] ? '#007AFF' : '#F4F4F4'}
                ios_backgroundColor="#E0E0E0"
                onValueChange={() => toggleSwitch(item.id)}
                value={settings[item.id]}
                disabled={isLoading}
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
              {isLoading ? 'Güncelleniyor...' : 'Güncelle'}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  content: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666666',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
  updateButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButtonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotificationSettingsScreen; 