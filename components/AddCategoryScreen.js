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
    if (name.length < 2) {
      setNameError(t('categories.errors.nameTooShort'));
      return false;
    }
    if (name.length > 50) {
      setNameError(t('categories.errors.nameTooLong'));
      return false;
    }
    setNameError('');
    return true;
  };

  const validateDescription = () => {
    if (description.length > 500) {
      setDescriptionError(t('categories.errors.descriptionTooLong'));
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
    if (!name.trim() || isLoading) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('categories.errors.nameRequired'),
        visibilityTime: 3000,
        position: 'top',
      });
      return;
    }

    if (name.length < 2 || name.length > 50) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('categories.errors.nameInvalid'),
        visibilityTime: 3000,
        position: 'top',
      });
      return;
    }

    if (description && description.length > 500) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('categories.errors.descriptionTooLong'),
        visibilityTime: 3000,
        position: 'top',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/categories', {
        name: name.trim(),
        description: description.trim() || null,
        color: selectedColor?.color || '#F5F5F5',
        icon: selectedIcon?.name || 'folder-outline'
      });
      
      // Sadece basit bir geçiş ile sayfayı kapat
      navigation.goBack();
      setTimeout(() => {
        navigation.navigate('Home', { shouldRefresh: true });
      }, 100);

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
    <View style={styles.stepIndicatorContainer}>
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
        <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
        <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
        <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
        <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]} />
      </View>
    </View>
  );

  const renderStep1 = () => (
    <Animated.View style={[styles.step, { opacity: fadeAnim }]}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepDescription}>
          {t('categories.steps.name.description')}
        </Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.modernInput}
          placeholder={t('categories.steps.name.placeholder')}
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
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View style={[styles.step, { opacity: fadeAnim }]}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepDescription}>
          {t('categories.steps.description.description')}
        </Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.modernInput, styles.textArea]}
          placeholder={t('categories.steps.description.placeholder')}
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
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View style={[styles.step, { opacity: fadeAnim }]}>
      <View style={styles.stepHeader}>
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
            style={styles.colorGrid}
          >
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color.id}
                style={[
                  styles.colorItem,
                  selectedColor?.id === color.id && styles.colorItemSelected
                ]}
                onPress={() => setSelectedColor(color)}
              >
                <View style={[styles.colorContainer, { backgroundColor: color.color }]}>
                  {selectedColor?.id === color.id && (
                    <Ionicons name="checkmark" size={20} color="#666666" />
                  )}
                </View>
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
              color="#FFFFFF" 
            />
          </TouchableOpacity>
          <View style={styles.stepIndicatorContainer}>
            <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '600' }}>
              {t('categories.newCategory')}
            </Text>
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
              style={[styles.button, !name.trim() && styles.buttonDisabled]}
              onPress={nextStep}
              disabled={!name.trim()}
            >
              <Text style={styles.buttonText}>
                {t('categories.buttons.continue')}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.button,
                (isLoading || name.length < 2 || name.length > 50 || description.length > 500) && styles.buttonDisabled
              ]}
              onPress={handleSubmit}
              disabled={isLoading || name.length < 2 || name.length > 50 || description.length > 500}
            >
              <Text style={styles.buttonText}>
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
    backgroundColor: '#000000',
  },
  keyboardView: {
    flex: 1,
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
    paddingVertical: 8,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2C2C2E',
    transform: [{ scale: 1 }],
  },
  stepDotActive: {
    backgroundColor: '#FFFFFF',
    transform: [{ scale: 1.2 }],
  },
  stepLine: {
    width: 80,
    height: 2,
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
    flex: 1,
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
    color: '#FF453A',
    fontSize: 15,
    marginTop: 8,
    marginLeft: 8,
    fontWeight: '500',
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  colorGrid: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  colorItem: {
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  colorItemSelected: {
    transform: [{ scale: 1.05 }],
  },
  colorContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
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
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: '#1C1C1E',
  },
  iconItemSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    marginBottom: 8,
  },
  iconLabel: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    backgroundColor: '#000000',
  },
  button: {
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
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  clearSelectionWrapper: {
    width: 120,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  clearSelectionPlaceholder: {
    width: 120,
    height: 36,
  },
  clearSelection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    minWidth: 120,
  },
  clearSelectionText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  appearanceContainer: {
    flex: 1,
    marginTop: 12,
  },
  sectionContainer: {
    marginBottom: 8,
  },
  iconSectionContainer: {
    marginTop: 0,
  },
});

export default AddCategoryScreen; 