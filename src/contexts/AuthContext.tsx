import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'school' | 'parent';
  schoolId?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'school' | 'parent';
  schoolName?: string;
}

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_FAILURE' };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return { ...state, loading: true };
    
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        user: null,
        isAuthenticated: false,
        loading: false,
      };
    
    case 'LOGOUT':
      return initialState;
    
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } catch (error) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Check if it's admin login
      if (email === 'admin@smartschool.com' && password === 'password123') {
        const adminUser: User = {
          id: 'admin-1',
          name: 'Admin User',
          email: 'admin@smartschool.com',
          role: 'admin'
        };
        
        localStorage.setItem('auth_token', 'mock-jwt-token');
        localStorage.setItem('user_data', JSON.stringify(adminUser));
        dispatch({ type: 'LOGIN_SUCCESS', payload: adminUser });
        return;
      }
      
      // Check schools table
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('email', email)
        .maybeSingle();
        
      if (schoolData && schoolData.password === password) {
        const schoolUser: User = {
          id: schoolData.id,
          name: schoolData.name,
          email: schoolData.email,
          role: 'school',
          schoolId: schoolData.id
        };
        
        localStorage.setItem('auth_token', 'mock-jwt-token');
        localStorage.setItem('user_data', JSON.stringify(schoolUser));
        dispatch({ type: 'LOGIN_SUCCESS', payload: schoolUser });
        return;
      }
      
      // Check profiles table for parents
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();
        
      if (profileData && password === 'password123') { // Default password for demo
        const parentUser: User = {
          id: profileData.id,
          name: profileData.name,
          email: profileData.email,
          role: profileData.role,
          schoolId: profileData.school_id
        };
        
        localStorage.setItem('auth_token', 'mock-jwt-token');
        localStorage.setItem('user_data', JSON.stringify(parentUser));
        dispatch({ type: 'LOGIN_SUCCESS', payload: parentUser });
        return;
      }
      
      throw new Error('Invalid credentials');
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    dispatch({ type: 'REGISTER_START' });
    
    try {
      if (userData.role === 'school') {
        // Create school record
        const { data: schoolData, error: schoolError } = await supabase
          .from('schools')
          .insert([{
            name: userData.schoolName || userData.name,
            email: userData.email,
            password: userData.password,
            principal_name: userData.name,
            status: 'active'
          }])
          .select()
          .single();
          
        if (schoolError) throw schoolError;
        
        const newUser: User = {
          id: schoolData.id,
          name: schoolData.name,
          email: schoolData.email,
          role: 'school',
          schoolId: schoolData.id,
        };
        
        localStorage.setItem('auth_token', 'mock-jwt-token');
        localStorage.setItem('user_data', JSON.stringify(newUser));
        dispatch({ type: 'REGISTER_SUCCESS', payload: newUser });
      } else {
        // Create parent profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert([{
            name: userData.name,
            email: userData.email,
            role: userData.role
          }])
          .select()
          .single();
          
        if (profileError) throw profileError;
        
        const newUser: User = {
          id: profileData.id,
          name: profileData.name,
          email: profileData.email,
          role: profileData.role,
        };
        
        localStorage.setItem('auth_token', 'mock-jwt-token');
        localStorage.setItem('user_data', JSON.stringify(newUser));
        dispatch({ type: 'REGISTER_SUCCESS', payload: newUser });
      }

    } catch (error) {
      dispatch({ type: 'REGISTER_FAILURE' });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}