import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

const StudyModeScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { studySet, mode = 'normal' } = route.params;
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [stats, setStats] = useState({
    correct: 0,
    incorrect: 0,
    remaining: studySet.flashcards?.length || 0,
  });

  const flipCard = () => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [
      { perspective: 1000 },
      { rotateY: frontInterpolate }
    ]
  };

  const backAnimatedStyle = {
    transform: [
      { perspective: 1000 },
      { rotateY: backInterpolate }
    ]
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={22} color="#FFFFFF" />
      </TouchableOpacity>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(currentCardIndex / (studySet.flashcards?.length || 1)) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {currentCardIndex + 1} / {studySet.flashcards?.length || 0}
        </Text>
      </View>
    </View>
  );

  const renderCard = () => (
    <View style={styles.cardContainer}>
      <TouchableOpacity 
        activeOpacity={1}
        onPress={flipCard}
        style={styles.cardWrapper}
      >
        <Animated.View style={[styles.card, frontAnimatedStyle]}>
          <Text style={styles.cardText}>
            {studySet.flashcards?.[currentCardIndex]?.frontContent}
          </Text>
          <View style={styles.flipHint}>
            <Ionicons name="repeat" size={20} color="#8E8E93" />
            <Text style={styles.flipHintText}>Kartı çevirmek için dokun</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
          <Text style={styles.cardText}>
            {studySet.flashcards?.[currentCardIndex]?.backContent}
          </Text>
          {studySet.flashcards?.[currentCardIndex]?.backExplanation && (
            <Text style={styles.explanationText}>
              {studySet.flashcards[currentCardIndex].backExplanation}
            </Text>
          )}
          <View style={styles.flipHint}>
            <Ionicons name="repeat" size={20} color="#8E8E93" />
            <Text style={styles.flipHintText}>Kartı çevirmek için dokun</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );

  const renderActions = () => (
    <View style={styles.actions}>
      <TouchableOpacity 
        style={[styles.actionButton, styles.incorrectButton]}
        onPress={() => handleResponse('incorrect')}
      >
        <View style={styles.actionIconContainer}>
          <Ionicons name="close" size={24} color="#FF3B30" />
        </View>
        <Text style={[styles.actionButtonText, styles.incorrectText]}>Bilmiyorum</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.actionButton, styles.correctButton]}
        onPress={() => handleResponse('correct')}
      >
        <View style={styles.actionIconContainer}>
          <Ionicons name="checkmark" size={24} color="#34C759" />
        </View>
        <Text style={[styles.actionButtonText, styles.correctText]}>Biliyorum</Text>
      </TouchableOpacity>
    </View>
  );

  const handleResponse = (response) => {
    const isCorrect = response === 'correct';
    setStats(prev => ({
      ...prev,
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      incorrect: !isCorrect ? prev.incorrect + 1 : prev.incorrect,
      remaining: prev.remaining - 1
    }));

    if (currentCardIndex < (studySet.flashcards?.length || 0) - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
      flipAnim.setValue(0);
    } else {
      navigation.replace('StudyComplete', {
        stats,
        studySet,
        mode
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderCard()}
      {renderActions()}
    </SafeAreaView>
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
    paddingTop: Platform.OS === 'android' ? 24 : 0,
    height: 60,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    marginLeft: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#1C1C1E',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  progressText: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 4,
  },
  cardContainer: {
    flex: 1,
    margin: 16,
  },
  cardWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardBack: {
    backgroundColor: '#1C1C1E',
    transform: [{ rotateY: '180deg' }],
  },
  cardText: {
    color: '#FFFFFF',
    fontSize: 28,
    textAlign: 'center',
    lineHeight: 36,
    fontWeight: '600',
  },
  explanationText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 22,
  },
  flipHint: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  flipHintText: {
    color: '#8E8E93',
    fontSize: 13,
    marginLeft: 6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  actionButton: {
    flex: 1,
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
  },
  incorrectButton: {
    borderColor: '#FF3B30',
  },
  correctButton: {
    borderColor: '#34C759',
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 8,
  },
  incorrectText: {
    color: '#FF3B30',
  },
  correctText: {
    color: '#34C759',
  },
});

export default StudyModeScreen; 