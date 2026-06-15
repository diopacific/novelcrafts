import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, logout, testConnection, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isApproved: boolean;
  login: () => Promise<void>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isApproved: false,
  login: async () => {},
  logoutUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    testConnection(); // Ensure connection works on start
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Check if admin
        const email = currentUser.email;
        if (email === 'diopacific@gmail.com') {
          setUser(currentUser);
          setIsAdmin(true);
          setIsApproved(true);
        } else {
          // Deny others
          setUser(null);
          setIsAdmin(false);
          setIsApproved(false);
          await logout();
          alert('접근 권한이 없습니다. 관리자만 로그인할 수 있습니다.');
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsApproved(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    try {
      await loginWithGoogle();
      // No need to check approval doc anymore
    } catch (e: any) {
      if (e?.code === 'auth/cancelled-popup-request' || e?.code === 'auth/popup-closed-by-user') {
        console.log('Login popup closed by user.');
        throw e;
      }
      console.error('Login error:', e);
      throw e;
    }
  };

  const logoutUser = async () => {
    try {
      await logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isApproved, login, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
