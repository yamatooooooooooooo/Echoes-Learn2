import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from './FirebaseContext';

// 認証コンテキストの型定義を拡張
interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  signup: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// コンテキストの作成
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true,
  login: async () => { throw new Error('Not implemented'); },
  loginWithGoogle: async () => { throw new Error('Not implemented'); },
  signup: async () => { throw new Error('Not implemented'); },
  logout: async () => { throw new Error('Not implemented'); },
  resetPassword: async () => { throw new Error('Not implemented'); }
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
  const { auth, firestore } = useFirebase();

  useEffect(() => {
    // 認証状態の変更を監視
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    // クリーンアップ関数
    return () => unsubscribe();
  }, [auth]);

  // ユーザードキュメント作成関数
  const createUserDocument = async (user: User): Promise<void> => {
    try {
      // ユーザードキュメントを作成
      const userDocRef = doc(firestore, 'users', user.uid);
      const userSnapshot = await getDoc(userDocRef);
      
      // ユーザードキュメントが存在しない場合のみ作成
      if (!userSnapshot.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || '名前なし',
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        // ユーザー設定ドキュメントを作成
        const settingsDocRef = doc(firestore, 'users', user.uid, 'settings', 'general');
        await setDoc(settingsDocRef, {
          theme: 'light',
          notificationsEnabled: true,
          dailyReminder: true,
          reminderTime: '20:00',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        console.log('ユーザードキュメントを作成しました:', user.uid);
      }
    } catch (error) {
      console.error('ユーザードキュメントの作成に失敗しました:', error);
      throw error;
    }
  };

  // ログイン機能
  const login = async (email: string, password: string): Promise<User> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('ログインに失敗しました:', error);
      throw error;
    }
  };

  // Googleでログイン
  const loginWithGoogle = async (): Promise<User> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // 新規ユーザーの場合はドキュメントを作成
      await createUserDocument(result.user);
      
      return result.user;
    } catch (error) {
      console.error('Googleログインに失敗しました:', error);
      throw error;
    }
  };

  // サインアップ
  const signup = async (email: string, password: string): Promise<User> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // ユーザードキュメントを作成
      await createUserDocument(result.user);
      
      return result.user;
    } catch (error) {
      console.error('サインアップに失敗しました:', error);
      throw error;
    }
  };

  // ログアウト
  const logout = async (): Promise<void> => {
    try {
      return signOut(auth);
    } catch (error) {
      console.error('ログアウトに失敗しました:', error);
      throw error;
    }
  };

  // パスワードリセット
  const resetPassword = async (email: string): Promise<void> => {
    try {
      return sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('パスワードリセットに失敗しました:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    isLoading,
    login,
    loginWithGoogle,
    signup,
    logout,
    resetPassword
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