import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/api';

const LoginScreen = ({ navigation, route }) => {
  const { onLoginSuccess } = route.params || {};
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    if (!formData.username || !formData.password) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('auth.login.errors.requiredFields'),
        visibilityTime: 3000,
        position: 'top',
      });
      return false;
    }

    if (formData.username.length < 3) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('auth.login.errors.usernameLength'),
        visibilityTime: 3000,
        position: 'top',
      });
      return false;
    }

    if (formData.password.length < 6) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('auth.login.errors.passwordLength'),
        visibilityTime: 3000,
        position: 'top',
      });
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      console.log('Login denemesi başlatılıyor...');
      const response = await authService.login({
        username: formData.username,
        password: formData.password,
      });
      
      console.log('Login yanıtı:', response);
      
      if (response && response.token) {
        console.log('Token başarıyla alındı:', response.token);
        Toast.show({
          type: 'success',
          text1: t('common.success'),
          text2: response.message || t('auth.login.loginSuccess'),
          visibilityTime: 3000,
          position: 'top',
        });
        if (onLoginSuccess) {
          onLoginSuccess(response.token, response.refreshToken);
        }
      } else {
        console.log('Token alınamadı:', response);
        throw new Error('Token alınamadı');
      }
    } catch (error) {
      console.error('Login hatası:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.response?.data?.message || t('auth.login.errors.invalidCredentials'),
        visibilityTime: 3000,
        position: 'top',
      });
    }
  };

  const handleRegisterPress = () => {
    navigation.navigate('Register');
  };

  const handleForgotPasswordPress = () => {
    navigation.navigate('ForgotPassword');
  };

  const isFormValid = () => {
    return formData.username && 
           formData.username.length >= 3 && 
           formData.password && 
           formData.password.length >= 6;
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="#007AFF" />
          </View>
          <Text style={styles.title}>{t('auth.login.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.login.subtitle')}</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Ionicons name="person" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('auth.login.username')}
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
              autoCapitalize="none"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('auth.login.password')}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry={!showPassword}
              placeholderTextColor="#666"
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPasswordPress}>
            <Text style={styles.forgotPasswordText}>{t('auth.login.forgotPassword')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.loginButton, 
              !isFormValid() && styles.disabledButton
            ]} 
            onPress={handleLogin}
            disabled={!isFormValid()}
          >
            <Text style={[
              styles.loginButtonText,
              !isFormValid() && styles.disabledButtonText
            ]}>{t('auth.login.loginButton')}</Text>
          </TouchableOpacity>

          <View style={styles.orContainer}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>{t('auth.login.or')}</Text>
            <View style={styles.orLine} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={24} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-apple" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={24} color="#4267B2" />
            </TouchableOpacity>
          </View>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>{t('auth.login.noAccount')} </Text>
            <TouchableOpacity onPress={handleRegisterPress}>
              <Text style={styles.registerLink}>{t('auth.login.register')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Toast />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
    backgroundColor: '#f8f8f8',
  },
  inputIcon: {
    marginRight: 10,
    color: '#007AFF',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#E1E1E1',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: '#999',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  orText: {
    color: '#666',
    marginHorizontal: 10,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  registerLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoginScreen; 