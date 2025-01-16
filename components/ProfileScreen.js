import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import Toast from 'react-native-toast-message';
import api from '../services/api';

const languages = [
  { id: 'TURKISH', name: 'Türkçe', icon: '🇹🇷' },
  { id: 'ENGLISH', name: 'English', icon: '🇬🇧' },
];

const ProfileScreen = ({ navigation }) => {
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
        dil: response.data.language,
        seçiliDil: selectedLanguage
      });
      setUser(response.data);
      if (response.data.language) {
        setSelectedLanguage(response.data.language);
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
    try {
      setChangingLanguage(true);
      setSelectedLanguage(langId);
      
      const updateResponse = await api.put(`/users/me/language?language=${langId}`);
      console.log('Dil güncelleme yanıtı:', updateResponse.data);
      
      const userResponse = await api.get('/users/me');
      console.log('Güncel kullanıcı bilgileri:', userResponse.data);
      
      setUser(userResponse.data);
      
      Toast.show({
        type: 'success',
        text1: 'Başarılı',
        text2: 'Dil ayarı güncellendi',
        visibilityTime: 2000,
      });

      setTimeout(() => {
        bottomSheetModalRef.current?.dismiss();
      }, 1000);
    } catch (error) {
      console.error('Dil değiştirme hatası:', error);
      setSelectedLanguage(previousLanguage);
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: 'Dil değiştirilemedi',
        visibilityTime: 3000,
      });
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
      default:
        break;
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
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
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
            <Text style={styles.headerTitle}>Profil</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.profileSection} onPress={handleProfilePress}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.username || 'Misafir Kullanıcı'}</Text>
            <Text style={styles.profileSubtext}>{user?.email || 'Profili göster'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="gray" />
        </TouchableOpacity>

        <View style={styles.settingsSection}>
          <Text style={styles.settingsTitle}>Ayarlar</Text>
          
          <TouchableOpacity 
            style={styles.settingsItem} 
            onPress={() => handleSettingsPress('personal')}
          >
            <View style={styles.settingsItemLeft}>
              <Ionicons name="person-outline" size={24} color="black" />
              <Text style={styles.settingsItemText}>Kişisel bilgiler</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="gray" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => handleSettingsPress('notifications')}
          >
            <View style={styles.settingsItemLeft}>
              <Ionicons name="notifications-outline" size={24} color="black" />
              <Text style={styles.settingsItemText}>Bildirim ayarları</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="gray" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => handleSettingsPress('language')}
          >
            <View style={styles.settingsItemLeft}>
              <Ionicons name="language-outline" size={24} color="black" />
              <Text style={styles.settingsItemText}>Dil Seçimi</Text>
            </View>
            <View style={styles.settingsItemRight}>
              <Text style={styles.settingsItemValue}>
                {selectedLanguage === 'TURKISH' ? 'Türkçe' : 'English'}
              </Text>
              <Ionicons name="chevron-forward" size={24} color="gray" />
            </View>
          </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
  },
  profileSubtext: {
    color: 'gray',
    marginTop: 4,
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
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
});

export default ProfileScreen; 