import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
});

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("AuthContext: 認証状態の監視を開始します");
    
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        console.log("AuthContext: 認証状態が変更されました", user ? "ユーザー認証済み" : "未認証");
        if (user) {
          console.log("AuthContext: 認証済みユーザー情報", {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified
          });
        }
        setUser(user);
        setLoading(false);
      },
      (error) => {
        console.error('AuthContext: 認証エラーが発生しました:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    // クリーンアップ関数
    return () => {
      console.log("AuthContext: 認証状態の監視を終了します");
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}; 