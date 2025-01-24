import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Animated,
  PanResponder,
  Dimensions
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';

const languages = [
  { id: 'TURKISH', name: 'Türkçe', icon: '🇹🇷' },
  { id: 'ENGLISH', name: 'English', icon: '🇬🇧' }
];

const LanguageModal = ({ visible, onClose, currentLanguage, onLanguageSelect }) => {
  const { t } = useTranslation();
  const { height: screenHeight } = Dimensions.get('window');
  const slideAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy >= 0) {
          const newValue = 1 - (gestureState.dy / (screenHeight * 0.5));
          slideAnim.setValue(Math.max(0, Math.min(1, newValue)));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50 || gestureState.vy > 0.5) {
          hideModal();
        } else {
          Animated.spring(slideAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8
          }).start();
        }
      },
    })
  ).current;

  React.useEffect(() => {
    if (visible) {
      slideAnim.setValue(0);
      fadeAnim.setValue(0);
      showModal();
    }
  }, [visible]);

  const showModal = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const getCurrentLanguageId = (lang) => {
    if (lang === 'tr') return 'TURKISH';
    if (lang === 'en') return 'ENGLISH';
    return lang;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={hideModal}
    >
      <Animated.View 
        style={[
          styles.modalOverlay,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <TouchableOpacity 
          style={{ flex: 1 }}
          onPress={hideModal}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [screenHeight, 0],
                }),
              },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalIndicator} />
          </View>
          {languages.map((lang, index) => (
            <TouchableOpacity
              key={lang.id}
              style={[
                styles.languageItem,
                index === 0 && styles.firstMenuItem,
                index === languages.length - 1 && styles.lastMenuItem,
                getCurrentLanguageId(currentLanguage) === lang.id && styles.selectedLanguageItem
              ]}
              onPress={() => {
                onLanguageSelect(lang.id);
                hideModal();
              }}
            >
              <View style={styles.languageInfo}>
                <View style={styles.iconContainer}>
                  <Text style={styles.languageIcon}>{lang.icon}</Text>
                </View>
                <Text style={styles.languageName}>{lang.name}</Text>
              </View>
              {getCurrentLanguageId(currentLanguage) === lang.id && (
                <Icon name="checkmark" size={22} color="#666" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
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
    backgroundColor: '#2C2C2E',
    borderRadius: 2,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  firstMenuItem: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  selectedLanguageItem: {
    backgroundColor: '#2C2C2E',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  languageIcon: {
    fontSize: 18,
  },
  languageName: {
    fontSize: 17,
    color: '#fff',
  },
});

export default LanguageModal; 