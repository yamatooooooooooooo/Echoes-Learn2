import React, { createContext, useContext, ReactNode } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
import { Functions } from 'firebase/functions';
import { GamificationRepository } from '../infrastructure/repositories/gamificationRepository';

// Firebaseコンテキストの型定義
interface FirebaseContextType {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
  functions: Functions;
  gamificationRepository: GamificationRepository;
}

// コンテキストの作成
const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

// プロバイダーのプロパティ型
interface FirebaseProviderProps {
  children: ReactNode;
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
  functions: Functions;
}

/**
 * Firebaseプロバイダーコンポーネント
 * アプリケーション全体でFirebaseサービスを利用できるようにする
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  app,
  auth,
  firestore,
  storage,
  functions,
}) => {
  const gamificationRepository = new GamificationRepository(firestore, auth);

  return (
    <FirebaseContext.Provider
      value={{
        app,
        auth,
        firestore,
        storage,
        functions,
        gamificationRepository,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * Firebaseサービスにアクセスするためのカスタムフック
 */
export const useFirebase = (): FirebaseContextType => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export default FirebaseContext;
