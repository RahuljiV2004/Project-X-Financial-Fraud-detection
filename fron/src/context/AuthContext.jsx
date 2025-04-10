import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check for stored token and user data on mount
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError('');
      // Check for registered users in localStorage
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const registeredUser = registeredUsers.find(user => user.email === email);

      if (registeredUser && password === registeredUser.password) {
        setUser(registeredUser);
        localStorage.setItem('authToken', `dummy-token-${registeredUser.role}`);
        localStorage.setItem('user', JSON.stringify(registeredUser));
        return registeredUser;
      }
      
      // Check default users
      if (email === 'admin@fraudet.com' && password === 'admin123') {
        const userData = {
          id: '1',
          email,
          role: 'admin',
          name: 'Admin User'
        };
        setUser(userData);
        localStorage.setItem('authToken', 'dummy-token-admin');
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      } else if (email === 'customer@fraudet.com' && password === 'customer123') {
        const userData = {
          id: '2',
          email,
          role: 'customer',
          name: 'Customer User'
        };
        setUser(userData);
        localStorage.setItem('authToken', 'dummy-token-customer');
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }
      throw new Error('Invalid credentials');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (email, password, role) => {
    try {
      setError('');
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Check if user already exists
      if (registeredUsers.some(user => user.email === email)) {
        throw new Error('User already exists');
      }

      const userData = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        password, // Store password for demo purposes only
        role,
        name: email.split('@')[0]
      };

      // Add to registered users
      registeredUsers.push(userData);
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

      // Log user in
      setUser(userData);
      localStorage.setItem('authToken', `dummy-token-${role}`);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 