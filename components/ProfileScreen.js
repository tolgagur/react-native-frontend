import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import api, { TOKEN_KEY, REFRESH_TOKEN_KEY, authService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const languages = [
  { id: 'TURKISH', name: 'Türkçe', icon: '🇹🇷', i18nCode: 'tr' },
  { id: 'ENGLISH', name: 'English', icon: '🇬🇧', i18nCode: 'en' },
];

const ProfileScreen = ({ navigation, route }) => {
  const { onLogout } = route.params;
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [changingLanguage, setChangingLanguage] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  // Bottom Sheet
  const bottomSheetModalRef = useRef(null);
  const snapPoints = useMemo(() => ['35%'], []);

  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  useEffect(() => {
    fetchUserData();
  }, []);

  // Kullanıcı bilgileri değiştiğinde dil seçimini güncelle
  useEffect(() => {
    if (user?.language) {
      setSelectedLanguage(user.language);
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/me');
      console.log('Kullanıcı bilgileri detaylı:', {
        tümVeri: response.data,
        dil: response.data.preferredLanguage,
        seçiliDil: selectedLanguage
      });
      setUser(response.data);
      if (response.data.preferredLanguage) {
        setSelectedLanguage(response.data.preferredLanguage);
        // i18n dilini de güncelle
        const lang = languages.find(l => l.id === response.data.preferredLanguage);
        if (lang) {
          await i18n.changeLanguage(lang.i18nCode);
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
      bottomSheetModalRef.current?.dismiss();
      return;
    }

    const previousLanguage = selectedLanguage;
    const selectedLang = languages.find(l => l.id === langId);
    
    try {
      setChangingLanguage(true);
      setSelectedLanguage(langId);
      
      // i18n dilini güncelle
      await i18n.changeLanguage(selectedLang.i18nCode);
      
      const updateResponse = await api.put(`/users/me/language?language=${langId}`);
      console.log('Dil güncelleme yanıtı:', updateResponse.data);
      
      const userResponse = await api.get('/users/me');
      console.log('Güncel kullanıcı bilgileri:', userResponse.data);
      
      setUser(userResponse.data);

      setTimeout(() => {
        bottomSheetModalRef.current?.dismiss();
      }, 300);
    } catch (error) {
      console.error('Dil değiştirme hatası:', error);
      setSelectedLanguage(previousLanguage);
      const prevLang = languages.find(l => l.id === previousLanguage);
      if (prevLang) {
        await i18n.changeLanguage(prevLang.i18nCode);
      }
    } finally {
      setChangingLanguage(false);
    }
  };

  const initial = user?.username ? user.username.charAt(0).toUpperCase() : '?';

  const handleProfilePress = () => {
    navigation.navigate('EditProfile', { user });
  };

  const handleSettingsPress = (settingType) => {
    switch (settingType) {
      case 'personal':
        navigation.navigate('PersonalInfo', { user });
        break;
      case 'notifications':
        navigation.navigate('NotificationSettings');
        break;
      case 'language':
        bottomSheetModalRef.current?.present();
        break;
      case 'password':
        navigation.navigate('ChangePassword');
        break;
      default:
        break;
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Çıkış işlemi başlatılıyor...');
      await authService.logout();
      
      if (onLogout) {
        console.log('onLogout callback çağrılıyor...');
        onLogout();
      }
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
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserData}>
          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('profile.title')}</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.username || t('profile.guestUser')}</Text>
            <Text style={styles.profileSubtext}>{user?.email || ''}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.settingsSection}>
          <Text style={styles.settingsTitle}>{t('profile.settings')}</Text>
          
          <TouchableOpacity 
            style={styles.settingsItem} 
            onPress={() => handleSettingsPress('personal')}
          >
            <View style={styles.settingsItemLeft}>
              <Ionicons name="person-outline" size={24} color="black" />
              <Text style={styles.settingsItemText}>{t('profile.personalInfo')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="gray" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => handleSettingsPress('notifications')}
          >
            <View style={styles.settingsItemLeft}>
              <Ionicons name="notifications-outline" size={24} color="black" />
              <Text style={styles.settingsItemText}>{t('profile.notificationSettings')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="gray" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => handleSettingsPress('language')}
          >
            <View style={styles.settingsItemLeft}>
              <Ionicons name="language-outline" size={24} color="black" />
              <Text style={styles.settingsItemText}>{t('profile.languageSettings')}</Text>
            </View>
            <View style={styles.settingsItemRight}>
              <Text style={styles.settingsItemValue}>
                {t(`languages.${selectedLanguage === 'TURKISH' ? 'turkish' : 'english'}`)}
              </Text>
              <Ionicons name="chevron-forward" size={24} color="gray" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => handleSettingsPress('password')}
          >
            <View style={styles.settingsItemLeft}>
              <Ionicons name="lock-closed-outline" size={24} color="black" />
              <Text style={styles.settingsItemText}>{t('profile.changePassword')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="gray" />
          </TouchableOpacity>

          <View style={styles.logoutContainer}>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.logoutText}>{t('common.logout')}</Text>
            </TouchableOpacity>
            <Text style={styles.versionText}>SÜRÜM 0.0.1</Text>
          </View>
        </View>
      </SafeAreaView>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        enableDismissOnClose
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          {changingLanguage ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : (
            <View style={styles.languageList}>
              {languages.map((lang) => {
                const isSelected = selectedLanguage === lang.id;
                return (
                  <TouchableOpacity
                    key={lang.id}
                    style={[
                      styles.languageItem,
                      isSelected && styles.selectedLanguageItem
                    ]}
                    onPress={() => handleLanguageSelect(lang.id)}
                  >
                    <View style={styles.languageInfo}>
                      <Text style={styles.languageIcon}>{lang.icon}</Text>
                      <Text style={styles.languageName}>{lang.name}</Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark" size={24} color="gray" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </BottomSheetView>
      </BottomSheetModal>
      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
  },
  retryButton: {
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
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
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginTop: 8,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 26,
    fontWeight: '600',
    color: '#000000',
  },
  profileSubtext: {
    fontSize: 18,
    color: '#666666',
    marginTop: 6,
  },
  settingsSection: {
    paddingTop: 20,
  },
  settingsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemText: {
    fontSize: 16,
    marginLeft: 15,
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemValue: {
    marginRight: 8,
    color: 'gray',
  },
  bottomSheetBackground: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  handleIndicator: {
    backgroundColor: '#DADADA',
    width: 40,
  },
  bottomSheetContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  languageList: {
    paddingTop: 8,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingsItemSubtext: {
    fontSize: 14,
    color: 'gray',
    marginTop: 2,
  },
  logoutButton: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  logoutText: {
    color: 'red',
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  settingsItemText: {
    fontSize: 16,
    marginLeft: 15,
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

export default ProfileScreen; 