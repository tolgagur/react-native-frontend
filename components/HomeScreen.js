import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ onLogout }) => {
  const [categories] = useState([
    { 
      id: 1, 
      name: 'What is UX Design?', 
      icon: 'phone-portrait-outline',
      isCompleted: true 
    },
    { 
      id: 2, 
      name: 'UX Design Principles', 
      icon: 'grid-outline',
      isLocked: true 
    },
    { 
      id: 3, 
      name: 'Intro to Color Theory', 
      icon: 'color-palette-outline',
      isLocked: true 
    },
    { 
      id: 4, 
      name: 'Intro to Typography', 
      icon: 'text-outline',
      isLocked: true 
    },
    { 
      id: 5, 
      name: 'Level Test 1', 
      icon: 'trophy-outline',
      isLocked: true 
    },
  ]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const createOptions = [
    {
      id: 1,
      title: 'Yeni Kategori',
      subtitle: 'Kategori oluştur',
      icon: 'grid-outline',
      color: '#E3F2FD'
    },
    {
      id: 2,
      title: 'Çalışma Seti',
      subtitle: 'Yeni set oluştur',
      icon: 'albums-outline',
      color: '#FFF3E0'
    },
    {
      id: 3,
      title: 'Kart Ekle',
      subtitle: 'Yeni kart oluştur',
      icon: 'documents-outline',
      color: '#E8F5E9'
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Categories */}
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Getting Started with UX Design</Text>
          </View>
          
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                category.isCompleted && styles.completedCard
              ]}
            >
              <View style={styles.cardContent}>
                <View style={[styles.iconContainer, { backgroundColor: category.isCompleted ? '#E3F2FD' : '#F5F5F5' }]}>
                  <Ionicons 
                    name={category.icon} 
                    size={20} 
                    color={category.isCompleted ? '#007AFF' : '#666666'} 
                  />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </View>
              <View style={styles.statusContainer}>
                {category.isCompleted ? (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark-circle" size={24} color="#32CD32" />
                  </View>
                ) : category.isLocked ? (
                  <View style={styles.lock}>
                    <Ionicons name="lock-closed" size={20} color="#CCCCCC" />
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="home-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => setIsModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="#666666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={onLogout}>
            <Ionicons name="folder-outline" size={24} color="#666666" />
          </TouchableOpacity>
        </View>

        {/* Create Modal */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <Animated.View 
            style={styles.modalOverlay}
            activeOpacity={1}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => setIsModalVisible(false)}
            >
              <View />
            </TouchableOpacity>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalIndicator} />
                </View>

                {createOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.optionItem}
                    onPress={() => {
                      setIsModalVisible(false);
                    }}
                  >
                    <View style={[styles.optionIcon, { backgroundColor: option.color }]}>
                      <Ionicons name={option.icon} size={24} color="#333" />
                    </View>
                    <View style={styles.optionText}>
                      <Text style={styles.optionTitle}>{option.title}</Text>
                      <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: Platform.OS === 'android' ? 2 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000' : undefined,
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : undefined,
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : undefined,
    shadowRadius: Platform.OS === 'ios' ? 3.84 : undefined,
  },
  completedCard: {
    backgroundColor: '#F8F9FF',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  statusContainer: {
    marginLeft: 12,
  },
  checkmark: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lock: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
  },
  navItem: {
    padding: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 300,
    transform: [{ translateY: 0 }],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  modalContent: {
    padding: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginVertical: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen; 