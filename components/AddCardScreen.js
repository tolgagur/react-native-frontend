import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');
const CARD_PADDING = 16;
const CARD_WIDTH = (width - (CARD_PADDING * 3)) / 2;

const AddCardScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { categoryId, studySetId } = route.params;
  const [cards, setCards] = useState([{ front: '', back: '' }]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddCard = () => {
    const currentCard = cards[currentIndex];
    if (!currentCard.front.trim() || !currentCard.back.trim()) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('flashcard.errors.emptyFields'),
        visibilityTime: 3000,
        position: 'top',
        backgroundColor: '#1C1C1E',
      });
      return;
    }

    if (cards.length >= 50) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('flashcard.errors.maxCards'),
        visibilityTime: 3000,
        position: 'top',
        backgroundColor: '#1C1C1E',
      });
      return;
    }

    setCards([...cards, { front: '', back: '' }]);
    setCurrentIndex(cards.length);
  };

  const handleUpdateCard = (field, value) => {
    const newCards = [...cards];
    newCards[currentIndex] = {
      ...newCards[currentIndex],
      [field]: value
    };
    setCards(newCards);
  };

  const handleSubmit = async () => {
    const validCards = cards.filter(card => card.front.trim() && card.back.trim());
    
    if (validCards.length === 0) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('flashcard.errors.emptyFields'),
        visibilityTime: 3000,
        position: 'top',
        backgroundColor: '#1C1C1E',
      });
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/flashcards/bulk', {
        flashcards: validCards.map(card => ({
          frontContent: card.front.trim(),
          backContent: card.back.trim(),
          categoryId: parseInt(categoryId),
          studySetId: parseInt(studySetId)
        }))
      });

      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('flashcard.success.created'),
        visibilityTime: 3000,
        position: 'top',
        backgroundColor: '#1C1C1E',
      });

      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('flashcard.errors.createError'),
        visibilityTime: 3000,
        position: 'top',
        backgroundColor: '#1C1C1E',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#666666" />
            </TouchableOpacity>
            <View style={styles.cardCounter}>
              <Text style={styles.cardCounterText}>
                {currentIndex + 1} / {cards.length}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.addButton, (!cards[currentIndex].front.trim() || !cards[currentIndex].back.trim()) && styles.disabled]}
              onPress={handleAddCard}
              disabled={!cards[currentIndex].front.trim() || !cards[currentIndex].back.trim()}
            >
              <Ionicons name="add" size={24} color={!cards[currentIndex].front.trim() || !cards[currentIndex].back.trim() ? "#CCD0D5" : "#1C1C1E"} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.cardsContainer}>
            <View style={[styles.card, styles.cardFront]}>
              <View style={styles.cardHeader}>
                <Ionicons name="albums-outline" size={20} color="#666666" />
                <Text style={styles.cardLabel}>{t('flashcard.frontSide')}</Text>
              </View>
              <TextInput
                style={styles.modernInput}
                value={cards[currentIndex].front}
                onChangeText={(text) => handleUpdateCard('front', text)}
                placeholder={t('flashcard.frontPlaceholder')}
                multiline
                textAlignVertical="top"
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                selectionColor="#2196F3"
                autoCapitalize="none"
                blurOnSubmit={false}
              />
              <View style={styles.cardFooter}>
                <Text style={styles.characterCount}>
                  {cards[currentIndex].front.length}/100
                </Text>
              </View>
            </View>

            <View style={[styles.card, styles.cardBack]}>
              <View style={styles.cardHeader}>
                <Ionicons name="albums-outline" size={20} color="#666666" />
                <Text style={styles.cardLabel}>{t('flashcard.backSide')}</Text>
              </View>
              <TextInput
                style={styles.modernInput}
                value={cards[currentIndex].back}
                onChangeText={(text) => handleUpdateCard('back', text)}
                placeholder={t('flashcard.backPlaceholder')}
                multiline
                textAlignVertical="top"
                placeholderTextColor="#999"
              />
              <View style={styles.cardFooter}>
                <Text style={styles.characterCount}>
                  {cards[currentIndex].back.length}/100
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={[styles.navButton, currentIndex === 0 && styles.disabled]}
              onPress={handlePrevCard}
              disabled={currentIndex === 0}
            >
              <Ionicons name="chevron-back" size={24} color={currentIndex === 0 ? "#CCD0D5" : "#1C1C1E"} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navButton, currentIndex === cards.length - 1 && styles.disabled]}
              onPress={handleNextCard}
              disabled={currentIndex === cards.length - 1}
            >
              <Ionicons name="chevron-forward" size={24} color={currentIndex === cards.length - 1 ? "#CCD0D5" : "#1C1C1E"} />
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (isLoading || cards.every(card => !card.front.trim() || !card.back.trim())) && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={isLoading || cards.every(card => !card.front.trim() || !card.back.trim())}
            >
              <Text style={[
                styles.submitButtonText,
                (isLoading || cards.every(card => !card.front.trim() || !card.back.trim())) && styles.disabledButtonText
              ]}>
                {isLoading ? t('common.loading') : t('common.save')}
              </Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  cardCounter: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cardCounterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: CARD_PADDING,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  card: {
    width: CARD_WIDTH,
    height: 300,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardFront: {
    backgroundColor: '#FFFFFF',
  },
  cardBack: {
    backgroundColor: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 8,
  },
  cardInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    textAlignVertical: 'top',
    padding: 0,
  },
  modernInput: {
    flex: 1,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    minHeight: 120,
    color: '#333333',
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginVertical: 8,
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#666666',
  },
  bottomContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
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
});

export default AddCardScreen; 