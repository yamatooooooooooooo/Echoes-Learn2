import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore,
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED
} from 'firebase/firestore';
import { 
  getAuth, 
  Auth, 
  connectAuthEmulator 
} from 'firebase/auth';
import { 
  getStorage, 
  FirebaseStorage,
  connectStorageEmulator
} from 'firebase/storage';
import { 
  getFunctions, 
  Functions,
  connectFunctionsEmulator
} from 'firebase/functions';
import { 
  getPerformance
} from 'firebase/performance';
import { 
  getAnalytics, 
  Analytics,
  logEvent
} from 'firebase/analytics';
import { 
  getRemoteConfig,
  RemoteConfig
} from 'firebase/remote-config';

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyDEGwmRO3ZUcpaqqGEW3wS4MKS7ajslHR4", // 直接値を設定
  authDomain: "echoes-learn2.firebaseapp.com",      // 直接値を設定
  projectId: "echoes-learn2",                      // 直接値を設定
  storageBucket: "echoes-learn2.firebasestorage.app", // 直接値を設定
  messagingSenderId: "364983430830",               // 直接値を設定
  appId: "1:364983430830:web:e10c2452512f005c3ac73f", // 直接値を設定
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || process.env.REACT_APP_MEASUREMENT_ID
};

// デバッグ用：環境変数が設定されているか確認
console.log("Firebase設定のデバッグ:", { 
  apiKey: firebaseConfig.apiKey ? "設定済み" : "未設定",
  authDomain: firebaseConfig.authDomain ? "設定済み" : "未設定",
  projectId: firebaseConfig.projectId ? "設定済み" : "未設定",
  storageBucket: firebaseConfig.storageBucket ? "設定済み" : "未設定",
  messagingSenderId: firebaseConfig.messagingSenderId ? "設定済み" : "未設定",
  appId: firebaseConfig.appId ? "設定済み" : "未設定"
});

// 実際の値を（安全のため一部マスクして）確認
console.log("APIキー確認:", firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 6)}...` : "未設定");
console.log("環境変数直接確認:", {
  REACT_APP_FIREBASE_API_KEY: process.env.REACT_APP_FIREBASE_API_KEY ? "存在" : "なし",
  REACT_APP_API_KEY: process.env.REACT_APP_API_KEY ? "存在" : "なし",
});

// Firebaseサービスの型定義
interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
  functions: Functions;
  performance?: any;  // より明確な型が必要な場合は後で定義
  analytics?: Analytics;
  remoteConfig?: RemoteConfig;
}

// Firebaseアプリを初期化する関数
const initializeFirebaseApp = (): FirebaseApp => {
  try {
    return initializeApp(firebaseConfig);
  } catch (error) {
    console.error('Firebase app initialization error:', error);
    throw error;
  }
}

// Firestoreを初期化する関数
const initializeFirestore = (app: FirebaseApp): Firestore => {
  try {
    const firestore = getFirestore(app);
    
    // 開発環境でエミュレーターを使用
    if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_FIREBASE_EMULATORS === 'true') {
      connectFirestoreEmulator(firestore, 'localhost', 8080);
    } else {
      // 本番環境ではオフラインキャッシュを有効化
      // これはPromiseを返すので、非同期処理として扱います
      enableIndexedDbPersistence(firestore).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Firestore persistence could not be enabled: multiple tabs open');
        } else if (err.code === 'unimplemented') {
          console.warn('Firestore persistence is not available in this browser');
        }
      });
    }
    
    return firestore;
  } catch (error) {
    console.error('Firestore initialization error:', error);
    throw error;
  }
}

/**
 * Firebase初期化関数
 * アプリケーションで使用する各Firebaseサービスを初期化して返す
 */
export const initializeFirebase = (): FirebaseServices => {
  try {
    console.log('Initializing Firebase...');
    
    // アプリ全体のFirebase初期化は一度だけ行う
    const app = initializeFirebaseApp();
    const auth = getAuth(app);
    const firestore = initializeFirestore(app);
    const storage = getStorage(app);
    const functions = getFunctions(app);
    
    // 本番環境でのみ有効化する追加サービス
    let performance;
    let analytics;
    let remoteConfig;
    
    if (process.env.NODE_ENV === 'production') {
      // Performance Monitoringを有効化
      try {
        performance = getPerformance(app);
        console.log('Firebase Performance Monitoring initialized');
      } catch (perfError) {
        console.error('Error initializing Performance Monitoring:', perfError);
      }
      
      // Analyticsを有効化
      try {
        if (process.env.REACT_APP_MEASUREMENT_ID) {
          analytics = getAnalytics(app);
          logEvent(analytics, 'app_initialized');
          console.log('Firebase Analytics initialized');
        } else {
          console.log('Analytics measurement ID not provided, skipping analytics initialization');
        }
      } catch (analyticsError) {
        console.error('Error initializing Analytics:', analyticsError);
      }
      
      // Remote Configを有効化
      try {
        remoteConfig = getRemoteConfig(app);
        remoteConfig.settings = {
          minimumFetchIntervalMillis: 3600000, // 1時間に一回の更新
          fetchTimeoutMillis: 60000 // 1分のタイムアウト
        };
        console.log('Firebase Remote Config initialized');
      } catch (configError) {
        console.error('Error initializing Remote Config:', configError);
      }
    }
    
    // 開発環境の場合、エミュレーターを使用
    if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_FIREBASE_EMULATORS === 'true') {
      console.log('Using Firebase Emulators');
      
      // 各サービスのエミュレーターに接続
      try {
        connectAuthEmulator(auth, 'http://localhost:9099');
        // Note: Firestoreのエミュレーター接続は上で行っています
        connectStorageEmulator(storage, 'localhost', 9199);
        connectFunctionsEmulator(functions, 'localhost', 5001);
      } catch (emulatorError) {
        console.error('Error connecting to Firebase emulators:', emulatorError);
      }
    }
    
    console.log('Firebase initialized successfully');
    
    return { 
      app, 
      auth, 
      firestore, 
      storage, 
      functions,
      performance,
      analytics,
      remoteConfig
    };
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    // エラーが発生してもアプリが完全に機能停止しないよう、空のインスタンスを返す選択肢もある
    // しかし実際にはここでエラーを投げた方が開発時に問題を早期発見できる
    throw new Error(`Firebase initialization failed: ${error}`);
  }
};

/**
 * Firebase設定が有効かどうかをチェック
 */
export const isFirebaseConfigValid = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
}; 