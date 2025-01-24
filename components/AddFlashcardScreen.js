import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import api from '../services/api';

const AddFlashcardScreen = ({ navigation }) => {
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
  const [isCardScreen, setIsCardScreen] = useState(false);

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
    setIsCardScreen(false);
  };

  const handleContinue = () => {
    if (!selectedCategory || !selectedStudySet) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('flashcard.errors.selectRequired'),
        visibilityTime: 3000,
        position: 'top',
      });
      return;
    }

    setIsCardScreen(true);
    setFlashcards([{
      frontContent: '',
      backContent: '',
      difficultyLevel: 1,
      tags: []
    }]);
    setCurrentStep(0);
  };

  const updateCard = (index, field, value) => {
    const newFlashcards = [...flashcards];
    newFlashcards[index] = {
      ...newFlashcards[index],
      [field]: value
    };
    setFlashcards(newFlashcards);
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
    setFlashcards([...flashcards, { frontContent: '', backContent: '', difficultyLevel: 1, tags: [] }]);
    setCurrentStep(flashcards.length);
  };

  const removeCard = (index) => {
    if (flashcards.length === 1) return;
    const newFlashcards = flashcards.filter((_, i) => i !== index);
    setFlashcards(newFlashcards);
    if (currentStep >= newFlashcards.length) {
      setCurrentStep(newFlashcards.length - 1);
    }
  };

  const handleDeleteCard = () => {
    if (flashcards.length <= 1) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('flashcard.errors.minimumOneCard'),
        visibilityTime: 3000,
        position: 'top',
      });
      return;
    }

    const newFlashcards = flashcards.filter((_, index) => index !== currentStep);
    setFlashcards(newFlashcards);
    
    // Eğer silinen kart son karttaysa, bir önceki karta geç
    if (currentStep === flashcards.length - 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    if (!selectedCategory || !selectedStudySet) {
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

    if (validFlashcards.length === 0) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('flashcard.errors.frontRequired'),
      });
      return;
    }

    try {
      setLoading(true);
      await api.post('/flashcards/bulk', {
        flashcards: validFlashcards.map(card => ({
          ...card,
          categoryId: parseInt(selectedCategory.id),
          studySetId: parseInt(selectedStudySet.id)
        }))
      });

      // Sadece basit bir geçiş ile sayfayı kapat
      navigation.goBack();

    } catch (error) {
      console.error('Çalışma seti oluşturma hatası:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.response?.data?.message || t('flashcard.errors.createError'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = () => {
    const currentCard = flashcards[currentStep];
    if (!currentCard.frontContent.trim() || !currentCard.backContent.trim()) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('flashcard.errors.fillCurrentCard'),
        visibilityTime: 3000,
        position: 'top',
      });
      return;
    }

    if (flashcards.length >= 50) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('flashcard.errors.maxCards'),
        visibilityTime: 3000,
        position: 'top',
      });
      return;
    }

    setFlashcards([...flashcards, { frontContent: '', backContent: '', difficultyLevel: 1, tags: [] }]);
    setCurrentStep(flashcards.length);
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      <View style={[styles.stepDot, !selectedCategory && styles.activeStepDot]} />
      <View style={[styles.stepLine, selectedCategory && styles.activeStepLine]} />
      <View style={[styles.stepDot, selectedCategory && !selectedStudySet && styles.activeStepDot]} />
      <View style={[styles.stepLine, selectedStudySet && styles.activeStepLine]} />
      <View style={[styles.stepDot, selectedStudySet && styles.activeStepDot]} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? -20 : -20}
        enabled
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons 
              name="chevron-back" 
              size={24} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
          <View style={styles.stepIndicatorContainer}>
            <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '600' }}>
              {t('flashcard.addNew')}
            </Text>
          </View>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {!isCardScreen ? (
            <View style={styles.selectionSection}>
              <Text style={styles.stepTitle}>{t('flashcard.category')}</Text>
              <Text style={styles.stepDescription}>{t('flashcard.selectCategory')}</Text>
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
                    <View style={styles.cardContent}>
                      <View style={[
                        styles.categoryIcon,
                        { backgroundColor: category.color || '#000000' }
                      ]}>
                        <Ionicons 
                          name={category.icon || 'folder'} 
                          size={24} 
                          color={category.color ? '#1C1C1E' : '#FFFFFF'} 
                        />
                      </View>
                      <Text style={[
                        styles.categoryName,
                        selectedCategory?.id === category.id && styles.selectedCategoryName
                      ]}>
                        {category.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {selectedCategory && (
                <>
                  <Text style={[styles.stepTitle, { marginTop: 32 }]}>{t('flashcard.studySet')}</Text>
                  <Text style={styles.stepDescription}>{t('flashcard.selectStudySet')}</Text>
                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.studySetsContainer}
                  >
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
                          <View style={[styles.studySetIcon, { backgroundColor: selectedCategory.color || '#000000' }]}>
                            <Ionicons 
                              name="book" 
                              size={24} 
                              color={selectedCategory.color ? '#1C1C1E' : '#FFFFFF'} 
                            />
                          </View>
                          <Text style={[
                            styles.studySetName,
                            selectedStudySet?.id === studySet.id && styles.selectedStudySetName
                          ]}>
                            {studySet.name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}
            </View>
          ) : (
            <View style={styles.cardSection}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardCount}>
                  {currentStep + 1} / {flashcards.length}
                </Text>
                <TouchableOpacity
                  style={[styles.deleteCardButton, flashcards.length <= 1 && styles.disabledButton]}
                  onPress={handleDeleteCard}
                  disabled={flashcards.length <= 1}
                >
                  <Ionicons 
                    name="trash-outline" 
                    size={20} 
                    color={flashcards.length <= 1 ? "#8E8E93" : "#FFFFFF"} 
                  />
                  <Text style={[
                    styles.deleteCardText,
                    flashcards.length <= 1 && styles.disabledButtonText
                  ]}>
                    {t('common.delete')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.cardSide}>
                  <Text style={styles.inputLabel}>{t('flashcard.frontSide')}</Text>
                  <TextInput
                    style={styles.modernInput}
                    value={flashcards[currentStep].frontContent}
                    onChangeText={(text) => updateCard(currentStep, 'frontContent', text)}
                    placeholder={t('flashcard.frontPlaceholder')}
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    selectionColor="#FFFFFF"
                    multiline
                    maxLength={100}
                    textAlignVertical="top"
                    autoCapitalize="none"
                    blurOnSubmit={false}
                  />
                </View>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <View style={styles.dividerIcon}>
                    <Ionicons name="swap-vertical" size={20} color="#8E8E93" />
                  </View>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.cardSide}>
                  <Text style={styles.inputLabel}>{t('flashcard.backSide')}</Text>
                  <TextInput
                    style={styles.modernInput}
                    value={flashcards[currentStep].backContent}
                    onChangeText={(text) => updateCard(currentStep, 'backContent', text)}
                    placeholder={t('flashcard.backPlaceholder')}
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    selectionColor="#FFFFFF"
                    multiline
                    maxLength={100}
                    textAlignVertical="top"
                    autoCapitalize="none"
                    blurOnSubmit={false}
                  />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {selectedStudySet && !isCardScreen && (
          <View style={styles.footerContainer}>
            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.continueButton}
                onPress={handleContinue}
              >
                <Text style={styles.continueButtonText}>{t('common.continue')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {selectedStudySet && isCardScreen && (
          <View style={styles.footerContainer}>
            <View style={styles.footer}>
              <View style={styles.cardNavigation}>
                <TouchableOpacity
                  style={[styles.navigationButton, currentStep === 0 && styles.disabledButton]}
                  onPress={() => setCurrentStep(currentStep - 1)}
                  disabled={currentStep === 0}
                >
                  <Ionicons 
                    name="chevron-back" 
                    size={24} 
                    color={currentStep === 0 ? "#8E8E93" : "#FFFFFF"} 
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddCard}
                  disabled={!flashcards[currentStep].frontContent.trim() || !flashcards[currentStep].backContent.trim()}
                >
                  <Ionicons 
                    name="add" 
                    size={24} 
                    color={!flashcards[currentStep].frontContent.trim() || !flashcards[currentStep].backContent.trim() ? "#8E8E93" : "#FFFFFF"} 
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.navigationButton, currentStep === flashcards.length - 1 && styles.disabledButton]}
                  onPress={() => setCurrentStep(currentStep + 1)}
                  disabled={currentStep === flashcards.length - 1}
                >
                  <Ionicons 
                    name="chevron-forward" 
                    size={24} 
                    color={currentStep === flashcards.length - 1 ? "#8E8E93" : "#FFFFFF"} 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!flashcards.some(card => card.frontContent.trim() && card.backContent.trim())) && styles.disabledButton
                ]}
                onPress={handleSave}
                disabled={!flashcards.some(card => card.frontContent.trim() && card.backContent.trim())}
              >
                <Text style={[
                  styles.saveButtonText,
                  (!flashcards.some(card => card.frontContent.trim() && card.backContent.trim())) && styles.disabledButtonText
                ]}>
                  {t('common.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardView: {
    flex: 1,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000000',
    height: 44,
    borderBottomWidth: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  stepIndicatorContainer: {
    flex: 1,
    alignItems: 'center',
    marginLeft: -40,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2C2C2E',
  },
  activeStepDot: {
    backgroundColor: '#FFFFFF',
  },
  stepLine: {
    width: 64,
    height: 2,
    backgroundColor: '#2C2C2E',
    marginHorizontal: 8,
  },
  activeStepLine: {
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === "ios" ? 120 : 100,
  },
  selectionSection: {
    padding: 24,
  },
  stepTitle: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 24,
  },
  stepDescription: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 24,
  },
  categoriesContainer: {
    paddingVertical: 8,
  },
  categoryCard: {
    width: 120,
    height: 120,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: '#1C1C1E',
    padding: 16,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderWidth: 0,
  },
  selectedCategoryCard: {
    backgroundColor: '#2C2C2E',
  },
  cardContent: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'left',
  },
  selectedCategoryName: {
    color: '#FFFFFF',
  },
  studySetsContainer: {
    paddingTop: 8,
  },
  studySetCard: {
    width: '100%',
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#1C1C1E',
    padding: 16,
    borderWidth: 0,
  },
  selectedStudySetCard: {
    backgroundColor: '#2C2C2E',
  },
  studySetContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studySetIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studySetName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedStudySetName: {
    color: '#FFFFFF',
  },
  cardSection: {
    flex: 1,
    padding: 16,
    minHeight: 400,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardContent: {
    flex: 1,
  },
  cardSide: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modernInput: {
    flex: 1,
    height: 44,
    fontSize: 17,
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 16,
    color: '#FFFFFF',
    textAlignVertical: 'top',
    borderWidth: 0,
    borderRadius: 8,
    marginVertical: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2C2C2E',
  },
  dividerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  cardNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  navigationButton: {
    padding: 8,
  },
  addButton: {
    marginHorizontal: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerContainer: {
    backgroundColor: '#000000',
    width: '100%',
  },
  footer: {
    padding: 20,
    backgroundColor: '#000000',
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  deleteCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteCardText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  continueButton: {
    backgroundColor: '#30D158',
    marginHorizontal: 0,
    marginVertical: 0,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: undefined,
    alignSelf: 'stretch',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#30D158',
    marginHorizontal: 0,
    marginVertical: 0,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: undefined,
    alignSelf: 'stretch',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: '#FFFFFF',
  },
});

export default AddFlashcardScreen; 