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

const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Token kaydetme hatası:', error);
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

// İstek interceptor'ı - token eklemek için
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.token) {
        await storeToken(response.data.token);
      }
      return response.data;
    } catch (error) {
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