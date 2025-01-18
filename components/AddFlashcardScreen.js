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
  };

  const handleContinue = () => {
    navigation.navigate('AddCard', {
      categoryId: selectedCategory.id,
      studySetId: selectedStudySet.id
    });
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

      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('flashcard.success.created'),
      });

      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.response?.data?.message || t('flashcard.errors.createError'),
      });
    } finally {
      setLoading(false);
    }
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Ionicons 
                name="chevron-back" 
                size={24} 
                color="#666666" 
              />
            </TouchableOpacity>
            {renderStepIndicator()}
          </View>

          <ScrollView style={styles.content}>
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
                    <View style={[
                      styles.categoryIcon,
                      { backgroundColor: category.color || '#F5F5F5' }
                    ]}>
                      <Ionicons 
                        name={category.icon || 'folder-outline'} 
                        size={24} 
                        color="#000000" 
                      />
                    </View>
                    <Text style={[
                      styles.categoryName,
                      selectedCategory?.id === category.id && styles.selectedCategoryName
                    ]}>
                      {category.name}
                    </Text>
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
                          <View style={styles.studySetIcon}>
                            <Ionicons name="book-outline" size={20} color="#000000" />
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
          </ScrollView>

          {selectedStudySet && (
            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.continueButton}
                onPress={handleContinue}
              >
                <Text style={styles.continueButtonText}>{t('common.continue')}</Text>
                <Ionicons name="arrow-forward" size={24} color="#FFFFFF" style={styles.continueButtonIcon} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
      <Toast />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  stepIndicatorContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 48,
    marginRight: 48,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
  },
  activeStepDot: {
    backgroundColor: '#000000',
  },
  stepLine: {
    width: 64,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  activeStepLine: {
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
  selectionSection: {
    padding: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 24,
  },
  categoriesContainer: {
    paddingVertical: 8,
  },
  categoryCard: {
    width: 120,
    height: 120,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedCategoryCard: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  selectedCategoryName: {
    color: '#FFFFFF',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  selectedCategoryDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  studySetsContainer: {
    paddingTop: 8,
  },
  studySetCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  studySetContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
  studySetName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  selectedStudySetName: {
    color: '#FFFFFF',
  },
  cardSection: {
    flex: 1,
    padding: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  cardCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  removeButton: {
    padding: 8,
  },
  cardContent: {
    flex: 1,
  },
  cardSide: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  cardNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  navigationButton: {
    padding: 8,
  },
  navigationButtonDisabled: {
    opacity: 0.5,
  },
  addButton: {
    marginHorizontal: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
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
  continueButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  continueButtonIcon: {
    marginLeft: 4,
  },
});

export default AddFlashcardScreen; 