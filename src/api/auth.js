// src/api/auth.js
import api from './axios';

export const authAPI = {
  login: async (credentials) => {
    console.log('🔵 authAPI.login called');
    const response = await api.post('/login', credentials);
    console.log('✅ Raw response:', response.data);
    
    // Backend wraps in 'data' object, extract it
    if (response.data.data) {
      console.log('✅ Extracted:', response.data.data);
      return response.data.data;
    }
    
    return response.data;
  },

  register: async (userData) => {
    console.log('🔵 authAPI.register called');
    const response = await api.post('/register', userData);
    
    if (response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  },

  logout: async () => {
    console.log('🔵 authAPI.logout called');
    const response = await api.post('/logout');
    return response.data;
  },

  me: async () => {
    console.log('🔵 authAPI.me called');
    const response = await api.get('/me');
    
    if (response.data.data && response.data.data.user) {
      return response.data.data;
    } else if (response.data.user) {
      return response.data;
    }
    
    return response.data;
  },
};

export const getCurrentUser = async () => {
  console.log('🔵 getCurrentUser called');
  return authAPI.me();
};

export default authAPI;