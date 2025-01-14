import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import ForgotPasswordScreen from './components/ForgotPasswordScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [token, setToken] = useState(null);

  const handleLoginSuccess = (token) => {
    setToken(token);
    // Token alındıktan sonra ana uygulamaya yönlendirme yapılacak
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return (
          <LoginScreen 
            onLoginSuccess={handleLoginSuccess}
            onRegisterPress={() => setCurrentScreen('register')}
            onForgotPassword={() => setCurrentScreen('forgotPassword')}
          />
        );
      case 'register':
        return (
          <RegisterScreen 
            onRegisterSuccess={handleLoginSuccess}
            onLoginPress={() => setCurrentScreen('login')}
          />
        );
      case 'forgotPassword':
        return (
          <ForgotPasswordScreen 
            onBackToLogin={() => setCurrentScreen('login')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderScreen()}
    </>
  );
} 