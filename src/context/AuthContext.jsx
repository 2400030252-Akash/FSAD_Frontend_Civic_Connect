import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers } from '../data/mockData';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user session
    const savedUser = localStorage.getItem('civiconnect_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('civiconnect_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password, requestedRole = 'citizen') => {
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role: requestedRole,
          action: 'login'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.user;
        setUser(userData);
        localStorage.setItem('civiconnect_user', JSON.stringify(userData));
        setIsLoading(false);
        return true;
      } else {
        const errorData = await response.json();
        console.error('Login error:', errorData.message);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Auth Request failed:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('civiconnect_user');
  };

  const register = async (userData) => {
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          action: 'register'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newUser = data.user;
        setUser(newUser);
        localStorage.setItem('civiconnect_user', JSON.stringify(newUser));
        setIsLoading(false);
        return true;
      } else {
        const errorData = await response.json();
        console.error('Registration error:', errorData.message);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Registration Request failed:', error);
      setIsLoading(false);
      return false;
    }
  };

  const updateUser = (userData) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('civiconnect_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      register,
      updateUser,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};