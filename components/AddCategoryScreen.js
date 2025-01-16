import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const AddCategoryScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || isSubmitted) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('categories.errors.nameRequired'),
        visibilityTime: 3000,
        position: 'top',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/categories', {
        name: name.trim(),
        description: description.trim(),
        parentId: null
      });

      console.log('Kategori oluşturuldu:', response.data);
      setIsSubmitted(true);

      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('categories.success.created'),
        visibilityTime: 2000,
        position: 'top',
        topOffset: 50
      });
      
      setTimeout(() => {
        navigation.goBack();
      }, 2000);

    } catch (error) {
      console.error('Kategori oluşturma hatası:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.response?.data?.message || t('categories.errors.createError'),
        visibilityTime: 2000,
        position: 'top',
        topOffset: 50
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
          <Text style={styles.headerTitle}>{t('categories.addNew')}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('categories.name')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('categories.name')}
              value={name}
              onChangeText={setName}
              placeholderTextColor="#999"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('categories.description')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={t('categories.description')}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholderTextColor="#999"
              editable={!isLoading}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.submitButton, 
            (!name.trim() || isLoading || isSubmitted) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!name.trim() || isLoading || isSubmitted}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? t('common.loading') : isSubmitted ? t('categories.success.created') : t('common.add')}
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
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
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
});

export default AddCategoryScreen; 