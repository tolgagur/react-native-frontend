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
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const AddFlashcardScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [frontTitle, setFrontTitle] = useState('');
  const [frontContent, setFrontContent] = useState('');
  const [backContent, setBackContent] = useState('');
  const [categories, setCategories] = useState([]);
  const [studySets, setStudySets] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedStudySet, setSelectedStudySet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchStudySets(selectedCategory.id);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Kategori yükleme hatası:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('flashcard.errors.loadCategories'),
        visibilityTime: 3000,
        position: 'top',
      });
    }
  };

  const fetchStudySets = async (categoryId) => {
    try {
      console.log('Kategori ID ile çalışma setleri getiriliyor:', categoryId);
      const response = await api.get(`/study-sets/by-category/${categoryId}`);
      console.log('Çalışma Setleri API Yanıtı:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        console.log('Setler array olarak ayarlanıyor:', response.data);
        setStudySets(response.data);
      } else if (response.data && Array.isArray(response.data.content)) {
        console.log('Setler content array olarak ayarlanıyor:', response.data.content);
        setStudySets(response.data.content);
      } else {
        console.warn('API yanıtı beklenen formatta değil:', response.data);
        setStudySets([]);
      }
    } catch (error) {
      console.error('Set yükleme hatası:', error.response || error);
      setStudySets([]);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('flashcard.errors.loadStudySets'),
        visibilityTime: 3000,
        position: 'top',
      });
    }
  };

  const handleSubmit = async () => {
    if (!frontTitle.trim() || !frontContent.trim() || !backContent.trim() || !selectedCategory || !selectedStudySet) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('flashcard.errors.requiredFields'),
        visibilityTime: 3000,
        position: 'top',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/flashcards', {
        frontTitle: frontTitle.trim(),
        frontContent: frontContent.trim(),
        backContent: backContent.trim(),
        categoryId: selectedCategory.id,
        studySetId: selectedStudySet.id
      });

      console.log('Kart oluşturuldu:', response.data);
      setIsSubmitted(true);

      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('flashcard.success.created'),
        visibilityTime: 2000,
        position: 'top',
      });
      
      setTimeout(() => {
        navigation.goBack();
      }, 2000);

    } catch (error) {
      console.error('Kart oluşturma hatası:', error.response?.data || error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.response?.data?.message || t('flashcard.errors.createError'),
        visibilityTime: 2000,
        position: 'top',
      });
      setIsSubmitted(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => navigation.goBack()}
          >
            <View style={styles.closeButtonContainer}>
              <Ionicons name="close" size={20} color="#000" />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>{t('flashcard.addNew')}</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('flashcard.front')}</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('flashcard.title')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('flashcard.titlePlaceholder')}
                value={frontTitle}
                onChangeText={setFrontTitle}
                placeholderTextColor="#999"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('flashcard.content')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t('flashcard.contentPlaceholder')}
                value={frontContent}
                onChangeText={setFrontContent}
                multiline
                numberOfLines={4}
                placeholderTextColor="#999"
                editable={!isLoading}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('flashcard.back')}</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('flashcard.content')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t('flashcard.answerPlaceholder')}
                value={backContent}
                onChangeText={setBackContent}
                multiline
                numberOfLines={4}
                placeholderTextColor="#999"
                editable={!isLoading}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('flashcard.details')}</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('flashcard.category')}</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoryList}
              >
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryItem,
                      selectedCategory?.id === category.id && styles.categoryItemSelected
                    ]}
                    onPress={() => {
                      console.log('Kategori seçildi:', category);
                      setSelectedCategory(category);
                      setSelectedStudySet(null);
                      fetchStudySets(category.id);
                    }}
                  >
                    <Text 
                      style={[
                        styles.categoryItemText,
                        selectedCategory?.id === category.id && styles.categoryItemTextSelected
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {selectedCategory && studySets && studySets.length > 0 ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('flashcard.studySet')}</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryList}
                >
                  {studySets.map((studySet) => (
                    <TouchableOpacity
                      key={studySet.id}
                      style={[
                        styles.categoryItem,
                        selectedStudySet?.id === studySet.id && styles.categoryItemSelected
                      ]}
                      onPress={() => setSelectedStudySet(studySet)}
                    >
                      <Text 
                        style={[
                          styles.categoryItemText,
                          selectedStudySet?.id === studySet.id && styles.categoryItemTextSelected
                        ]}
                      >
                        {studySet.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : selectedCategory ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('flashcard.studySet')}</Text>
                <Text style={styles.emptyText}>{t('flashcard.noStudySets')}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>

        <TouchableOpacity 
          style={[
            styles.submitButton, 
            (!frontTitle.trim() || !frontContent.trim() || !backContent.trim() || 
             !selectedCategory || !selectedStudySet || isLoading || isSubmitted) && 
            styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!frontTitle.trim() || !frontContent.trim() || !backContent.trim() || 
                   !selectedCategory || !selectedStudySet || isLoading || isSubmitted}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? t('common.loading') : isSubmitted ? t('flashcard.success.created') : t('common.add')}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 16,
    paddingBottom: 16,
  },
  categoryList: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  categoryItemSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryItemText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryItemTextSelected: {
    color: '#FFF',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    margin: 20,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
});

export default AddFlashcardScreen; 