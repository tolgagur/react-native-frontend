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
  Platform,
  KeyboardAvoidingView,
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
  const [flashcards, setFlashcards] = useState([{
    frontTitle: '',
    frontContent: '',
    frontHint: '',
    backContent: '',
    backExplanation: '',
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

  const addNewCard = () => {
    const lastCard = flashcards[flashcards.length - 1];
    
    // Zorunlu alanların kontrolü
    if (!lastCard.frontContent.trim() || !lastCard.backContent.trim()) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('flashcard.errors.fillRequired'),
      });
      return;
    }

    setFlashcards([...flashcards, {
      frontTitle: '',
      frontContent: '',
      frontHint: '',
      backContent: '',
      backExplanation: '',
      difficultyLevel: 1,
      tags: [],
      categoryId: selectedCategory?.id,
      studySetId: selectedStudySet?.id
    }]);
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
    // Seçili kategori ve çalışma seti kontrolü
    if (!selectedCategory || !selectedStudySet) {
      console.log('Kategori veya çalışma seti seçili değil:', { selectedCategory, selectedStudySet });
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('flashcard.errors.requiredFields'),
      });
      return;
    }

    // Geçerli kartları filtrele ve formatla
    const validFlashcards = flashcards
      .filter(card => card.frontContent.trim() !== '' && card.backContent.trim() !== '')
      .map(card => ({
        frontTitle: card.frontTitle.trim(),
        frontContent: card.frontContent.trim(),
        frontHint: card.frontHint.trim(),
        backContent: card.backContent.trim(),
        backExplanation: card.backExplanation.trim(),
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

  const renderCard = (card, index) => (
    <View key={index} style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardNumber}>{t('flashcard.card')} {index + 1}</Text>
        {index > 0 && (
          <TouchableOpacity 
            onPress={() => removeCard(index)}
            style={styles.removeButton}
          >
            <Ionicons name="trash-outline" size={20} color="red" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('flashcard.frontTitle')}</Text>
        <TextInput
          style={styles.input}
          value={card.frontTitle}
          onChangeText={(text) => updateCard(index, 'frontTitle', text)}
          placeholder={t('flashcard.titlePlaceholder')}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('flashcard.frontContent')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={card.frontContent}
          onChangeText={(text) => updateCard(index, 'frontContent', text)}
          placeholder={t('flashcard.contentPlaceholder')}
          multiline
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('flashcard.frontHint')}</Text>
        <TextInput
          style={styles.input}
          value={card.frontHint}
          onChangeText={(text) => updateCard(index, 'frontHint', text)}
          placeholder={t('flashcard.hintPlaceholder')}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('flashcard.backContent')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={card.backContent}
          onChangeText={(text) => updateCard(index, 'backContent', text)}
          placeholder={t('flashcard.answerPlaceholder')}
          multiline
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('flashcard.backExplanation')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={card.backExplanation}
          onChangeText={(text) => updateCard(index, 'backExplanation', text)}
          placeholder={t('flashcard.explanationPlaceholder')}
          multiline
        />
      </View>
    </View>
  );

  // Kartların geçerliliğini kontrol eden fonksiyon
  const areAllCardsValid = () => {
    return flashcards.every(card => 
      card.frontContent.trim() !== '' && 
      card.backContent.trim() !== ''
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('flashcard.addNew')}</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('flashcard.category')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory?.id === category.id && styles.selectedCategory
                  ]}
                  onPress={() => handleCategorySelect(category)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    selectedCategory?.id === category.id && styles.selectedCategoryText
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {selectedCategory && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('flashcard.studySet')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
                {studySets.map((studySet) => (
                  <TouchableOpacity
                    key={studySet.id}
                    style={[
                      styles.categoryButton,
                      selectedStudySet?.id === studySet.id && styles.selectedCategory
                    ]}
                    onPress={() => handleStudySetSelect(studySet)}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      selectedStudySet?.id === studySet.id && styles.selectedCategoryText
                    ]}>
                      {studySet.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {selectedStudySet && (
            <>
              {flashcards.map((card, index) => renderCard(card, index))}
              
              <TouchableOpacity 
                style={[
                  styles.addButton,
                  (!areAllCardsValid()) && styles.addButtonDisabled
                ]}
                onPress={addNewCard}
                disabled={!areAllCardsValid()}
              >
                <Ionicons 
                  name="add-circle-outline" 
                  size={24} 
                  color={areAllCardsValid() ? "#007AFF" : "#999999"} 
                />
                <Text style={[
                  styles.addButtonText,
                  (!areAllCardsValid()) && styles.addButtonTextDisabled
                ]}>
                  {t('flashcard.addMore')}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>

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
      </KeyboardAvoidingView>
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
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
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
  cardContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '600',
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
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
});

export default AddFlashcardScreen; 