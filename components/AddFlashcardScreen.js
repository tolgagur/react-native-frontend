import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  PanResponder,
  Animated,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import api from '../services/api';

const AddFlashcardScreen = ({ navigation }) => {
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false,
    });
  }, [navigation]);

  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [studySets, setStudySets] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedStudySet, setSelectedStudySet] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [flashcards, setFlashcards] = useState([{
    frontContent: '',
    backContent: '',
    difficultyLevel: 1,
    tags: []
  }]);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const nextCardOpacity = slideAnim.interpolate({
    inputRange: [-Dimensions.get('window').width, 0, Dimensions.get('window').width],
    outputRange: [1, 0, 0]
  });
  const prevCardOpacity = slideAnim.interpolate({
    inputRange: [-Dimensions.get('window').width, 0, Dimensions.get('window').width],
    outputRange: [0, 0, 1]
  });
  const [selectionFadeAnim] = useState(new Animated.Value(1));
  const [cardsFadeAnim] = useState(new Animated.Value(0));
  const [isAddingNewCard, setIsAddingNewCard] = useState(false);

  useEffect(() => {
    if (isAddingNewCard) {
      setCurrentStep(flashcards.length - 1);
      setIsAddingNewCard(false);
    }
  }, [flashcards.length, isAddingNewCard]);

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setTouchStartX(e.nativeEvent.pageX);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentX = e.nativeEvent.pageX;
    const diff = currentX - touchStartX;
    slideAnim.setValue(diff);
  };

  const handleTouchEnd = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    const currentX = e.nativeEvent.pageX;
    const diff = currentX - touchStartX;
    const swipeThreshold = 100;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && currentStep > 0) {
        // Sağa kaydırma - önceki kart
        Animated.timing(slideAnim, {
          toValue: Dimensions.get('window').width,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          slideAnim.setValue(0);
          goToPreviousCard();
        });
      } else if (diff < 0 && currentStep < flashcards.length - 1) {
        // Sola kaydırma - sonraki kart
        const currentCard = flashcards[currentStep];
        if (currentCard.frontContent.trim() && currentCard.backContent.trim()) {
          Animated.timing(slideAnim, {
            toValue: -Dimensions.get('window').width,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            slideAnim.setValue(0);
            goToNextCard();
          });
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          Toast.show({
            type: 'error',
            text1: t('common.error'),
            text2: t('flashcard.errors.fillRequired'),
          });
        }
      } else {
        // Geçiş yapılamıyorsa geri dön
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    } else {
      // Yetersiz kaydırma mesafesi, geri dön
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('flashcard.errors.loadCategories'),
      });
    }
  };

  const fetchStudySets = async (categoryId) => {
    try {
      const response = await api.get(`/study-sets/by-category/${categoryId}`);
      setStudySets(response.data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('flashcard.errors.loadStudySets'),
      });
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedStudySet(null);
    fetchStudySets(category.id);
  };

  const handleStudySetSelect = (studySet) => {
    setSelectedStudySet(studySet);
    
    // Önce kart ekleme ekranını görünür yap, sonra seçim ekranını gizle
    cardsFadeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(selectionFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cardsFadeAnim, {
        toValue: 1,
        duration: 300,
        delay: 100,
        useNativeDriver: true,
      })
    ]).start();
  };

  const addNewCard = () => {
    if (flashcards.length >= 50) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('flashcard.errors.maxCards'),
      });
      return;
    }

    const currentCard = flashcards[currentStep];
    
    if (!currentCard.frontContent.trim() || !currentCard.backContent.trim()) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('flashcard.errors.fillRequired'),
      });
      return;
    }

    const newCard = {
      frontContent: '',
      backContent: '',
      difficultyLevel: 1,
      tags: [],
      categoryId: selectedCategory?.id,
      studySetId: selectedStudySet?.id
    };

    // Önce yeni kartı ekle
    setFlashcards(prevCards => [...prevCards, newCard]);
    setIsAddingNewCard(true);

    // Animasyonları sıfırla
    slideAnim.setValue(0);
    cardsFadeAnim.setValue(1);
  };

  const goToNextCard = () => {
    if (currentStep >= flashcards.length - 1) return;
    
    const currentCard = flashcards[currentStep];
    if (!currentCard.frontContent.trim() || !currentCard.backContent.trim()) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('flashcard.errors.fillRequired'),
      });
      return;
    }
    setCurrentStep(prevStep => prevStep + 1);
  };

  const goToPreviousCard = () => {
    if (currentStep <= 0) return;
    setCurrentStep(prevStep => prevStep - 1);
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {flashcards.map((_, index) => (
        <View
          key={index}
          style={[
            styles.stepDot,
            currentStep === index && styles.stepDotActive
          ]}
        />
      ))}
    </View>
  );

  const renderCard = (card, index, zIndex, opacity = 1) => {
    if (!card) return null;
    
    return (
      <Animated.View 
        key={index}
        style={[
          styles.cardWrapper,
          {
            position: 'absolute',
            left: 0,
            right: 0,
            opacity,
            zIndex,
          }
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardNumber}>
            {index + 1} / {flashcards.length}
          </Text>
          {flashcards.length > 1 && (
            <TouchableOpacity 
              style={styles.removeCardButton}
              onPress={() => {
                removeCard(index);
                if (currentStep >= flashcards.length - 1) {
                  setCurrentStep(flashcards.length - 2);
                }
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardSide}>
            <TextInput
              style={[styles.input, styles.frontInput]}
              value={card.frontContent}
              onChangeText={(text) => {
                if (text.length <= 50) {
                  updateCard(index, 'frontContent', text);
                }
              }}
              maxLength={50}
              placeholder={t('flashcard.contentPlaceholder')}
              multiline
              editable={index === currentStep}
              placeholderTextColor="#999"
            />
            <Text style={styles.characterCount}>
              {card.frontContent.length}/50
            </Text>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerIcon}>
              <Ionicons name="swap-vertical" size={20} color="#666" />
            </View>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.cardSide}>
            <TextInput
              style={[styles.input, styles.backInput]}
              value={card.backContent}
              onChangeText={(text) => {
                if (text.length <= 50) {
                  updateCard(index, 'backContent', text);
                }
              }}
              maxLength={50}
              placeholder={t('flashcard.answerPlaceholder')}
              multiline
              editable={index === currentStep}
              placeholderTextColor="#999"
            />
            <Text style={styles.characterCount}>
              {card.backContent.length}/50
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderCurrentCard = () => {
    if (!flashcards || flashcards.length === 0 || currentStep < 0 || currentStep >= flashcards.length) {
      return null;
    }

    const currentCard = flashcards[currentStep];
    if (!currentCard) return null;

    const nextCard = currentStep < flashcards.length - 1 ? flashcards[currentStep + 1] : null;
    const prevCard = currentStep > 0 ? flashcards[currentStep - 1] : null;

    return (
      <Animated.View 
        style={[styles.cardsContainer]}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {prevCard && (
          <Animated.View
            style={[
              styles.cardWrapper,
              {
                position: 'absolute',
                left: 0,
                right: 0,
                opacity: prevCardOpacity,
                transform: [{
                  translateX: slideAnim.interpolate({
                    inputRange: [-Dimensions.get('window').width, 0, Dimensions.get('window').width],
                    outputRange: [-Dimensions.get('window').width * 2, -Dimensions.get('window').width, 0]
                  })
                }]
              }
            ]}
          >
            {renderCard(prevCard, currentStep - 1, 1)}
          </Animated.View>
        )}

        <Animated.View
          style={[
            styles.cardWrapper,
            {
              position: 'absolute',
              left: 0,
              right: 0,
              zIndex: 2,
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          {renderCard(currentCard, currentStep, 2)}
        </Animated.View>

        {nextCard && (
          <Animated.View
            style={[
              styles.cardWrapper,
              {
                position: 'absolute',
                left: 0,
                right: 0,
                opacity: nextCardOpacity,
                transform: [{
                  translateX: slideAnim.interpolate({
                    inputRange: [-Dimensions.get('window').width, 0, Dimensions.get('window').width],
                    outputRange: [0, Dimensions.get('window').width, Dimensions.get('window').width * 2]
                  })
                }]
              }
            ]}
          >
            {renderCard(nextCard, currentStep + 1, 1)}
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  const removeCard = (index) => {
    const newFlashcards = flashcards.filter((_, i) => i !== index);
    setFlashcards(newFlashcards);
  };

  const updateCard = (index, field, value) => {
    const newFlashcards = [...flashcards];
    newFlashcards[index] = {
      ...newFlashcards[index],
      [field]: value
    };
    setFlashcards(newFlashcards);
  };

  const handleSave = async () => {
    if (!selectedCategory || !selectedStudySet) {
      console.log('Kategori veya çalışma seti seçili değil:', { selectedCategory, selectedStudySet });
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('flashcard.errors.requiredFields'),
      });
      return;
    }

    const validFlashcards = flashcards
      .filter(card => card.frontContent.trim() !== '' && card.backContent.trim() !== '')
      .map(card => ({
        frontContent: card.frontContent.trim(),
        backContent: card.backContent.trim(),
        difficultyLevel: 1,
        tags: [],
        categoryId: selectedCategory.id,
        studySetId: selectedStudySet.id
      }));

    console.log('Gönderilecek kartlar:', validFlashcards);

    if (validFlashcards.length === 0) {
      console.log('Geçerli kart bulunamadı');
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('flashcard.errors.frontRequired'),
      });
      return;
    }

    try {
      setLoading(true);
      console.log('API isteği başlatılıyor...');
      
      const requestData = {
        flashcards: validFlashcards.map(card => ({
          ...card,
          categoryId: parseInt(selectedCategory.id),
          studySetId: parseInt(selectedStudySet.id)
        }))
      };

      console.log('API isteği verisi:', JSON.stringify(requestData, null, 2));
      
      const response = await api.post('/flashcards/bulk', requestData);

      console.log('API yanıtı:', response.data);

      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('flashcard.success.created'),
      });

      navigation.goBack();
    } catch (error) {
      console.error('Kart kaydetme hatası:', error.response?.data || error.message);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.response?.data?.message || t('flashcard.errors.createError'),
      });
    } finally {
      setLoading(false);
    }
  };

  // Kartların geçerliliğini kontrol eden fonksiyon
  const areAllCardsValid = () => {
    return flashcards.every(card => 
      card.frontContent.trim() !== '' && 
      card.backContent.trim() !== ''
    );
  };

  const renderSelectionScreen = () => (
    <View style={styles.selectionScreen}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIndicatorContainer}>
          <View style={[styles.stepDot, !selectedCategory && styles.activeStepDot]} />
          <View style={[styles.stepLine, selectedCategory && styles.activeStepLine]} />
          <View style={[styles.stepDot, selectedCategory && !selectedStudySet && styles.activeStepDot]} />
          <View style={[styles.stepLine, selectedStudySet && styles.activeStepLine]} />
          <View style={[styles.stepDot, selectedStudySet && styles.activeStepDot]} />
        </View>
        <View style={styles.stepTextContainer}>
          <Text style={[styles.stepText, !selectedCategory && styles.activeStepText]}>Kategori</Text>
          <Text style={[styles.stepText, selectedCategory && !selectedStudySet && styles.activeStepText]}>Çalışma Seti</Text>
          <Text style={[styles.stepText, selectedStudySet && styles.activeStepText]}>Kartlar</Text>
        </View>
      </View>

      <View style={styles.selectionSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.selectionTitle}>{t('flashcard.category')}</Text>
          <Text style={styles.selectionDescription}>
            {!selectedCategory 
              ? 'Kartlarınızı eklemek istediğiniz kategoriyi seçin'
              : 'Seçilen kategori:'}
          </Text>
        </View>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                selectedCategory?.id === category.id && styles.selectedCategoryCard
              ]}
              onPress={() => handleCategorySelect(category)}
            >
              <View style={[
                styles.categoryIcon,
                selectedCategory?.id === category.id && styles.selectedCategoryIcon
              ]}>
                <Ionicons 
                  name="folder-outline" 
                  size={24} 
                  color={selectedCategory?.id === category.id ? "#FFFFFF" : "#000000"} 
                />
              </View>
              <Text style={[
                styles.categoryName,
                selectedCategory?.id === category.id && styles.selectedCategoryName
              ]}>
                {category.name}
              </Text>
              <View style={[
                styles.categoryIndicator,
                selectedCategory?.id === category.id && styles.selectedCategoryIndicator
              ]} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {selectedCategory && (
        <View style={styles.selectionSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.selectionTitle}>{t('flashcard.studySet')}</Text>
            <Text style={styles.selectionDescription}>
              {!selectedStudySet 
                ? 'Kartlarınızı hangi çalışma setine eklemek istediğinizi seçin'
                : 'Seçilen çalışma seti:'}
            </Text>
          </View>
          <ScrollView 
            style={styles.studySetsScrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.studySetsContainer}>
              {studySets.map((studySet) => (
                <TouchableOpacity
                  key={studySet.id}
                  style={[
                    styles.studySetCard,
                    selectedStudySet?.id === studySet.id && styles.selectedStudySetCard
                  ]}
                  onPress={() => handleStudySetSelect(studySet)}
                >
                  <View style={styles.studySetContent}>
                    <View style={[
                      styles.studySetIcon,
                      selectedStudySet?.id === studySet.id && styles.selectedStudySetIcon
                    ]}>
                      <Ionicons 
                        name="book-outline" 
                        size={20} 
                        color={selectedStudySet?.id === studySet.id ? "#FFFFFF" : "#000000"} 
                      />
                    </View>
                    <View style={styles.studySetInfo}>
                      <Text style={[
                        styles.studySetName,
                        selectedStudySet?.id === studySet.id && styles.selectedStudySetName
                      ]}>
                        {studySet.name}
                      </Text>
                    </View>
                  </View>
                  {selectedStudySet?.id === studySet.id && (
                    <View style={styles.checkmarkContainer}>
                      <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            {selectedCategory && selectedStudySet && (
              <TouchableOpacity 
                style={[
                  styles.addCardButton,
                  (!areAllCardsValid() || flashcards.length >= 50) && styles.addCardButtonDisabled
                ]} 
                onPress={addNewCard}
                disabled={!areAllCardsValid() || flashcards.length >= 50}
              >
                <Ionicons 
                  name="add" 
                  size={24} 
                  color={areAllCardsValid() && flashcards.length < 50 ? "#000000" : "#999999"} 
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.content}>
            <Animated.View 
              style={[
                styles.selectionContainer,
                { 
                  opacity: selectionFadeAnim,
                  display: selectedCategory && selectedStudySet ? 'none' : 'flex'
                }
              ]}
            >
              {renderSelectionScreen()}
            </Animated.View>

            {selectedCategory && selectedStudySet && (
              <Animated.View 
                style={{ 
                  flex: 1,
                  opacity: cardsFadeAnim,
                }}
              >
                {renderStepIndicator()}
                {renderCurrentCard()}
              </Animated.View>
            )}
          </View>

          {selectedCategory && selectedStudySet && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!selectedCategory || !selectedStudySet || loading || !areAllCardsValid()) && styles.saveButtonDisabled
                ]}
                onPress={handleSave}
                disabled={!selectedCategory || !selectedStudySet || loading || !areAllCardsValid()}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {t('common.save')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  backButton: {
    padding: 4,
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryList: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedCategory: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  categoryButtonText: {
    color: '#000000',
    fontSize: 14,
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  cardWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  cardContent: {
    flex: 1,
    padding: 20,
  },
  cardSide: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    padding: 0,
  },
  frontInput: {
    minHeight: 120,
    textAlign: 'center',
  },
  backInput: {
    minHeight: 120,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  dividerIcon: {
    paddingHorizontal: 12,
  },
  removeButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    marginBottom: 16,
  },
  addButtonDisabled: {
    backgroundColor: '#F5F5F5',
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addButtonTextDisabled: {
    color: '#999999',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  saveButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  stepDotActive: {
    backgroundColor: '#000000',
    transform: [{ scale: 1.2 }],
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  previousButton: {
    paddingLeft: 12,
  },
  nextButton: {
    paddingRight: 12,
  },
  navigationButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginHorizontal: 8,
  },
  selectionContainer: {
    flex: 1,
  },
  cardsContainer: {
    flex: 1,
    position: 'relative',
  },
  addCardButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  addCardButtonDisabled: {
    backgroundColor: '#F0F0F0',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  removeCardButton: {
    padding: 4,
  },
  selectionScreen: {
    flex: 1,
    paddingTop: 8,
  },
  selectionSection: {
    marginBottom: 32,
  },
  selectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  categoryCard: {
    width: 140,
    height: 160,
    marginRight: 16,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    padding: 16,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedCategoryCard: {
    backgroundColor: '#000000',
    borderColor: '#000000',
    transform: [{ scale: 1.02 }],
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedCategoryIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  selectedCategoryName: {
    color: '#FFFFFF',
  },
  categoryIndicator: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
  },
  selectedCategoryIndicator: {
    backgroundColor: '#FFFFFF',
  },
  studySetsContainer: {
    paddingHorizontal: 16,
  },
  studySetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedStudySetCard: {
    backgroundColor: '#000000',
    borderColor: '#000000',
    transform: [{ scale: 1.01 }],
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  studySetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studySetIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedStudySetIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  studySetInfo: {
    flex: 1,
  },
  studySetName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  selectedStudySetName: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  checkmarkContainer: {
    marginLeft: 12,
  },
  stepHeader: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  activeStepDot: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  activeStepLine: {
    backgroundColor: '#000000',
  },
  stepTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  stepText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    flex: 1,
  },
  activeStepText: {
    color: '#000000',
    fontWeight: '600',
  },
  sectionHeader: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  selectionDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  studySetsScrollView: {
    maxHeight: 400,
  },
});

export default AddFlashcardScreen; 