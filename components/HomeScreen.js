import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Modal,
  Animated,
  Dimensions,
  PanResponder,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import Toast from 'react-native-toast-message';

const HomeScreen = ({ navigation, route }) => {
  const { onLogout } = route.params || {};
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { height: screenHeight } = Dimensions.get('window');
  const panY = useRef(new Animated.Value(0)).current;

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
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    fetchCategories();
  }, []);

  const createOptions = [
    {
      id: 1,
      title: 'Yeni Kategori',
      subtitle: 'Kategori oluştur',
      icon: 'grid-outline',
      color: '#E3F2FD'
    },
    {
      id: 2,
      title: 'Çalışma Seti',
      subtitle: 'Yeni set oluştur',
      icon: 'albums-outline',
      color: '#FFF3E0'
    },
    {
      id: 3,
      title: 'Kart Ekle',
      subtitle: 'Yeni kart oluştur',
      icon: 'documents-outline',
      color: '#E8F5E9'
    }
  ];

  const resetPositionAnim = Animated.timing(panY, {
    toValue: 0,
    duration: 200,
    useNativeDriver: true,
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gs) => {
        if (gs.dy > 0) {
          panY.setValue(gs.dy);
        }
      },
      onPanResponderRelease: (e, gs) => {
        if (gs.dy > 100) {
          hideModal();
        } else {
          resetPositionAnim.start();
        }
      },
    })
  ).current;

  const showModal = () => {
    panY.setValue(0);
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
            />
          }
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kategorilerim</Text>
          </View>
          
          {categories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={48} color="#999" />
              <Text style={styles.emptyText}>Henüz kategori oluşturmadınız</Text>
              <Text style={styles.emptySubText}>Yeni kategori eklemek için + butonuna tıklayın</Text>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryCard}
                  onPress={() => {
                    console.log('Kategori seçildi:', category);
                  }}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.iconContainer}>
                      <Ionicons 
                        name="grid-outline"
                        size={24} 
                        color="#007AFF"
                      />
                    </View>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName} numberOfLines={1}>{category.name}</Text>
                      {category.description && (
                        <Text style={styles.categoryDescription} numberOfLines={2}>
                          {category.description}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="home" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={showModal}
          >
            <Ionicons name="add" size={24} color="#666666" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => onLogout ? onLogout() : null}
          >
            <Ionicons name="log-out-outline" size={24} color="#666666" />
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
              activeOpacity={1}
            >
              <View />
            </TouchableOpacity>
            <Animated.View
              {...panResponder.panHandlers}
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
                    {
                      translateY: panY,
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
                    onPress={() => {
                      if (option.id === 1) {
                        navigation.navigate('AddCategory');
                      } else if (option.id === 2) {
                        navigation.navigate('AddStudySet');
                      } else if (option.id === 3) {
                        navigation.navigate('AddFlashcard');
                      }
                      hideModal();
                    }}
                  >
                    <View style={[styles.optionIcon, { backgroundColor: option.color }]}>
                      <Ionicons name={option.icon} size={24} color="#333" />
                    </View>
                    <View style={styles.optionText}>
                      <Text style={styles.optionTitle}>{option.title}</Text>
                      <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </Animated.View>
        </Modal>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  emptyContainer: {
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  categoryCard: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    marginBottom: 12,
  },
  categoryInfo: {
    width: '100%',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryDescription: {
    fontSize: 13,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
  },
  navItem: {
    padding: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 300,
    transform: [{ translateY: 0 }],
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
    marginBottom: 12,
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginVertical: 6,
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