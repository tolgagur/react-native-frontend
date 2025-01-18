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

const HomeScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { onLogout } = route.params || {};
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
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

  useEffect(() => {
    fetchCategories();

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
          <Ionicons name="folder" size={24} color="#007AFF" />
          <Text style={styles.statNumber}>{categories.length}</Text>
          <Text style={styles.statLabel}>{t('home.stats.categories')}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="albums" size={24} color="#34C759" />
          <Text style={styles.statNumber}>{totalSets}</Text>
          <Text style={styles.statLabel}>{t('home.stats.studySets')}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="documents" size={24} color="#FF9500" />
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
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('AddCategory')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="folder-open" size={24} color="#007AFF" />
          </View>
          <Text style={styles.quickActionTitle}>{t('home.actions.newCategory')}</Text>
          <Text style={styles.quickActionSubtitle}>{t('home.actions.newCategoryDesc')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('AddStudySet')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#F0FDF4' }]}>
            <Ionicons name="albums" size={24} color="#34C759" />
          </View>
          <Text style={styles.quickActionTitle}>{t('home.actions.newStudySet')}</Text>
          <Text style={styles.quickActionSubtitle}>{t('home.actions.newStudySetDesc')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('AddFlashcard')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#FFF4E5' }]}>
            <Ionicons name="documents" size={24} color="#FF9500" />
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
          <Text style={styles.headerTitle}>{t('categories.title')}</Text>
          <Text style={styles.headerSubtitle}>{t('home.subtitle')}</Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => navigation.navigate('NotificationSettings')}
        >
          <Ionicons name="notifications-outline" size={24} color="#000" />
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

        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>{t('home.yourCategories')}</Text>
          {categories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="folder-open-outline" size={64} color="#007AFF" />
              </View>
              <Text style={styles.emptyText}>{t('categories.empty')}</Text>
              <Text style={styles.emptySubText}>{t('categories.emptySubtext')}</Text>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={() => navigation.navigate('AddCategory')}
              >
                <Ionicons name="add" size={24} color="#FFF" />
                <Text style={styles.createButtonText}>{t('categories.addNew')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryCard}
                  onPress={() => 
                    navigation.navigate('StudySet', 
                      { category }, 
                      { 
                        gestureEnabled: false 
                      }
                    )
                  }
                >
                  <View style={styles.cardContent}>
                    <View style={[styles.iconContainer, { backgroundColor: category.color || '#F5F5F5' }]}>
                      <Ionicons name={category.icon || 'folder-outline'} size={24} color="#666666" />
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    {category.description && (
                      <Text style={styles.categoryDescription} numberOfLines={1}>
                        {category.description}
                      </Text>
                    )}
                    <Text style={styles.categoryStats}>
                      {t('categories.studySetCount', { count: category.studySets?.length || 0 })}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => {}}
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
          onPress={() => navigation.navigate('Profile', { onLogout })}
        >
          <Ionicons name="person-outline" size={22} color="#666666" />
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
              <Text style={styles.modalTitle}>{t('home.createNew')}</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  welcomeContainer: {
    backgroundColor: '#F8F9FA',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 16,
    marginBottom: 12,
  },
  quickActionsContent: {
    paddingHorizontal: 12,
  },
  quickActionCard: {
    width: 200,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  categoriesSection: {
    flex: 1,
    paddingTop: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  categoryCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  categoryStats: {
    fontSize: 12,
    color: '#007AFF',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
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

export default HomeScreen; 