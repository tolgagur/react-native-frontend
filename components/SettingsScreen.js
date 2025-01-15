import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
  TouchableWithoutFeedback,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import Toast from 'react-native-toast-message';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.5;

const SettingsScreen = ({ navigation }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('tr');
  const [isLoading, setIsLoading] = useState(false);

  const modalY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          modalY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > MODAL_HEIGHT / 3) {
          closeModal();
        } else {
          Animated.spring(modalY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const showModal = () => {
    setIsModalVisible(true);
    Animated.parallel([
      Animated.timing(modalY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(modalY, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsModalVisible(false);
    });
  };

  const languages = [
    { id: 'tr', name: 'Türkçe', icon: '🇹🇷' },
    { id: 'en', name: 'English', icon: '🇬🇧' },
    { id: 'de', name: 'Deutsch', icon: '🇩🇪' },
    { id: 'fr', name: 'Français', icon: '🇫🇷' },
  ];

  const handleLanguageSelect = async (langId) => {
    setSelectedLanguage(langId);
    closeModal();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#2C2C2C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ayarlar</Text>
        </View>

        <TouchableOpacity 
          style={styles.languageButton} 
          onPress={showModal}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="language" size={24} color="#2C2C2C" />
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Dil Seçimi</Text>
              <Text style={styles.buttonSubtitle}>
                {languages.find(lang => lang.id === selectedLanguage)?.name}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#2C2C2C" />
          </View>
        </TouchableOpacity>

        <Modal
          visible={isModalVisible}
          transparent
          animationType="none"
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback onPress={closeModal}>
              <Animated.View 
                style={[
                  styles.overlay,
                  { opacity: overlayOpacity }
                ]} 
              />
            </TouchableWithoutFeedback>
            
            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [{ translateY: modalY }],
                },
              ]}
              {...panResponder.panHandlers}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLine} />
                <Text style={styles.modalTitle}>Dil Seçimi</Text>
              </View>

              {languages.map((language) => (
                <TouchableOpacity
                  key={language.id}
                  style={[
                    styles.languageOption,
                    selectedLanguage === language.id && styles.selectedLanguage,
                  ]}
                  onPress={() => handleLanguageSelect(language.id)}
                >
                  <Text style={styles.languageIcon}>{language.icon}</Text>
                  <Text style={styles.languageName}>{language.name}</Text>
                  {selectedLanguage === language.id && (
                    <Ionicons name="checkmark" size={24} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </Animated.View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  languageButton: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C2C2C',
  },
  buttonSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    height: MODAL_HEIGHT,
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalHeaderLine: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  selectedLanguage: {
    backgroundColor: '#F5F5F5',
  },
  languageIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    flex: 1,
    fontSize: 16,
    color: '#2C2C2C',
  },
});

export default SettingsScreen; 