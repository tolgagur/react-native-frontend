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
  PanResponder
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

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      console.log('Kategoriler yüklendi:', response.data);
      setCategories(response.data);
    } catch (error) {
      console.error('Kategori yükleme hatası:', error);
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: 'Kategoriler yüklenirken bir hata oluştu',
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

    return unsubscribe;
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
        <Text style={styles.headerTitle}>{t('categories.title')}</Text>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => navigation.navigate('NotificationSettings')}
        >
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={48} color="#999" />
            <Text style={styles.emptyText}>{t('categories.empty')}</Text>
            <Text style={styles.emptySubText}>{t('categories.emptySubtext')}</Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => {
                  console.log('Kategori seçildi:', category);
                  navigation.navigate('StudySet', { category });
                }}
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
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
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
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
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
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeIconBackground: {
    backgroundColor: '#F8F8F8',
    borderColor: '#E0E0E0',
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});

export default HomeScreen; 