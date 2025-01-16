import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API'nin temel URL'si
const BASE_URL = 'http://192.168.1.104:8080/api/v1';

// Axios instance oluşturma
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token işlemleri için yardımcı fonksiyonlar
const TOKEN_KEY = '@flashcard_token';
const REFRESH_TOKEN_KEY = '@flashcard_refresh_token';

const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Token kaydetme hatası:', error);
  }
};

const storeRefreshToken = async (refreshToken) => {
  try {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('Refresh token kaydetme hatası:', error);
  }
};

const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Token okuma hatası:', error);
    return null;
  }
};

const getRefreshToken = async () => {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Refresh token okuma hatası:', error);
    return null;
  }
};

// İstek interceptor'ı - token eklemek için
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Eğer logout isteği ise refresh token'ı ekle
    if (config.url === '/auth/logout') {
      console.log('Çıkış isteği tespit edildi');
      const refreshToken = await getRefreshToken();
      console.log('Alınan refresh token:', refreshToken);
      if (refreshToken) {
        config.headers['Refresh-Token'] = refreshToken;
        console.log('Refresh token header\'a eklendi');
      } else {
        console.log('Refresh token bulunamadı, header\'a eklenemedi');
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth işlemleri
export const authService = {
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        role: 'USER'
      });
      if (response.data.token) {
        await storeToken(response.data.token);
        if (response.data.refreshToken) {
          await storeRefreshToken(response.data.refreshToken);
        }
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      console.log('Login isteği gönderiliyor:', credentials);
      const response = await api.post('/auth/login', credentials);
      console.log('API yanıtı:', response.data);
      
      if (response.data && response.data.token) {
        console.log('Token alındı:', response.data.token);
        await storeToken(response.data.token);
        if (response.data.refreshToken) {
          console.log('Refresh token alındı:', response.data.refreshToken);
          await storeRefreshToken(response.data.refreshToken);
        }
        return response.data;
      } else {
        console.log('Token alınamadı. API yanıtı:', response.data);
        throw new Error('Token alınamadı');
      }
    } catch (error) {
      console.error('Login hatası:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        throw new Error('Refresh token bulunamadı');
      }

      await api.post('/auth/logout', null);
      await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
      
      return true;
    } catch (error) {
      console.error('Çıkış hatası:', error);
      throw error;
    }
  },

  forgotPassword: async (data) => {
    try {
      const response = await api.post('/auth/forgot-password', data);
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error('Şifre sıfırlama işlemi başarısız');
      }
    } catch (error) {
      throw error;
    }
  },
};

// Flashcard işlemleri
export const flashcardService = {
  // Tüm flashcardları getir
  getAllFlashcards: async (page = 0, size = 10, sort = 'createdAt,desc', tag = '') => {
    try {
      const params = { page, size, sort };
      if (tag) params.tag = tag;
      const response = await api.get('/flashcards', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tekli flashcard oluştur
  createFlashcard: async (flashcardData) => {
    try {
      const response = await api.post('/flashcards', flashcardData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Toplu flashcard oluştur
  createBulkFlashcards: async (flashcardsData) => {
    try {
      const response = await api.post('/flashcards/bulk', { flashcards: flashcardsData });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Flashcard güncelle
  updateFlashcard: async (id, flashcardData) => {
    try {
      const response = await api.put(`/flashcards/${id}`, flashcardData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Flashcard sil
  deleteFlashcard: async (id) => {
    try {
      await api.delete(`/flashcards/${id}`);
    } catch (error) {
      throw error;
    }
  },

  // Flashcard detayı getir
  getFlashcardById: async (id) => {
    try {
      const response = await api.get(`/flashcards/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Çalışma durumunu güncelle
  updateStudyStatus: async (id, studyResult) => {
    try {
      const response = await api.post(`/flashcards/${id}/study`, { studyResult });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api; 