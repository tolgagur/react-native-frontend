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

const SkeletonLoader = () => {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((item) => (
        <Animated.View
          key={item}
          style={[
            styles.skeletonCard,
            {
              opacity,
            },
          ]}
        >
          <View style={styles.skeletonHeader}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonSubtitle} />
          </View>
          <View style={styles.skeletonStats}>
            <View style={styles.skeletonStat} />
            <View style={styles.skeletonStat} />
            <View style={styles.skeletonStat} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
};

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
      // Route params'dan shouldRefresh ve newStudySet'i kontrol et
      const shouldRefresh = route.params?.shouldRefresh;
      const newStudySet = route.params?.newStudySet;

      if (shouldRefresh) {
        // Yeni oluşturulan seti hemen ekle
        if (newStudySet) {
          const processedStudySet = {
            ...newStudySet,
            totalCards: 0,
            masteredCards: 0,
            learningCards: 0,
            notStartedCards: 0,
            flashcards: []
          };
          setStudySets(prevSets => [processedStudySet, ...prevSets]);
        }
        // Route params'ı temizle
        navigation.setParams({ shouldRefresh: undefined, newStudySet: undefined });
        // Tam listeyi güncelle
        fetchStudySets();
      }
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
        <Ionicons name="chevron-back" size={24} color="#666666" />
      </TouchableOpacity>

      <View style={styles.categoryContainer}>
        <View style={styles.categoryHeader}>
          <View style={[styles.categoryIcon, { backgroundColor: category.color || '#000000' }]}>
            <Ionicons 
              name={category.icon || 'folder'} 
              size={24} 
              color={category.color ? '#1C1C1E' : '#FFFFFF'} 
            />
          </View>
          <View style={styles.categoryTitleContainer}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryMeta}>
              {category.cardCount || 0} kart içeriyor
            </Text>
          </View>
        </View>
        {category.description && (
          <Text style={styles.categoryDescription}>
            {category.description}
          </Text>
        )}
      </View>
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
          <View style={styles.cardMain}>
            <Text style={styles.studySetName}>{studySet.name}</Text>
            {studySet.description && (
              <Text style={styles.description} numberOfLines={2}>
                {studySet.description}
              </Text>
            )}
          </View>

          <View style={styles.cardStats}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{studySet.totalCards || 0}</Text>
                <Text style={styles.statLabel}>{t('studySet.stats.total')}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{studySet.masteredCards || 0}</Text>
                <Text style={styles.statLabel}>{t('studySet.stats.mastered')}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
                  {Math.round(progress)}%
                </Text>
                <Text style={styles.statLabel}>{t('studySet.stats.progress')}</Text>
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

  const renderContent = () => {
    if (isLoading) {
      return <SkeletonLoader />;
    }

    if (studySets.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="albums-outline" size={48} color="#666666" />
          </View>
          <Text style={styles.emptyText}>{t('studySet.empty')}</Text>
          <Text style={styles.emptySubText}>{t('studySet.emptySubtext')}</Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => navigation.replace('AddStudySet', { categoryId: category.id })}
          >
            <Ionicons name="add-outline" size={20} color="#FFF" />
            <Text style={styles.emptyButtonText}>Yeni Set Oluştur</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.studySetsContainer}>
        {studySets.map(renderStudySetCard)}
      </View>
    );
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
        {renderContent()}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.replace('Home')}
        >
          <Ionicons name="home-outline" size={22} color="#666666" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.replace('AddStudySet', { categoryId: category.id })}
        >
          <Ionicons name="add-outline" size={24} color="#666666" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.replace('Profile')}
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
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  categoryContainer: {
    padding: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryTitleContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  categoryMeta: {
    fontSize: 15,
    color: '#8E8E93',
  },
  categoryDescription: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 22,
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  studySetsContainer: {
    padding: 24,
  },
  studySetCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  cardContent: {
    padding: 16,
  },
  cardMain: {
    marginBottom: 16,
  },
  studySetName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 20,
  },
  cardStats: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#8E8E93',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#1C1C1E',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  navItem: {
    alignItems: 'center',
    minWidth: 64,
  },
  addButton: {
    alignItems: 'center',
    minWidth: 64,
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
    borderRadius: 24,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
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
    backgroundColor: '#2C2C2E',
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
    backgroundColor: '#2C2C2E',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  skeletonContainer: {
    padding: 16,
  },
  skeletonCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  skeletonHeader: {
    marginBottom: 16,
  },
  skeletonTitle: {
    height: 24,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    marginBottom: 8,
    width: '70%',
  },
  skeletonSubtitle: {
    height: 16,
    backgroundColor: '#2C2C2E',
    borderRadius: 6,
    width: '50%',
  },
  skeletonStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 40,
  },
  skeletonStat: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    marginHorizontal: 4,
  },
});

export default StudySetScreen; 