import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import Toast from 'react-native-toast-message';

const ProfileScreen = ({ navigation, route }) => {
  const { onLogout } = route.params || {};
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await api.get('users/me');
      console.log('Kullanıcı bilgileri alındı:', response.data);
      setUserInfo(response.data);
    } catch (error) {
      console.error('Kullanıcı bilgileri yüklenirken hata:', error.response?.data || error);
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: error.response?.data?.message || 'Kullanıcı bilgileri yüklenemedi',
        visibilityTime: 3000,
        position: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    {
      id: 2,
      title: 'Bildirimler',
      icon: 'notifications-outline',
      status: userInfo?.notificationEnabled ? 'Açık' : 'Kapalı',
      statusColor: userInfo?.notificationEnabled ? '#4CAF50' : '#999',
    },
    {
      id: 5,
      title: 'Ayarlar',
      icon: 'settings-outline',
    },
  ];

  const stats = [
    {
      id: 1,
      value: userInfo?.level || 0,
      label: 'Seviye',
      icon: 'trophy-outline',
    },
    {
      id: 2,
      value: userInfo?.totalFlashcards || 0,
      label: 'Toplam Kart',
      icon: 'documents-outline',
    },
    {
      id: 3,
      value: `%${userInfo?.successRate || 0}`,
      label: 'Başarı',
      icon: 'trending-up-outline',
    },
  ];

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

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
        </View>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Profil Başlığı */}
          <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              {userInfo?.profileImageUrl ? (
                <Image 
                  source={{ uri: userInfo.profileImageUrl }} 
                  style={styles.avatarContainer}
                />
              ) : (
                <View style={styles.avatarContainer}>
                  <Ionicons name="person" size={40} color="#007AFF" />
                </View>
              )}
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {userInfo?.firstName} {userInfo?.lastName}
                </Text>
                <Text style={styles.userEmail}>{userInfo?.email}</Text>
                {userInfo?.bio && (
                  <Text style={styles.userBio} numberOfLines={2}>
                    {userInfo.bio}
                  </Text>
                )}
              </View>
            </View>
            {(userInfo?.location || userInfo?.website) && (
              <View style={styles.additionalInfo}>
                {userInfo?.location && (
                  <View style={styles.infoItem}>
                    <Ionicons name="location-outline" size={16} color="#666666" />
                    <Text style={styles.infoText}>{userInfo.location}</Text>
                  </View>
                )}
                {userInfo?.website && (
                  <View style={styles.infoItem}>
                    <Ionicons name="link-outline" size={16} color="#666666" />
                    <Text style={styles.infoText}>{userInfo.website}</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* İstatistikler */}
          <View style={styles.statsContainer}>
            {stats.map((stat) => (
              <View key={stat.id} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Menü Öğeleri */}
          <View style={styles.menuContainer}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => {
                  if (item.title === 'Bildirimler') {
                    navigation.navigate('NotificationSettings');
                  } else if (item.title === 'Ayarlar') {
                    navigation.navigate('Settings');
                  }
                }}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name={item.icon} size={24} color="#333" />
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                </View>
                <View style={styles.menuItemRight}>
                  {item.status && (
                    <Text style={[styles.statusText, { color: item.statusColor }]}>
                      {item.status}
                    </Text>
                  )}
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Çıkış Yap Butonu */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              if (onLogout) {
                onLogout();
              }
            }}
          >
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  profileHeader: {
    padding: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  userBio: {
    fontSize: 14,
    color: '#444444',
    lineHeight: 20,
  },
  additionalInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemTitle: {
    fontSize: 16,
    color: '#2C2C2C',
    marginLeft: 16,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 40,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default ProfileScreen; 