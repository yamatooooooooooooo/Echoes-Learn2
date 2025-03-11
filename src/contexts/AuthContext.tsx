import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useFirebase } from './FirebaseContext';

// 認証コンテキストの型定義
interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
}

// コンテキストの作成
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true
});

// プロバイダーのプロパティ型
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 認証プロバイダーコンポーネント
 * アプリケーション全体でユーザーの認証状態を管理する
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { auth } = useFirebase();

  useEffect(() => {
    // 認証状態の変更を監視
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    // クリーンアップ関数
    return () => unsubscribe();
  }, [auth]);

  const value = {
    currentUser,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 認証状態にアクセスするためのカスタムフック
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 