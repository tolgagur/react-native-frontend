import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Modal,
  Animated,
  Dimensions,
  Image,
  ProgressBarAndroid
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StudySetScreen = ({ navigation, route }) => {
  const { category } = route.params;
  const { t } = useTranslation();
  const [studySets, setStudySets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { height: screenHeight } = Dimensions.get('window');

  const fetchStudySets = async () => {
    try {
      const token = await AsyncStorage.getItem('@flashcard_token');
      console.log('Kategori ID:', category.id);
      
      const url = `/study-sets/by-category/${category.id}`;
      const response = await api.get(url);
      
      // Gelen veriyi işle ve kart sayılarını hesapla
      const processedStudySets = response.data.map(studySet => {
        const flashcards = studySet.flashcards || [];
        const totalCards = flashcards.length;
        const masteredCards = flashcards.filter(card => card.status === 'MASTERED').length;
        const learningCards = flashcards.filter(card => card.status === 'LEARNING').length;
        const notStartedCards = flashcards.filter(card => card.status === 'NOT_STARTED').length;

        return {
          ...studySet,
          totalCards,
          masteredCards,
          learningCards,
          notStartedCards
        };
      });

      console.log('İşlenmiş çalışma setleri:', processedStudySets);
      setStudySets(processedStudySets);
    } catch (error) {
      console.error('Çalışma setleri yükleme hatası:', error);
      if (error.response) {
        console.error('Hata yanıtı:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
          requestURL: error.config.url,
          requestHeaders: error.config.headers
        });
      }
      
      if (error.response?.status === 403) {
        Toast.show({
          type: 'error',
          text1: 'Yetkilendirme Hatası',
          text2: 'Lütfen tekrar giriş yapın',
          visibilityTime: 3000,
          position: 'top',
        });
        navigation.navigate('Auth', { screen: 'Login' });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Hata',
          text2: 'Çalışma setleri yüklenirken bir hata oluştu',
          visibilityTime: 3000,
          position: 'top',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudySets();

    const unsubscribe = navigation.addListener('focus', () => {
      fetchStudySets();
    });

    return unsubscribe;
  }, [navigation, category.id]);

  const showModal = () => {
    setIsModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
    });
  };

  const renderProgress = (studySet) => {
    const totalCards = studySet.totalCards || 0;
    const masteredCards = studySet.masteredCards || 0;
    const progress = totalCards > 0 ? (masteredCards / totalCards) : 0;

    if (Platform.OS === 'android') {
      return (
        <ProgressBarAndroid
          styleAttr="Horizontal"
          indeterminate={false}
          progress={progress}
          color="#4CAF50"
        />
      );
    }
    
    return (
      <View style={styles.iosProgressBar}>
        <View style={[styles.iosProgressFill, { width: `${progress * 100}%` }]} />
      </View>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'MASTERED':
        return '#4CAF50';
      case 'LEARNING':
        return '#FFC107';
      case 'NOT_STARTED':
      default:
        return '#9E9E9E';
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="#000" />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {category.name}
        </Text>
        <Text style={styles.headerSubtitle}>
          {studySets.length} çalışma seti
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.notificationButton}
        onPress={() => navigation.navigate('NotificationSettings')}
      >
        <Ionicons name="notifications-outline" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );

  const renderStudySetCard = (studySet) => {
    const progress = studySet.totalCards > 0 
      ? (studySet.masteredCards / studySet.totalCards) * 100 
      : 0;

    return (
      <TouchableOpacity
        key={studySet.id}
        style={styles.studySetCard}
        onPress={() => navigation.navigate('StudySetDetail', { studySet })}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.studySetName}>{studySet.name}</Text>
              <Text style={styles.username}>
                <Ionicons name="person-outline" size={14} color="#666" /> {studySet.username}
              </Text>
            </View>
            <View style={styles.statsContainer}>
              <Ionicons name="documents-outline" size={16} color="#666" />
              <Text style={styles.statsText}> {studySet.totalCards || 0}</Text>
            </View>
          </View>

          {studySet.description && (
            <Text style={styles.description} numberOfLines={2}>
              {studySet.description}
            </Text>
          )}

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>İlerleme</Text>
              <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
            </View>
            {renderProgress(studySet)}
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{studySet.masteredCards || 0}</Text>
                <Text style={styles.statLabel}>Öğrenildi</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{studySet.learningCards || 0}</Text>
                <Text style={styles.statLabel}>Öğreniliyor</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{studySet.notStartedCards || 0}</Text>
                <Text style={styles.statLabel}>Başlanmadı</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const createOptions = [
    {
      id: 1,
      title: t('categories.addNew'),
      subtitle: t('categories.addNewSubtitle'),
      icon: 'grid-outline',
      color: '#E3F2FD'
    },
    {
      id: 2,
      title: t('studySet.addNew'),
      subtitle: t('studySet.addNewSubtitle'),
      icon: 'albums-outline',
      color: '#FFF3E0'
    },
    {
      id: 3,
      title: t('flashcard.addNew'),
      subtitle: t('flashcard.addNewSubtitle'),
      icon: 'documents-outline',
      color: '#E8F5E9'
    }
  ];

  const handleOptionSelect = (optionId) => {
    switch (optionId) {
      case 1:
        navigation.navigate('AddCategory');
        break;
      case 2:
        navigation.navigate('AddStudySet', { categoryId: category.id });
        break;
      case 3:
        navigation.navigate('AddFlashcard', { categoryId: category.id });
        break;
    }
    hideModal();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {studySets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="albums-outline" size={48} color="#007AFF" />
            </View>
            <Text style={styles.emptyText}>{t('studySet.empty')}</Text>
            <Text style={styles.emptySubText}>{t('studySet.emptySubtext')}</Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={showModal}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFF" />
              <Text style={styles.emptyButtonText}>Yeni Set Oluştur</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.studySetsContainer}>
            {studySets.map(renderStudySetCard)}
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home-outline" size={22} color="#666666" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={showModal}
        >
          <Ionicons name="add-outline" size={24} color="#666666" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-outline" size={22} color="#666666" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={hideModal}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          <TouchableOpacity 
            style={{ flex: 1 }}
            onPress={hideModal}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [screenHeight, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIndicator} />
            </View>

            {createOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionItem}
                onPress={() => handleOptionSelect(option.id)}
              >
                <View style={[styles.optionIcon, { backgroundColor: option.color }]}>
                  <Ionicons name={option.icon} size={24} color="#007AFF" />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </Modal>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  notificationButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  studySetsContainer: {
    padding: 16,
  },
  studySetCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  studySetName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: '#666666',
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  statsText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666666',
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  progressSection: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  iosProgressBar: {
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  iosProgressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  navItem: {
    alignItems: 'center',
    minWidth: 64,
  },
  navText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  addButton: {
    alignItems: 'center',
    minWidth: 64,
  },
  addButtonText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  modalContent: {
    padding: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});

export default StudySetScreen; 