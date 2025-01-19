import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const COLORS = [
  { id: 1, color: '#E3F2FD', name: 'lightBlue' },
  { id: 2, color: '#FFF3E0', name: 'lightOrange' },
  { id: 3, color: '#E8F5E9', name: 'lightGreen' },
  { id: 4, color: '#F3E5F5', name: 'lightPurple' },
  { id: 5, color: '#FBE9E7', name: 'lightRed' },
  { id: 6, color: '#F5F5F5', name: 'gray' },
];

const ICONS = [
  { id: 1, name: 'book', label: 'book' },
  { id: 2, name: 'school', label: 'school' },
  { id: 3, name: 'language', label: 'language' },
  { id: 4, name: 'calculator', label: 'math' },
  { id: 5, name: 'flask', label: 'science' },
  { id: 6, name: 'brush', label: 'art' },
];

const iconOptions = [
  'folder',
  'grid',
  'albums',
  'book',
  'documents',
  'library',
  'school',
  'pencil',
  'bookmark',
  'star',
  'heart',
  'flag',
  'trophy',
  'ribbon',
  'medal',
  'gift'
];

const AddCategoryScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [step, setStep] = useState(1);
  const fadeAnim = useState(new Animated.Value(1))[0];

  const validateName = () => {
    if (!name.trim()) {
      setNameError(t('categories.errors.nameRequired'));
      return false;
    }
    if (name.length < 3) {
      setNameError(t('categories.errors.nameTooShort'));
      return false;
    }
    setNameError('');
    return true;
  };

  const validateDescription = () => {
    if (!description.trim()) {
      setDescriptionError(t('categories.errors.descriptionRequired'));
      return false;
    }
    if (description.length < 10) {
      setDescriptionError(t('categories.errors.descriptionTooShort'));
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
    if (!name.trim() || !description.trim() || isLoading) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('categories.errors.fieldsRequired'),
        visibilityTime: 3000,
        position: 'top',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/categories', {
        name: name.trim(),
        description: description.trim(),
        color: selectedColor?.color || '#F5F5F5',
        icon: selectedIcon?.name || 'folder-outline'
      });

      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('categories.success.created'),
        visibilityTime: 2000,
        position: 'top',
        topOffset: 50
      });
      
      navigation.replace('Home', { shouldRefresh: true });

    } catch (error) {
      console.error('Kategori oluşturma hatası:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.response?.data?.message || t('categories.errors.createError'),
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
    <Animated.View style={[styles.step, { opacity: fadeAnim }]}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>{t('categories.steps.name.title')}</Text>
        <Text style={styles.stepDescription}>
          {t('categories.steps.name.description')}
        </Text>
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="folder-outline" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={t('categories.steps.name.placeholder')}
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
        <Text style={styles.stepTitle}>{t('categories.steps.description.title')}</Text>
        <Text style={styles.stepDescription}>
          {t('categories.steps.description.description')}
        </Text>
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="document-text-outline" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={t('categories.steps.description.placeholder')}
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

  const renderStep3 = () => (
    <Animated.View style={[styles.step, { opacity: fadeAnim }]}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>{t('categories.steps.appearance.title')}</Text>
        <Text style={styles.stepDescription}>
          {t('categories.steps.appearance.description')}
        </Text>
      </View>

      <View style={styles.appearanceContainer}>
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitle}>
            <Text style={styles.sectionTitleText}>{t('categories.steps.appearance.colorSelection')}</Text>
            <View style={styles.clearSelectionWrapper}>
              {selectedColor ? (
                <TouchableOpacity 
                  onPress={() => setSelectedColor(null)}
                  style={styles.clearSelection}
                >
                  <Text style={styles.clearSelectionText}>{t('categories.steps.appearance.clearSelection')}</Text>
                </TouchableOpacity>
              ) : <View style={styles.clearSelectionPlaceholder} />}
            </View>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.colorList}
            contentContainerStyle={styles.colorListContent}
          >
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color.id}
                style={[
                  styles.colorItem,
                  { backgroundColor: color.color },
                  selectedColor?.id === color.id && styles.colorItemSelected
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor?.id === color.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#666666" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.iconSectionContainer}>
          <View style={styles.sectionTitle}>
            <Text style={styles.sectionTitleText}>{t('categories.steps.appearance.iconSelection')}</Text>
            <View style={styles.clearSelectionWrapper}>
              {selectedIcon ? (
                <TouchableOpacity 
                  onPress={() => setSelectedIcon(null)}
                  style={styles.clearSelection}
                >
                  <Text style={styles.clearSelectionText}>{t('categories.steps.appearance.clearSelection')}</Text>
                </TouchableOpacity>
              ) : <View style={styles.clearSelectionPlaceholder} />}
            </View>
          </View>
          <View style={styles.iconGrid}>
            {ICONS.map((icon) => (
              <TouchableOpacity
                key={icon.id}
                style={[
                  styles.iconItem,
                  selectedIcon?.id === icon.id && styles.iconItemSelected
                ]}
                onPress={() => setSelectedIcon(icon)}
              >
                <View style={[
                  styles.iconContainer, 
                  { backgroundColor: selectedColor?.color || '#F5F5F5' }
                ]}>
                  <Ionicons name={icon.name} size={24} color="#666666" />
                </View>
                <Text style={styles.iconLabel}>{t(`categories.icons.${icon.label}`)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
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
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>

        <View style={styles.footer}>
          {step < 3 ? (
            <TouchableOpacity 
              style={[
                styles.nextButton,
                ((!name.trim() && step === 1) || (!description.trim() && step === 2)) && styles.disabledButton
              ]}
              onPress={nextStep}
              disabled={(!name.trim() && step === 1) || (!description.trim() && step === 2)}
            >
              <Text style={[
                styles.nextButtonText,
                ((!name.trim() && step === 1) || (!description.trim() && step === 2)) && styles.disabledButtonText
              ]}>
                {t('categories.buttons.continue')}
              </Text>
              <Ionicons 
                name="arrow-forward" 
                size={24} 
                color={((!name.trim() && step === 1) || (!description.trim() && step === 2)) ? "#CCD0D5" : "#FFFFFF"} 
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.submitButton,
                (isLoading || !name.trim()) && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={isLoading || !name.trim()}
            >
              <Text style={[
                styles.submitButtonText,
                (isLoading || !name.trim()) && styles.disabledButtonText
              ]}>
                {isLoading ? t('common.loading') : t('common.save')}
              </Text>
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
    flex: 1,
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
  sectionTitle: {
    marginTop: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  colorList: {
    height: 64,
    marginBottom: 32,
  },
  colorListContent: {
    alignItems: 'center',
  },
  colorItem: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  colorItemSelected: {
    borderWidth: 2,
    borderColor: '#666666',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  iconItem: {
    width: '31%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderRadius: 16,
    padding: 8,
  },
  iconItemSelected: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#666666',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
  },
  iconLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
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
  clearSelectionWrapper: {
    width: 120,
    height: 32,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  clearSelectionPlaceholder: {
    width: 120,
    height: 32,
  },
  clearSelection: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 120,
  },
  clearSelectionText: {
    fontSize: 13,
    color: '#666666',
  },
  appearanceContainer: {
    flex: 1,
    marginTop: 8,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  iconSectionContainer: {
    marginBottom: 24,
  },
});

export default AddCategoryScreen; 