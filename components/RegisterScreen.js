import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { authService } from '../services/api';

const RegisterScreen = ({ navigation, route }) => {
  const { onRegisterSuccess } = route.params || {};
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password) {
      Toast.show({
        type: 'error',
        text1: 'Zorunlu Alanlar',
        text2: 'Lütfen tüm zorunlu alanları doldurun',
        visibilityTime: 3000,
        position: 'top',
      });
      return false;
    }

    if (formData.username.length < 3 || formData.username.length > 50) {
      Toast.show({
        type: 'error',
        text1: 'Kullanıcı Adı',
        text2: '3-50 karakter arasında olmalı',
        visibilityTime: 3000,
        position: 'top',
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Toast.show({
        type: 'error',
        text1: 'E-posta',
        text2: 'Geçerli bir e-posta adresi girin',
        visibilityTime: 3000,
        position: 'top',
      });
      return false;
    }

    if (formData.password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Şifre',
        text2: 'En az 6 karakter olmalı',
        visibilityTime: 3000,
        position: 'top',
      });
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const response = await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      
      if (response.token) {
        Toast.show({
          type: 'success',
          text1: 'Başarılı',
          text2: 'Hesabınız oluşturuldu',
          visibilityTime: 3000,
          position: 'top',
        });
        if (onRegisterSuccess) {
          onRegisterSuccess(response.token, response.refreshToken);
        }
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: error.response?.data?.message || 'Kayıt işlemi başarısız',
        visibilityTime: 3000,
        position: 'top',
      });
    }
  };

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  const isFormValid = () => {
    return formData.username && 
           formData.username.length >= 3 && 
           formData.email && 
           formData.password && 
           formData.password.length >= 6;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.logoContainer}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-add-outline" size={40} color="#007AFF" />
            </View>
            <Text style={styles.title}>Kayıt Ol</Text>
            <Text style={styles.subtitle}>Yeni bir hesap oluşturun</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={[styles.inputContainer, styles.requiredInput]}>
              <Ionicons name="person" size={20} color="#007AFF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Kullanıcı Adı"
                value={formData.username}
                onChangeText={(text) => setFormData({ ...formData, username: text })}
                autoCapitalize="none"
                placeholderTextColor="#666"
              />
              {!formData.username && <Text style={styles.requiredDot}>•</Text>}
            </View>

            <View style={[styles.inputContainer, styles.requiredInput]}>
              <Ionicons name="mail" size={20} color="#007AFF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="E-posta"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#666"
              />
              {!formData.email && <Text style={styles.requiredDot}>•</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ad"
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                autoCapitalize="words"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Soyad"
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                autoCapitalize="words"
                placeholderTextColor="#666"
              />
            </View>

            <View style={[styles.inputContainer, styles.requiredInput]}>
              <Ionicons name="lock-closed" size={20} color="#007AFF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Şifre"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry={!showPassword}
                placeholderTextColor="#666"
              />
              {!formData.password && <Text style={styles.requiredDot}>•</Text>}
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

            <TouchableOpacity 
              style={[
                styles.registerButton, 
                !isFormValid() && styles.disabledButton
              ]} 
              onPress={handleRegister}
              disabled={!isFormValid()}
            >
              <Text style={[
                styles.registerButtonText,
                !isFormValid() && styles.disabledButtonText
              ]}>Kayıt Ol</Text>
            </TouchableOpacity>

            <View style={styles.orContainer}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>veya</Text>
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

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Zaten hesabınız var mı? </Text>
              <TouchableOpacity onPress={handleLoginPress}>
                <Text style={styles.loginLink}>Giriş Yap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        <Toast />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
  },
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
  requiredInput: {
    borderColor: '#ddd',
    backgroundColor: '#f8f8f8',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 5,
  },
  registerButton: {
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
  registerButtonText: {
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  requiredDot: {
    color: '#007AFF',
    fontSize: 20,
    marginLeft: 5,
    marginRight: 5,
  },
});

export default RegisterScreen; 