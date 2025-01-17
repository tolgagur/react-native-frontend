import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import api from '../services/api';

const ChangePasswordScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [initialFormData, setInitialFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const hasChanges = () => {
    const isAllFieldsFilled = formData.currentPassword.trim() !== '' && 
                            formData.newPassword.trim() !== '' && 
                            formData.confirmPassword.trim() !== '';

    if (!isAllFieldsFilled) return false;

    return (
      formData.currentPassword !== initialFormData.currentPassword ||
      formData.newPassword !== initialFormData.newPassword ||
      formData.confirmPassword !== initialFormData.confirmPassword
    );
  };

  const handleUpdatePassword = async () => {
    if (!validateForm()) return;
    if (!hasChanges()) return;

    try {
      setLoading(true);
      await api.put('/users/me/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      navigation.goBack();
    } catch (error) {
      console.error('Şifre güncelleme hatası:', error.response?.data || error.message);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('profile.passwordUpdateError'),
        visibilityTime: 3000,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('profile.passwordRequiredFields'),
        visibilityTime: 3000,
        position: 'top',
      });
      return false;
    }

    if (formData.newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('profile.passwordTooShort'),
        visibilityTime: 3000,
        position: 'top',
      });
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('profile.passwordsDoNotMatch'),
        visibilityTime: 3000,
        position: 'top',
      });
      return false;
    }

    return true;
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <Text style={styles.headerTitle}>{t('profile.changePassword')}</Text>

      <View style={styles.content}>
        <View style={styles.section}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('profile.currentPassword')}</Text>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.input}
                value={formData.currentPassword}
                onChangeText={(text) => setFormData(prev => ({ ...prev, currentPassword: text }))}
                secureTextEntry={!showPasswords.current}
                placeholder={t('profile.enterCurrentPassword')}
              />
              <TouchableOpacity 
                onPress={() => togglePasswordVisibility('current')}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showPasswords.current ? "eye-off" : "eye"} 
                  size={24} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('profile.newPassword')}</Text>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.input}
                value={formData.newPassword}
                onChangeText={(text) => setFormData(prev => ({ ...prev, newPassword: text }))}
                secureTextEntry={!showPasswords.new}
                placeholder={t('profile.enterNewPassword')}
              />
              <TouchableOpacity 
                onPress={() => togglePasswordVisibility('new')}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showPasswords.new ? "eye-off" : "eye"} 
                  size={24} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('profile.confirmPassword')}</Text>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.input}
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                secureTextEntry={!showPasswords.confirm}
                placeholder={t('profile.enterConfirmPassword')}
              />
              <TouchableOpacity 
                onPress={() => togglePasswordVisibility('confirm')}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showPasswords.confirm ? "eye-off" : "eye"} 
                  size={24} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.updateButton,
            (!hasChanges() || loading) && styles.updateButtonDisabled
          ]}
          onPress={handleUpdatePassword}
          disabled={!hasChanges() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.updateButtonText}>
              {t('common.update')}
            </Text>
          )}
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
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  eyeIcon: {
    padding: 8,
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

export default ChangePasswordScreen; 