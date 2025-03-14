import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebaseの構成情報
const firebaseConfig = {
  apiKey: "AIzaSyDEGwmRO3ZUcpaqqGEW3wS4MKS7ajslHR4",
  authDomain: "echoes-learn2.firebaseapp.com",
  projectId: "echoes-learn2",
  storageBucket: "echoes-learn2.firebasestorage.app",
  messagingSenderId: "364983430830",
  appId: "1:364983430830:web:e10c2452512f005c3ac73f",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || process.env.REACT_APP_MEASUREMENT_ID
};

// デバッグ用
console.log("firebase.ts - APIキー確認:", firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 6)}...` : "未設定");

// Firebaseを初期化
const app = initializeApp(firebaseConfig);

// 認証とFirestoreをエクスポート
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app; 