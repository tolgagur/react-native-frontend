import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../src/utils/language';

const SettingsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = async (language) => {
    const success = await changeLanguage(language);
    if (success) {
      // Dil değişikliği başarılı olduğunda ekranı yenile
      navigation.replace('Settings');
    }
  };

  const settings = [
    {
      title: t('profile.personalInfo'),
      icon: 'person-outline',
      onPress: () => navigation.navigate('PersonalInfo'),
    },
    {
      title: t('profile.notificationSettings'),
      icon: 'notifications-outline',
      onPress: () => navigation.navigate('NotificationSettings'),
    },
    {
      title: t('profile.languageSettings'),
      icon: 'language-outline',
      onPress: null,
      isLanguageSelector: true,
    },
    {
      title: t('profile.changePassword'),
      icon: 'lock-closed-outline',
      onPress: () => navigation.navigate('ChangePassword'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('profile.settings')}</Text>
      </View>

      <View style={styles.settingsList}>
        {settings.map((setting, index) => (
          <View key={index}>
            {setting.isLanguageSelector ? (
              <View style={styles.languageSection}>
                <View style={styles.settingHeader}>
                  <Ionicons name={setting.icon} size={24} color="#8E8E93" />
                  <Text style={styles.settingTitle}>{setting.title}</Text>
                </View>
                <View style={styles.languageButtons}>
                  <TouchableOpacity
                    style={[
                      styles.languageButton,
                      i18n.language === 'tr' && styles.activeLanguage
                    ]}
                    onPress={() => handleLanguageChange('tr')}
                  >
                    <Text style={[
                      styles.languageButtonText,
                      i18n.language === 'tr' && styles.activeLanguageText
                    ]}>
                      {t('languages.turkish')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.languageButton,
                      i18n.language === 'en' && styles.activeLanguage
                    ]}
                    onPress={() => handleLanguageChange('en')}
                  >
                    <Text style={[
                      styles.languageButtonText,
                      i18n.language === 'en' && styles.activeLanguageText
                    ]}>
                      {t('languages.english')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.settingItem}
                onPress={setting.onPress}
              >
                <View style={styles.settingContent}>
                  <Ionicons name={setting.icon} size={24} color="#8E8E93" />
                  <Text style={styles.settingTitle}>{setting.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#8E8E93" />
              </TouchableOpacity>
            )}
            {index < settings.length - 1 && <View style={styles.separator} />}
          </View>
        ))}
      </View>
    </ScrollView>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingsList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    marginBottom: 8,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    marginLeft: 12,
    color: '#FFFFFF',
  },
  separator: {
    height: 1,
    backgroundColor: '#2C2C2E',
  },
  languageSection: {
    paddingVertical: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    marginBottom: 8,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  languageButtons: {
    flexDirection: 'row',
    marginLeft: 36,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2C2C2E',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  activeLanguage: {
    backgroundColor: '#8E8E93',
    borderColor: '#8E8E93',
  },
  languageButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  activeLanguageText: {
    color: '#FFFFFF',
  },
});

export default SettingsScreen; 