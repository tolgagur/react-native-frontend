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
  const { studySet } = route.params;
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

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#666666" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleEdit}
          >
            <Ionicons name="create-outline" size={22} color="#666666" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={22} color="#666666" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderTitle = () => (
    <View style={styles.titleContainer}>
      <Text style={styles.setName} numberOfLines={1}>{studySet.name}</Text>
      {studySet.description && (
        <Text style={styles.setDescription} numberOfLines={1}>
          {studySet.description}
        </Text>
      )}
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <TouchableOpacity style={styles.statCard} onPress={() => handleStudyAll()}>
        <Text style={styles.statNumber}>{studySet.totalCards}</Text>
        <Text style={styles.statLabel}>Toplam Kart</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.statCard} onPress={() => handleStudyMastered()}>
        <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{studySet.masteredCards}</Text>
        <Text style={styles.statLabel}>Öğrenildi</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.statCard} onPress={() => handleStudyLearning()}>
        <Text style={[styles.statNumber, { color: '#FF9800' }]}>{studySet.learningCards}</Text>
        <Text style={styles.statLabel}>Öğreniliyor</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStudyActions = () => (
    <View style={styles.studyActions}>
      <TouchableOpacity 
        style={[styles.studyButton, styles.primaryButton]} 
        onPress={handleStartStudy}
      >
        <Ionicons name="play-circle" size={24} color="#FFFFFF" />
        <Text style={styles.primaryButtonText}>Çalışmaya Başla</Text>
      </TouchableOpacity>
      
      <View style={styles.secondaryActions}>
        <TouchableOpacity 
          style={[styles.studyButton, styles.secondaryButton]}
          onPress={handleQuickReview}
        >
          <Ionicons name="flash" size={20} color="#007AFF" />
          <Text style={styles.secondaryButtonText}>Hızlı Tekrar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.studyButton, styles.secondaryButton]}
          onPress={handlePracticeTest}
        >
          <Ionicons name="document-text" size={20} color="#007AFF" />
          <Text style={styles.secondaryButtonText}>Test</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
        onPress={() => setSelectedTab('all')}
      >
        <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>
          Tümü ({studySet.totalCards})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, selectedTab === 'mastered' && styles.activeTab]}
        onPress={() => setSelectedTab('mastered')}
      >
        <Text style={[styles.tabText, selectedTab === 'mastered' && styles.activeTabText]}>
          Öğrenildi ({studySet.masteredCards})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, selectedTab === 'learning' && styles.activeTab]}
        onPress={() => setSelectedTab('learning')}
      >
        <Text style={[styles.tabText, selectedTab === 'learning' && styles.activeTabText]}>
          Öğreniliyor ({studySet.learningCards})
        </Text>
      </TouchableOpacity>
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
      <Animated.FlatList
        data={filteredCards}
        renderItem={renderCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.cardsContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {renderTitle()}
            {renderStats()}
            {renderStudyActions()}
            {renderTabs()}
          </>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  titleContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  setName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  setDescription: {
    fontSize: 14,
    color: '#666666',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  studyActions: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F0F7FF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  cardsContainer: {
    paddingBottom: 16,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  cardStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    marginLeft: 4,
  },
  cardContent: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
  },
  cardSide: {
    marginBottom: 12,
  },
  sideLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: '#333333',
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
  cardDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 8,
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
});

export default StudySetDetailScreen; 