"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { initializeCreatorProfile } from '../services/api';

interface User {
  fullName?: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean }>;
  logout: () => void;
  getCreatorProfileUrl: () => string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  // Create a ref to track if initialization has already happened
  const hasInitialized = useRef(false);

  const login = async (email: string, password: string) => {
    try {
      // Call your actual login API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (data.token) {
        // Store token and user data in localStorage
        localStorage.setItem('token', data.token);
        
        // Ensure we have user data to store
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        } else {
          // If the API doesn't return user data, create a basic user object
          const basicUser = {
            email,
            name: email.split('@')[0],
          };
          localStorage.setItem('user', JSON.stringify(basicUser));
          setUser(basicUser);
        }
        
        setIsAuthenticated(true);
        
        // Set creator or brand status if applicable
        if (data.user?.role === 'creator') {
          localStorage.setItem('userRole', 'creator');
        } else if (data.user?.role === 'brand') {
          localStorage.setItem('userRole', 'brand');
        }
        
        return { success: true };
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // In development, simulate successful login for testing
      if (process.env.NODE_ENV === 'development') {
        const mockUser = {
          email,
          name: email.split('@')[0],
          role: email.includes('creator') ? 'creator' : 'user',
        };
        
        localStorage.setItem('token', 'mock_token_' + Date.now());
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        setUser(mockUser);
        setIsAuthenticated(true);
        
        return { success: true };
      }
      
      throw error;
    }
  };

  const logout = () => {
    // Clear all authentication related data
    if (typeof window !== 'undefined') {
      // Auth tokens
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Creator-specific data
      localStorage.removeItem('creator_profile_exists');
      localStorage.removeItem('just_published');
      localStorage.removeItem('username');
      localStorage.removeItem('userRole');
      
      // Brand-specific data
      localStorage.removeItem('is_brand');
      localStorage.removeItem('account_type');
      localStorage.removeItem('brandName');
      
      // Any profile data with creator_ prefix
      const username = localStorage.getItem('username');
      if (username) {
        localStorage.removeItem(`creator_${username}`);
      }
      
      console.log('User logged out, all auth data cleared');
    }
    
    // Update authentication state
    setIsAuthenticated(false);
    setUser(null);
  };

  useEffect(() => {
    if (user && typeof window !== 'undefined' && !hasInitialized.current) {
      const userRole = localStorage.getItem('userRole');
      const creatorProfileExists = localStorage.getItem('creator_profile_exists');
      const justPublished = localStorage.getItem('just_published');
      
      // Only initialize if we have a confirmed published profile
      if (userRole === 'creator' && creatorProfileExists === 'true' && justPublished === 'true') {
        console.log('Confirmed creator with published profile, initializing');
        
        // Set the flag to prevent duplicate initialization
        hasInitialized.current = true;
        
        initializeCreatorProfile()
          .then(() => console.log('Creator profile initialized'))
          .catch(err => console.error('Error initializing creator profile:', err));
      } else if (userRole === 'creator') {
        console.log('Creator account detected but no published profile yet');
      }
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && isMounted) {
          setIsAuthenticated(true);
          
          if (userData) {
            try {
              const parsedUser = JSON.parse(userData);
              setUser(parsedUser);
            } catch (e) {
              console.error('Error parsing user data from localStorage:', e);
            }
          }
        } else if (isMounted) {
          // No token found, user is not authenticated
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    };
    
    // Check authentication on initial load
    checkAuth();
    
    // Add event listener for page visibility to handle tab switching
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuth();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up event listener and set isMounted to false
    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const getCreatorProfileUrl = () => {
    if (typeof window !== 'undefined') {
      const username = localStorage.getItem('username');
      return username ? `/creator/${username}` : '/creator-dashboard';
    }
    return '/creator-dashboard';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, getCreatorProfileUrl }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  // If context is not available, return a default context instead of throwing an error
  if (!context) {
    console.warn("useAuth was used outside of AuthProvider, returning default context");
    return {
      isAuthenticated: false,
      user: null,
      login: async () => ({ success: false }),
      logout: () => {},
      getCreatorProfileUrl: () => "/creator-dashboard"
    };
  }
  
  return context;
}
