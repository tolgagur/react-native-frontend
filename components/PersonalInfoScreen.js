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

const PersonalInfoScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialUserData, setInitialUserData] = useState(null);
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    timeZone: '',
    level: 0,
    experiencePoints: 0,
    totalFlashcards: 0,
    studyTimeMinutes: 0,
    successRate: 0,
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/me');
      setUserData(response.data);
      setInitialUserData(response.data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('profile.fetchError'),
      });
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    if (!initialUserData) return false;
    return (
      initialUserData.firstName !== userData.firstName ||
      initialUserData.lastName !== userData.lastName
    );
  };

  const handleSave = async () => {
    if (!hasChanges()) return;

    try {
      setSaving(true);
      await api.put('/users/me', {
        firstName: userData.firstName,
        lastName: userData.lastName,
      });
      
      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('profile.updateSuccess'),
        visibilityTime: 3000,
        position: 'top',
      });

      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('profile.updateError'),
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.title}>Kişisel Bilgiler</Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleSave}
            disabled={!hasChanges() || saving}
          >
            <Text style={[styles.editButtonText, (!hasChanges() || saving) && styles.editButtonDisabled]}>
              {saving ? t('common.loading') : t('common.update')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('profile.username')}</Text>
              <Text style={styles.value}>{userData.username}</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('profile.email')}</Text>
              <Text style={styles.value}>{userData.email}</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('profile.firstName')}</Text>
              <TextInput
                style={styles.input}
                value={userData.firstName}
                onChangeText={(text) => setUserData(prev => ({ ...prev, firstName: text }))}
                placeholder={t('profile.enterFirstName')}
                placeholderTextColor="#8E8E93"
                selectionColor="#007AFF"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('profile.lastName')}</Text>
              <TextInput
                style={styles.input}
                value={userData.lastName}
                onChangeText={(text) => setUserData(prev => ({ ...prev, lastName: text }))}
                placeholder={t('profile.enterLastName')}
                placeholderTextColor="#8E8E93"
                selectionColor="#007AFF"
              />
            </View>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('profile.level')}</Text>
              <Text style={styles.value}>{userData.level}</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('profile.experiencePoints')}</Text>
              <Text style={styles.value}>{userData.experiencePoints} XP</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('profile.totalFlashcards')}</Text>
              <Text style={styles.value}>{userData.totalFlashcards}</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('profile.studyTime')}</Text>
              <Text style={styles.value}>{userData.studyTimeMinutes} {t('profile.minutes')}</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('profile.successRate')}</Text>
              <Text style={styles.value}>%{(userData.successRate * 100).toFixed(1)}</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  editButtonDisabled: {
    color: '#2C2C2E',
  },
  content: {
    flex: 1,
  },
  formSection: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#2C2C2E',
    padding: 12,
    borderRadius: 8,
  },
  input: {
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#2C2C2E',
    padding: 12,
    borderRadius: 8,
  },
});

export default PersonalInfoScreen; 