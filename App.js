import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import HomeScreen from './components/HomeScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [token, setToken] = useState(null);

  const handleLoginSuccess = (token) => {
    setToken(token);
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentScreen('login');
  };

  const renderScreen = () => {
    if (token) {
      return <HomeScreen onLogout={handleLogout} />;
    }

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