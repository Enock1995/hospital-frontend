// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      console.log('🔵 Initializing auth state...');
      
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        console.log('✅ Found saved auth data');
        setToken(savedToken);
        setUser(JSON.parse(savedUser));

        // Verify token is still valid by calling /me
        try {
          const response = await authAPI.me();
          console.log('✅ Token is valid, user:', response.user);
          setUser(response.user);
        } catch (error) {
          console.error('❌ Token invalid, clearing auth');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      } else {
        console.log('ℹ️ No saved auth data found');
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (userData, authToken) => {
    console.log('🔵 AuthContext.login called:', { 
      userName: userData?.name, 
      userEmail: userData?.email,
      hasToken: !!authToken 
    });

    // Save to state
    setToken(authToken);
    setUser(userData);

    // Save to localStorage
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));

    console.log('✅ User and token saved');
  };

  const logout = async () => {
    console.log('🔵 AuthContext.logout called');

    try {
      // Call backend logout to invalidate token
      await authAPI.logout();
      console.log('✅ Backend logout successful');
    } catch (error) {
      console.error('⚠️ Backend logout failed:', error);
      // Continue with local logout even if backend fails
    }

    // Clear state
    setToken(null);
    setUser(null);

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    console.log('✅ User logged out');
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!token && !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;