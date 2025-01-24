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
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { onLogout } = route.params || {};
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [username, setUsername] = useState('');
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const welcomeAnim = useRef(new Animated.Value(1)).current;
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

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('categories.errors.fetchError'),
        visibilityTime: 3000,
        position: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const response = await api.get('/users/me');
      setUsername(response.data.username || '');
    } catch (error) {
      console.log('Kullanıcı bilgisi alınamadı');
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchUserInfo();

    const unsubscribe = navigation.addListener('focus', () => {
      fetchCategories();
    });

    // Hoşgeldiniz mesajını 5 saniye sonra gizle
    const timer = setTimeout(() => {
      Animated.timing(welcomeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setShowWelcome(false));
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        gestureEnabled: false,
        swipeEnabled: false,
      });
    }, [navigation])
  );

  const createOptions = [
    {
      id: 1,
      title: t('home.actions.newCategory'),
      subtitle: t('home.actions.newCategoryDesc'),
      icon: 'grid',
      color: '#E3F2FD'
    },
    {
      id: 2,
      title: t('home.actions.newStudySet'),
      subtitle: t('home.actions.newStudySetDesc'),
      icon: 'albums',
      color: '#FFF3E0'
    },
    {
      id: 3,
      title: t('home.actions.newFlashcard'),
      subtitle: t('home.actions.newFlashcardDesc'),
      icon: 'documents',
      color: '#E8F5E9'
    }
  ];

  const showModal = () => {
    setIsModalVisible(true);
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

  const handleOptionSelect = (optionId) => {
    switch (optionId) {
      case 1:
        navigation.navigate('AddCategory');
        break;
      case 2:
        navigation.navigate('AddStudySet');
        break;
      case 3:
        navigation.navigate('AddFlashcard');
        break;
    }
    hideModal();
  };

  const renderWelcomeMessage = () => (
    <Animated.View 
      style={[
        styles.welcomeContainer,
        { opacity: welcomeAnim }
      ]}
    >
      <View style={styles.welcomeContent}>
        <Ionicons name="hand-right" size={24} color="#007AFF" />
        <Text style={styles.welcomeText}>{t('home.welcome')}</Text>
      </View>
      <Text style={styles.welcomeSubtext}>{t('home.welcomeMessage')}</Text>
    </Animated.View>
  );

  const renderCategoryStats = () => {
    const totalSets = categories.reduce((sum, category) => sum + (category.studySets?.length || 0), 0);
    const totalCards = categories.reduce((sum, category) => {
      return sum + (category.studySets?.reduce((setSum, set) => setSum + (set.cards?.length || 0), 0) || 0);
    }, 0);

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="folder" size={24} color="#666666" />
          <Text style={styles.statNumber}>{categories.length}</Text>
          <Text style={styles.statLabel}>{t('home.stats.categories')}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="albums" size={24} color="#666666" />
          <Text style={styles.statNumber}>{totalSets}</Text>
          <Text style={styles.statLabel}>{t('home.stats.studySets')}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="documents" size={24} color="#666666" />
          <Text style={styles.statNumber}>{totalCards}</Text>
          <Text style={styles.statLabel}>{t('home.stats.flashcards')}</Text>
        </View>
      </View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickActionsContent}
      >
        <TouchableOpacity 
          style={[styles.quickActionCard]}
          onPress={() => navigation.navigate('AddCategory')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#F8F9FA' }]}>
            <Ionicons name="home" size={24} color="#666666" />
          </View>
          <Text style={styles.quickActionTitle}>{t('home.actions.newCategory')}</Text>
          <Text style={styles.quickActionSubtitle}>{t('home.actions.newCategoryDesc')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('AddStudySet')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#F8F9FA' }]}>
            <Ionicons name="albums" size={24} color="#666666" />
          </View>
          <Text style={styles.quickActionTitle}>{t('home.actions.newStudySet')}</Text>
          <Text style={styles.quickActionSubtitle}>{t('home.actions.newStudySetDesc')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('AddFlashcard')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#F8F9FA' }]}>
            <Ionicons name="documents" size={24} color="#666666" />
          </View>
          <Text style={styles.quickActionTitle}>{t('home.actions.newFlashcard')}</Text>
          <Text style={styles.quickActionSubtitle}>{t('home.actions.newFlashcardDesc')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

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
        <View>
          <Text style={styles.headerTitle}>
            {t('home.greeting', { username: username || t('common.user') })}
          </Text>
          <Text style={styles.headerSubtitle}>
            {t('home.welcomeBack')}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => navigation.navigate('NotificationSettings')}
        >
          <Ionicons name="notifications-outline" size={24} color="#666666" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        scrollEnabled={true}
        directionalLockEnabled={true}
        alwaysBounceVertical={false}
        alwaysBounceHorizontal={false}
      >
        {showWelcome && renderWelcomeMessage()}
        {renderCategoryStats()}
        {renderQuickActions()}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.yourCategories')}</Text>
          </View>
          <View style={styles.categoriesContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => navigation.navigate('StudySet', { category })}
              >
                <View style={[
                  styles.categoryIconContainer, 
                  { backgroundColor: category.color || '#2C2C2E' }
                ]}>
                  <Ionicons 
                    name={category.icon || "folder-outline"} 
                    size={24} 
                    color="#666666" 
                  />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => {}}
        >
          <Ionicons name="home" size={22} color="#666666" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.addButton}
          onPress={showModal}
        >
          <Ionicons name="add" size={24} color="#666666" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile', { onLogout })}
        >
          <Ionicons name="person" size={22} color="#666666" />
        </TouchableOpacity>
      </View>

      {/* Create Modal */}
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
            </View>

            {createOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionItem}
                onPress={() => handleOptionSelect(option.id)}
              >
                <View style={[styles.optionIcon, { backgroundColor: option.color }]}>
                  <Ionicons name={option.icon} size={24} color="#666666" />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginTop: 12,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 0,
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingTop: 0,
  },
  welcomeContainer: {
    backgroundColor: '#1C1C1E',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
    marginTop: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  section: {
    flex: 1,
    paddingTop: 8,
  },
  sectionHeader: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 4,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
  activeNavItem: null,
  navText: null,
  activeNavText: null,
  addButtonContainer: null,
  iconBackground: null,
  activeIconBackground: null,
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
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
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
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#F8F9FA'
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
  quickActionsContainer: {
    marginBottom: 24,
  },
  quickActionsContent: {
    paddingHorizontal: 12,
  },
  quickActionCard: {
    width: 200,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#2C2C2E',
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 16,
  },
});

export default HomeScreen; 