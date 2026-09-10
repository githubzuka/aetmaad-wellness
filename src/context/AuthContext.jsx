import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService.js';

const AuthContext = createContext(null);

/**
 * Global Authentication Context Provider
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear session
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  // Hydrate user session on app load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authService.getProfile();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.error('Session hydration failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [logout]);

  // Listen to global 401 unauthorized event dispatched by axiosClient
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  /**
   * User login action
   */
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await authService.login({ email, password });
      if (res.success && res.data) {
        const { token: userToken, ...userData } = res.data;
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(userToken);
        setUser(userData);
        return { success: true, user: userData };
      } else {
        throw new Error(res.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * User registration action
   */
  const register = async (userData) => {
    setError(null);
    try {
      const res = await authService.register(userData);
      if (res.success && res.data) {
        const { token: userToken, ...userObj } = res.data;
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userObj));
        setToken(userToken);
        setUser(userObj);
        return { success: true, user: userObj };
      } else {
        throw new Error(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Update user profile action
   */
  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const res = await authService.updateProfile(profileData);
      if (res.success && res.data) {
        const { token: userToken, ...updatedUser } = res.data;
        if (userToken) {
          localStorage.setItem('token', userToken);
          setToken(userToken);
        }
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true, user: updatedUser };
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const applyVolunteer = async (applicationData) => {
    setError(null);
    try {
      const res = await authService.applyVolunteer(applicationData);
      if (res.success && res.data) {
        localStorage.setItem('user', JSON.stringify(res.data));
        setUser(res.data);
        return { success: true, user: res.data };
      }
      throw new Error(res.message || 'Volunteer application failed');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    role: user ? user.role : null,
    status: user ? user.status : null,
    isVolunteerApproved: user ? user.role === 'volunteer' && user.status === 'approved' : false,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    applyVolunteer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to consume AuthContext
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
