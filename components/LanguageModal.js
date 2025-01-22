import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';

const languages = [
  { id: 'TURKISH', name: 'Türkçe', icon: '🇹🇷' },
  { id: 'ENGLISH', name: 'English', icon: '🇬🇧' }
];

const LanguageModal = ({ visible, onClose, currentLanguage, onLanguageSelect }) => {
  const { t } = useTranslation();

  const getCurrentLanguageId = (lang) => {
    if (lang === 'tr') return 'TURKISH';
    if (lang === 'en') return 'ENGLISH';
    return lang;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <View style={styles.modalContent}>
          {languages.map((lang, index) => (
            <TouchableOpacity
              key={lang.id}
              style={[
                styles.languageItem,
                index === 0 && styles.firstMenuItem,
                index === languages.length - 1 && styles.lastMenuItem,
                getCurrentLanguageId(currentLanguage) === lang.id && styles.selectedLanguageItem
              ]}
              onPress={() => onLanguageSelect(lang.id)}
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
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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