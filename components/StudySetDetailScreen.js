import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  FlatList,
  Dimensions,
  Animated,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

const StudySetDetailScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState('all'); // 'all', 'mastered', 'learning', 'notStarted'
  const [isLoading, setIsLoading] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const HEADER_MAX_HEIGHT = Platform.OS === 'ios' ? 140 : 120;
  const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 90 : 70;
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

  // Header animasyonları için değerler
  const headerTransform = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -HEADER_SCROLL_DISTANCE/3],
    extrapolate: 'clamp',
  });

  const titleTransform = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, HEADER_SCROLL_DISTANCE/3],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE/2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const { studySet } = route.params;

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="create-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{studySet.name}</Text>
        <Text style={styles.subtitle}>{studySet.description}</Text>
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Ionicons name="documents-outline" size={24} color="#FFFFFF" />
        <Text style={styles.statNumber}>{studySet.totalCards || 1}</Text>
        <Text style={styles.statLabel}>{t('studySet.stats.total')}</Text>
      </View>
      
      <View style={styles.statCard}>
        <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
        <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{studySet.masteredCards || 0}</Text>
        <Text style={styles.statLabel}>{t('studySet.stats.mastered')}</Text>
      </View>
      
      <View style={styles.statCard}>
        <Ionicons name="time-outline" size={24} color="#FFC107" />
        <Text style={[styles.statNumber, { color: '#FFC107' }]}>{studySet.learningCards || 0}</Text>
        <Text style={styles.statLabel}>{t('studySet.stats.learning')}</Text>
      </View>
    </View>
  );

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity style={styles.startButton} onPress={handleStartStudy}>
        <Ionicons name="play" size={24} color="#000000" />
        <Text style={styles.startButtonText}>{t('studySet.actions.start')}</Text>
      </TouchableOpacity>

      <View style={styles.secondaryActions}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleQuickReview}>
          <Ionicons name="flash" size={24} color="#FFFFFF" />
          <Text style={styles.secondaryButtonText}>{t('studySet.actions.quickReview')}</Text>
          <Text style={styles.secondaryButtonSubtext}>{t('studySet.actions.quickReviewDesc')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handlePracticeTest}>
          <Ionicons name="document-text" size={24} color="#FFFFFF" />
          <Text style={styles.secondaryButtonText}>{t('studySet.actions.test')}</Text>
          <Text style={styles.secondaryButtonSubtext}>{t('studySet.actions.testDesc')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity 
        style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
        onPress={() => setSelectedTab('all')}
      >
        <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>
          {t('studySet.tabs.all')} ({studySet.totalCards || 0})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, selectedTab === 'mastered' && styles.activeTab]}
        onPress={() => setSelectedTab('mastered')}
      >
        <Text style={[styles.tabText, selectedTab === 'mastered' && styles.activeTabText]}>
          {t('studySet.tabs.mastered')} ({studySet.masteredCards || 0})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, selectedTab === 'learning' && styles.activeTab]}
        onPress={() => setSelectedTab('learning')}
      >
        <Text style={[styles.tabText, selectedTab === 'learning' && styles.activeTabText]}>
          {t('studySet.tabs.learning')} ({studySet.learningCards || 0})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderCards = () => (
    <View style={styles.cardsContainer}>
      {studySet.flashcards?.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="documents-outline" size={48} color="#8E8E93" />
          </View>
          <Text style={styles.emptyText}>{t('studySet.empty')}</Text>
          <Text style={styles.emptySubtext}>{t('studySet.emptySubtext')}</Text>
        </View>
      ) : (
        studySet.flashcards?.map((card, index) => (
          <View key={index} style={styles.cardItem}>
            <View style={styles.cardStatus}>
              <View style={[styles.statusDot, { 
                backgroundColor: card.status === 'MASTERED' ? '#4CAF50' :
                               card.status === 'LEARNING' ? '#FFC107' : '#8E8E93'
              }]} />
              <Text style={styles.statusText}>
                {t(`studySet.cardStatus.${card.status?.toLowerCase() || 'notStarted'}`)}
              </Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{t('studySet.cardLabels.front')}</Text>
              <Text style={styles.cardText}>{card.frontContent}</Text>
              {card.frontHint && (
                <Text style={styles.cardHint}>
                  {t('studySet.cardLabels.hint')}: {card.frontHint}
                </Text>
              )}
              <View style={styles.cardDivider} />
              <Text style={styles.cardTitle}>{t('studySet.cardLabels.back')}</Text>
              <Text style={styles.cardText}>{card.backContent}</Text>
              {card.backExplanation && (
                <Text style={styles.cardHint}>
                  {t('studySet.cardLabels.explanation')}: {card.backExplanation}
                </Text>
              )}
            </View>
          </View>
        ))
      )}
    </View>
  );

  // Eylem işleyicileri
  const handleStartStudy = () => {
    navigation.navigate('StudyMode', { studySet, mode: 'normal' });
  };

  const handleQuickReview = () => {
    navigation.navigate('StudyMode', { studySet, mode: 'quick' });
  };

  const handlePracticeTest = () => {
    navigation.navigate('StudyMode', { studySet, mode: 'test' });
  };

  const handleEdit = () => {
    navigation.navigate('EditStudySet', { studySet });
  };

  const handleShare = () => {
    // Share fonksiyonunu implement et
    Toast.show({
      type: 'info',
      text1: 'Yakında',
      text2: 'Bu özellik yakında kullanıma sunulacak',
      position: 'top',
    });
  };

  const handleStudyAll = () => {
    setSelectedTab('all');
  };

  const handleStudyMastered = () => {
    setSelectedTab('mastered');
  };

  const handleStudyLearning = () => {
    setSelectedTab('learning');
  };

  const renderCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.flashcard}
      onPress={() => navigation.navigate('CardDetail', { card: item })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.frontTitle || 'Başlıksız'}</Text>
        <View style={styles.cardStatus}>
          <Ionicons 
            name={
              item.status === 'MASTERED' ? 'checkmark-circle' :
              item.status === 'LEARNING' ? 'time' : 'ellipse-outline'
            } 
            size={16} 
            color={
              item.status === 'MASTERED' ? '#4CAF50' :
              item.status === 'LEARNING' ? '#FF9800' : '#666666'
            } 
          />
          <Text style={[styles.statusText, {
            color: item.status === 'MASTERED' ? '#4CAF50' :
                  item.status === 'LEARNING' ? '#FF9800' : '#666666'
          }]}>
            {item.status === 'MASTERED' ? 'Öğrenildi' :
             item.status === 'LEARNING' ? 'Öğreniliyor' : 'Başlanmadı'}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.cardSide}>
          <Text style={styles.sideLabel}>Ön Yüz</Text>
          <Text style={styles.cardText} numberOfLines={2}>{item.frontContent}</Text>
          {item.frontHint && (
            <Text style={styles.cardHint} numberOfLines={1}>İpucu: {item.frontHint}</Text>
          )}
        </View>
        
        <View style={styles.cardDivider} />
        
        <View style={styles.cardSide}>
          <Text style={styles.sideLabel}>Arka Yüz</Text>
          <Text style={styles.cardText} numberOfLines={2}>{item.backContent}</Text>
          {item.backExplanation && (
            <Text style={styles.cardExplanation} numberOfLines={1}>
              Açıklama: {item.backExplanation}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.studyStats}>
          <Text style={styles.studyStatText}>
            Doğru: {item.correctCount} | Yanlış: {item.incorrectCount} | 
            Başarı: %{item.successRate}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const filteredCards = studySet.flashcards.filter(card => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'mastered') return card.status === 'MASTERED';
    if (selectedTab === 'learning') return card.status === 'LEARNING';
    return card.status === 'NOT_STARTED';
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderStats()}
        {renderActions()}
        {renderTabs()}
        {renderCards()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#000000',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
  },
  actionsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 4,
  },
  secondaryButtonSubtext: {
    fontSize: 13,
    color: '#8E8E93',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  tab: {
    marginRight: 16,
    paddingVertical: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 15,
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cardsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  cardItem: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    overflow: 'hidden',
  },
  cardStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#2C2C2E',
    marginVertical: 16,
  },
  flashcard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardSide: {
    marginBottom: 12,
  },
  sideLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  cardHint: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
  cardExplanation: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  studyStats: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  studyStatText: {
    fontSize: 12,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#8E8E93',
  },
});

export default StudySetDetailScreen; 