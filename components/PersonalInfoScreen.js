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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import api from '../services/api';

const PersonalInfoScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/users/me', {
        firstName: userData.firstName,
        lastName: userData.lastName,
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
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <Text style={styles.headerTitle}>{t('profile.personalInfo')}</Text>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <View style={styles.infoItem}>
            <Text style={styles.label}>{t('profile.username')}</Text>
            <Text style={styles.value}>{userData.username}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>{t('profile.email')}</Text>
            <Text style={styles.value}>{userData.email}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>{t('profile.firstName')}</Text>
            <TextInput
              style={styles.input}
              value={userData.firstName}
              onChangeText={(text) => setUserData(prev => ({ ...prev, firstName: text }))}
              placeholder={t('profile.enterFirstName')}
            />
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>{t('profile.lastName')}</Text>
            <TextInput
              style={styles.input}
              value={userData.lastName}
              onChangeText={(text) => setUserData(prev => ({ ...prev, lastName: text }))}
              placeholder={t('profile.enterLastName')}
            />
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>{t('profile.level')}</Text>
            <Text style={styles.value}>{userData.level}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>{t('profile.experiencePoints')}</Text>
            <Text style={styles.value}>{userData.experiencePoints} XP</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>{t('profile.totalFlashcards')}</Text>
            <Text style={styles.value}>{userData.totalFlashcards}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>{t('profile.studyTime')}</Text>
            <Text style={styles.value}>{userData.studyTimeMinutes} {t('profile.minutes')}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>{t('profile.successRate')}</Text>
            <Text style={styles.value}>%{(userData.successRate * 100).toFixed(1)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.updateButton, saving && styles.updateButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.updateButtonText}>
            {saving ? t('common.loading') : t('common.update')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  infoItem: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: '#000',
  },
  input: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 8,
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  updateButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  updateButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PersonalInfoScreen; 