import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const AddStudySetScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const { categoryId } = route.params || {};

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
      if (categoryId) {
        const category = response.data.find(cat => cat.id === categoryId);
        if (category) {
          setSelectedCategory(category);
        }
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('studySet.errors.loadCategories')
      });
    }
  };

  const validateName = () => {
    if (!name.trim()) {
      setNameError(t('studySet.errors.nameRequired'));
      return false;
    }
    if (name.length < 2) {
      setNameError(t('studySet.errors.nameTooShort'));
      return false;
    }
    if (name.length > 100) {
      setNameError(t('studySet.errors.nameTooLong'));
      return false;
    }
    setNameError('');
    return true;
  };

  const validateDescription = () => {
    if (description.length > 500) {
      setDescriptionError(t('studySet.errors.descriptionTooLong'));
      return false;
    }
    setDescriptionError('');
    return true;
  };

  const nextStep = () => {
    if (step === 1 && !validateName()) return;
    if (step === 2 && !validateDescription()) return;
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!name.trim() || isLoading) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('studySet.errors.nameRequired'),
        visibilityTime: 3000,
        position: 'top',
      });
      return;
    }

    if (name.length < 2 || name.length > 100) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('studySet.errors.nameInvalid'),
        visibilityTime: 3000,
        position: 'top',
      });
      return;
    }

    if (description && description.length > 500) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('studySet.errors.descriptionTooLong'),
        visibilityTime: 3000,
        position: 'top',
      });
      return;
    }

    if (!selectedCategory) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('studySet.errors.categoryRequired'),
        visibilityTime: 3000,
        position: 'top',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/study-sets', {
        name: name.trim(),
        description: description.trim() || null,
        categoryId: selectedCategory.id
      });

      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('studySet.success.created'),
        visibilityTime: 2000,
        position: 'top',
        topOffset: 50
      });
      
      navigation.replace('StudySet', { 
        category: selectedCategory,
        shouldRefresh: true 
      });

    } catch (error) {
      console.error('Çalışma seti oluşturma hatası:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.response?.data?.message || t('studySet.errors.createError'),
        visibilityTime: 2000,
        position: 'top',
        topOffset: 50
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
      <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
      <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
      <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
      <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]} />
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.step}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>{t('studySet.steps.name.title')}</Text>
        <Text style={styles.stepDescription}>
          {t('studySet.steps.name.description')}
        </Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.modernInput}
          placeholder={t('studySet.steps.name.title')}
          value={name}
          onChangeText={setName}
          placeholderTextColor="rgba(0, 0, 0, 0.4)"
          selectionColor="#2196F3"
          editable={!isLoading}
          onBlur={validateName}
          autoCapitalize="none"
          blurOnSubmit={false}
        />
      </View>
      {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.step}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>{t('studySet.steps.description.title')}</Text>
        <Text style={styles.stepDescription}>
          {t('studySet.steps.description.description')}
        </Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.modernInput, styles.textArea]}
          placeholder={t('studySet.steps.description.title')}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholderTextColor="rgba(0, 0, 0, 0.4)"
          selectionColor="#2196F3"
          editable={!isLoading}
          onBlur={validateDescription}
          autoCapitalize="none"
          blurOnSubmit={false}
        />
      </View>
      {descriptionError ? <Text style={styles.errorText}>{descriptionError}</Text> : null}
    </View>
  );

  const renderCategorySelection = () => (
    <View style={styles.step}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>{t('studySet.steps.category.title')}</Text>
        <Text style={styles.stepDescription}>
          {t('studySet.steps.category.description')}
        </Text>
      </View>

      <ScrollView 
        style={styles.categoriesContainer}
        showsVerticalScrollIndicator={false}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryCard,
              selectedCategory?.id === category.id && styles.categoryCardSelected,
              categoryId && category.id !== categoryId && styles.categoryCardDisabled
            ]}
            onPress={() => !categoryId || category.id === categoryId ? setSelectedCategory(category) : null}
            disabled={categoryId && category.id !== categoryId}
          >
            <View style={styles.cardContent}>
              <View style={[styles.categoryIcon, { backgroundColor: category.color || '#F5F5F5' }]}>
                <Ionicons name={category.icon || 'folder-outline'} size={24} color="#666666" />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={[
                  styles.categoryName,
                  categoryId && category.id !== categoryId && styles.categoryTextDisabled
                ]}>
                  {category.name}
                </Text>
                {category.description && (
                  <Text style={[
                    styles.categoryDescription,
                    categoryId && category.id !== categoryId && styles.categoryTextDisabled
                  ]} numberOfLines={1}>
                    {category.description}
                  </Text>
                )}
              </View>
              {selectedCategory?.id === category.id && (
                <View style={styles.selectedIndicator}>
                  <Ionicons name="checkmark-circle" size={24} color="#666666" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => step > 1 ? prevStep() : navigation.goBack()}
          >
            <Ionicons 
              name="chevron-back" 
              size={24} 
              color="#666666" 
            />
          </TouchableOpacity>
          <View style={styles.stepIndicatorContainer}>
            {renderStepIndicator()}
          </View>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderCategorySelection()}
        </ScrollView>

        <View style={styles.footer}>
          {step < 3 ? (
            <TouchableOpacity 
              style={[
                styles.nextButton,
                ((name.length < 2 || name.length > 100) && step === 1) && styles.disabledButton
              ]}
              onPress={nextStep}
              disabled={(name.length < 2 || name.length > 100) && step === 1}
            >
              <Text style={[
                styles.nextButtonText,
                ((name.length < 2 || name.length > 100) && step === 1) && styles.disabledButtonText
              ]}>
                {t('studySet.buttons.continue')}
              </Text>
              <Ionicons 
                name="arrow-forward" 
                size={24} 
                color={((name.length < 2 || name.length > 100) && step === 1) ? "#CCD0D5" : "#FFFFFF"} 
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.submitButton,
                (isLoading || name.length < 2 || name.length > 100 || description.length > 500 || !selectedCategory) && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={isLoading || name.length < 2 || name.length > 100 || description.length > 500 || !selectedCategory}
            >
              <Text style={[
                styles.submitButtonText,
                (isLoading || name.length < 2 || name.length > 100 || description.length > 500 || !selectedCategory) && styles.disabledButtonText
              ]}>
                {isLoading ? t('common.loading') : t('common.save')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
    marginLeft: 32,
    marginRight: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  stepDotActive: {
    backgroundColor: '#666666',
  },
  stepLine: {
    width: 80,
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: '#666666',
  },
  content: {
    flex: 1,
  },
  step: {
    padding: 20,
  },
  stepHeader: {
    marginBottom: 24,
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
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        backgroundColor: '#F8F9FA',
        borderWidth: 0,
      },
      android: {
        elevation: 2,
      }
    }),
  },
  modernInput: {
    flex: 1,
    height: 60,
    fontSize: 16,
    color: '#333333',
    textAlignVertical: 'top',
    paddingHorizontal: 16,
  },
  textArea: {
    height: 120,
    paddingTop: 16,
    paddingBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  categoriesContainer: {
    flex: 1,
    marginTop: 8,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryCardSelected: {
    backgroundColor: '#F8F9FA',
    borderColor: '#666666',
  },
  categoryCardDisabled: {
    opacity: 0.5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666666',
  },
  categoryTextDisabled: {
    color: '#999999',
  },
  selectedIndicator: {
    marginLeft: 12,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#F1F2F3',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#CCD0D5',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default AddStudySetScreen; 