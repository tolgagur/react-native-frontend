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
      
      navigation.goBack();
      setTimeout(() => {
        navigation.navigate('StudySet', { 
          category: selectedCategory,
          shouldRefresh: true 
        });
      }, 100);

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
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
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
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
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
        <Text style={styles.stepDescription}>
          {t('studySet.steps.category.description')}
        </Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryCard,
              selectedCategory?.id === category.id && styles.selectedCategoryCard,
              categoryId && category.id !== categoryId && styles.categoryCardDisabled
            ]}
            onPress={() => !categoryId || category.id === categoryId ? setSelectedCategory(category) : null}
            disabled={categoryId && category.id !== categoryId}
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
                selectedCategory?.id === category.id && styles.selectedCategoryName,
                categoryId && category.id !== categoryId && styles.categoryTextDisabled
              ]}>
                {category.name}
              </Text>
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
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => step > 1 ? prevStep() : navigation.goBack()}
          >
            <Ionicons 
              name="chevron-back" 
              size={24} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
          <View style={styles.stepIndicatorContainer}>
            <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '600' }}>
              {t('studySet.addNew')}
            </Text>
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
                ((name.length < 2 || name.length > 100) && step === 1) && styles.buttonDisabled
              ]}
              onPress={nextStep}
              disabled={(name.length < 2 || name.length > 100) && step === 1}
            >
              <Text style={styles.nextButtonText}>
                {t('studySet.buttons.continue')}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.submitButton,
                (isLoading || name.length < 2 || name.length > 100 || description.length > 500 || !selectedCategory) && styles.buttonDisabled
              ]}
              onPress={handleSubmit}
              disabled={isLoading || name.length < 2 || name.length > 100 || description.length > 500 || !selectedCategory}
            >
              <Text style={styles.submitButtonText}>
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
    backgroundColor: '#000000',
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2C2C2E',
  },
  stepDotActive: {
    backgroundColor: '#FFFFFF',
  },
  stepLine: {
    width: 80,
    height: 1,
    backgroundColor: '#2C2C2E',
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: '#FFFFFF',
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
  stepDescription: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#1C1C1E',
    overflow: 'hidden',
  },
  modernInput: {
    flex: 1,
    height: 44,
    fontSize: 17,
    color: '#FFFFFF',
    textAlignVertical: 'top',
    paddingHorizontal: 16,
    backgroundColor: '#1C1C1E',
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
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  categoryCard: {
    width: '100%',
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#1C1C1E',
    padding: 16,
    borderWidth: 0,
  },
  selectedCategoryCard: {
    backgroundColor: '#2C2C2E',
  },
  categoryCardDisabled: {
    opacity: 0.5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedCategoryName: {
    color: '#FFFFFF',
  },
  categoryTextDisabled: {
    color: '#666666',
  },
  footer: {
    padding: 20,
    backgroundColor: '#000000',
  },
  nextButton: {
    backgroundColor: '#30D158',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: undefined,
    alignSelf: 'stretch',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#30D158',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: undefined,
    alignSelf: 'stretch',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default AddStudySetScreen; 