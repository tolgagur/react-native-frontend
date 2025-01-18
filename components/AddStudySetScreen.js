import React, { useState, useEffect } from 'react';
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
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const AddStudySetScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { categoryId } = route.params || {};
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [step, setStep] = useState(1);
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const fadeAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
      
      // Eğer categoryId varsa, o kategoriyi otomatik seç
      if (categoryId) {
        const category = response.data.find(cat => cat.id === categoryId);
        if (category) {
          setSelectedCategory(category);
        }
      }
    } catch (error) {
      console.error('Kategori yükleme hatası:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('studySet.errors.loadCategories'),
        visibilityTime: 3000,
        position: 'top',
      });
    }
  };

  const validateName = () => {
    if (!name.trim()) {
      setNameError('Set adı boş olamaz');
      return false;
    }
    if (name.length < 3) {
      setNameError('Set adı en az 3 karakter olmalıdır');
      return false;
    }
    setNameError('');
    return true;
  };

  const validateDescription = () => {
    if (!description.trim()) {
      setDescriptionError('Açıklama boş olamaz');
      return false;
    }
    if (description.length < 10) {
      setDescriptionError('Açıklama en az 10 karakter olmalıdır');
      return false;
    }
    setDescriptionError('');
    return true;
  };

  const nextStep = () => {
    if (step === 1 && !validateName()) return;
    if (step === 2 && !validateDescription()) return;

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setStep(step + 1);
  };

  const prevStep = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !selectedCategory || isSubmitted) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('studySet.errors.nameRequired'),
        visibilityTime: 3000,
        position: 'top',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/study-sets', {
        name: name.trim(),
        description: description.trim(),
        categoryId: selectedCategory.id
      });

      console.log('Çalışma seti oluşturuldu:', response.data);
      setIsSubmitted(true);

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
        shouldRefresh: true,
        newStudySet: response.data
      });

    } catch (error) {
      console.error('Set oluşturma hatası:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.response?.data?.message || t('studySet.errors.createError'),
        visibilityTime: 2000,
        position: 'top',
        topOffset: 50
      });
      setIsSubmitted(false);
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
    <Animated.View style={[styles.step, { opacity: fadeAnim }]}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Çalışma Seti Adı</Text>
        <Text style={styles.stepDescription}>
          Çalışma setiniz için akılda kalıcı bir isim belirleyin
        </Text>
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="book-outline" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Örn: İngilizce Kelimeler"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#999"
          editable={!isLoading}
          onBlur={validateName}
        />
      </View>
      {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View style={[styles.step, { opacity: fadeAnim }]}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Set Açıklaması</Text>
        <Text style={styles.stepDescription}>
          Setinizin içeriğini kısaca açıklayın
        </Text>
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="document-text-outline" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Setin amacını ve içeriğini açıklayın..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholderTextColor="#999"
          editable={!isLoading}
          onBlur={validateDescription}
        />
      </View>
      {descriptionError ? <Text style={styles.errorText}>{descriptionError}</Text> : null}
    </Animated.View>
  );

  const renderCategorySelection = () => (
    <Animated.View style={[styles.step, { opacity: fadeAnim }]}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Kategori Seçimi</Text>
        <Text style={styles.stepDescription}>
          Çalışma setinizi hangi kategoriye eklemek istediğinizi seçin
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
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => step > 1 ? prevStep() : navigation.goBack()}
          >
            <View style={styles.backButtonContainer}>
              <Ionicons 
                name={step > 1 ? "arrow-back" : "close"} 
                size={24} 
                color="#000" 
              />
            </View>
          </TouchableOpacity>
          {renderStepIndicator()}
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderCategorySelection()}
        </ScrollView>

        <View style={styles.footer}>
          {step < 3 ? (
            <TouchableOpacity 
              style={[styles.nextButton, !name.trim() && step === 1 && styles.buttonDisabled]}
              onPress={nextStep}
              disabled={!name.trim() && step === 1}
            >
              <Text style={styles.nextButtonText}>Devam</Text>
              <Ionicons name="arrow-forward" size={24} color="#FFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.submitButton, (!selectedCategory || isLoading) && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={!selectedCategory || isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Oluşturuluyor...' : 'Seti Oluştur'}
              </Text>
              {!isLoading && <Ionicons name="checkmark" size={24} color="#FFF" />}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  stepIndicator: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 56,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
  },
  stepDotActive: {
    backgroundColor: '#666666',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 16,
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
    backgroundColor: '#666666',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFF',
    marginRight: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#666666',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFF',
    marginRight: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default AddStudySetScreen; 