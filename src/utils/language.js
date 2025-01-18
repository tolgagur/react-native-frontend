import i18n from '../i18n';
import Toast from 'react-native-toast-message';

export const changeLanguage = async (language) => {
  try {
    await i18n.changeLanguage(language);
    Toast.show({
      type: 'success',
      text1: i18n.t('messages.languageUpdated')
    });
    return true;
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: i18n.t('messages.languageError')
    });
    return false;
  }
}; 