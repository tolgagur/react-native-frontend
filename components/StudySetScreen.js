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
  PanResponder,
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
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { height: screenHeight } = Dimensions.get('window');

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(1 - (gestureState.dy / screenHeight));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > screenHeight / 3) {
          hideModal();
        } else {
          Animated.spring(slideAnim, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const fetchStudySets = async () => {
    try {
      const token = await AsyncStorage.getItem('@flashcard_token');
      console.log('Kategori ID:', category.id);
      console.log('Token:', token);
      
      const url = `/study-sets/by-category/${category.id}`;
      console.log('İstek URL:', url);
      
      const response = await api.get(url);
      console.log('API Yanıtı:', response.data);
      setStudySets(response.data);
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
    slideAnim.setValue(0);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text 
          style={styles.headerTitle}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {category.name}
        </Text>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => navigation.navigate('NotificationSettings')}
        >
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {studySets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="albums-outline" size={48} color="#999" />
            <Text style={styles.emptyText}>{t('studySet.empty')}</Text>
            <Text style={styles.emptySubText}>{t('studySet.emptySubtext')}</Text>
          </View>
        ) : (
          <View style={styles.studySetsContainer}>
            {studySets.map((studySet) => (
              <TouchableOpacity
                key={studySet.id}
                style={styles.studySetCard}
                onPress={() => navigation.navigate('StudySetDetail', { studySet })}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Text style={styles.studySetName}>{studySet.name}</Text>
                    <Text style={styles.username}>by {studySet.username}</Text>
                  </View>
                  <View style={styles.statsContainer}>
                    <Text style={styles.statsText}>
                      {studySet.flashcards?.length || studySet.totalCards || 0} kart
                    </Text>
                  </View>
                </View>

                {studySet.description && (
                  <Text style={styles.description} numberOfLines={2}>
                    {studySet.description}
                  </Text>
                )}

                <View style={styles.progressContainer}>
                  {renderProgress(studySet)}
                  <View style={styles.progressStats}>
                    <Text style={styles.progressText}>
                      {studySet.masteredCards || 0} öğrenildi
                    </Text>
                    <Text style={styles.progressText}>
                      {studySet.learningCards || 0} öğreniliyor
                    </Text>
                    <Text style={styles.progressText}>
                      {studySet.notStartedCards || 0} başlanmadı
                    </Text>
                  </View>
                </View>

                <View style={styles.flashcardsPreview}>
                  {studySet.flashcards && studySet.flashcards.slice(0, 3).map((card) => (
                    <View key={card.id} style={styles.previewCard}>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(card.status) }]} />
                      <Text style={styles.previewText} numberOfLines={1}>
                        {card.frontTitle || card.frontContent}
                      </Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home-outline" size={24} color="#666666" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={showModal}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-outline" size={24} color="#666666" />
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
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [screenHeight, 0],
                  }),
                },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIndicator} />
              <Text style={styles.modalTitle}>Yeni Oluştur</Text>
            </View>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                hideModal();
                navigation.navigate('AddStudySet', { categoryId: category.id });
              }}
            >
              <View style={[styles.optionIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="albums-outline" size={24} color="#007AFF" />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Yeni Çalışma Seti</Text>
                <Text style={styles.optionSubtitle}>Kartlarınızı organize edin</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                hideModal();
                navigation.navigate('AddFlashcard', { categoryId: category.id });
              }}
            >
              <View style={[styles.optionIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="documents-outline" size={24} color="#4CAF50" />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Yeni Flash Kart</Text>
                <Text style={styles.optionSubtitle}>Hızlı kart oluşturun</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleContainer: {
    flex: 1,
  },
  studySetName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: '#666666',
  },
  statsContainer: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
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
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#666666',
  },
  flashcardsPreview: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  navItem: {
    padding: 12,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  },
  modalContent: {
    padding: 16,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666666',
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
});

export default StudySetScreen; 