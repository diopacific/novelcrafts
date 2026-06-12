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
        setUser(currentUser);
        // Check if admin or approved
        const email = currentUser.email;
        if (email === 'diopacific@gmail.com') {
          setIsAdmin(true);
          setIsApproved(true);
        } else if (email) {
          try {
            const approvedDoc = await getDoc(doc(db, 'approved_users', email));
            if (approvedDoc.exists()) {
              setIsApproved(true);
            } else {
              setIsApproved(false);
            }
          } catch (e) {
            console.error("Error checking approval", e);
            setIsApproved(false);
          }
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
      const result = await loginWithGoogle();
      const email = result.user.email;
      
      if (email === 'diopacific@gmail.com') {
         return; // Admin always approved
      }
      
      if (email) {
        try {
          const approvedDoc = await getDoc(doc(db, 'approved_users', email));
          if (!approvedDoc.exists()) {
            await logout();
            throw new Error('NOT_APPROVED');
          }
        } catch(e: any) {
           if(e.message === 'NOT_APPROVED') throw e;
           // If error accessing Firestore
           await logout();
           throw new Error('NOT_APPROVED');
        }
      }

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
