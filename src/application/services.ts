import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
import { Functions } from 'firebase/functions';

// リポジトリのインポート
import { UserRepository } from '../infrastructure/repositories/userRepository';
import { SubjectRepository } from '../infrastructure/repositories/subjectRepository';
import { ProgressRepository } from '../infrastructure/repositories/progressRepository';
import { FirebaseUserSettingsRepository } from '../infrastructure/repositories/userSettingsRepository';
import { UserSettingsRepository } from '../domain/repositories/UserSettingsRepository';
import { StudyAnalyticsRepository } from '../infrastructure/repositories/studyAnalyticsRepository';
import { learningAnalyticsRepository } from '../infrastructure/repositories/learningAnalyticsRepository';

// サービスのインポート
import { QuotaService } from './services/QuotaService';
import { PriorityService } from './services/PriorityService';
import { AnalyticsService } from './services/AnalyticsService';

// Firebase依存関係の型
interface FirebaseDependencies {
  firestore: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
  functions: Functions;
}

// アプリケーションサービスの型
export interface ApplicationServices {
  userRepository: UserRepository;
  subjectRepository: SubjectRepository;
  progressRepository: ProgressRepository;
  userSettingsRepository: UserSettingsRepository;
  studyAnalyticsRepository: StudyAnalyticsRepository;
  learningAnalyticsRepository: typeof learningAnalyticsRepository;
  quotaService: QuotaService;
  priorityService: PriorityService;
  analyticsService: AnalyticsService;
}

/**
 * サービス層の初期化関数
 * 依存関係の注入パターンを使用して各サービスを初期化
 */
export const initializeServices = (
  dependencies: FirebaseDependencies
): ApplicationServices => {
  try {
    console.log('Initializing application services...');
    
    // リポジトリの初期化
    const userRepository = new UserRepository(dependencies.firestore, dependencies.auth);
    const subjectRepository = new SubjectRepository(dependencies.firestore, dependencies.auth);
    const progressRepository = new ProgressRepository(dependencies.firestore, dependencies.auth);
    const userSettingsRepository = new FirebaseUserSettingsRepository(dependencies.firestore, dependencies.auth);
    const studyAnalyticsRepository = new StudyAnalyticsRepository(dependencies.firestore, dependencies.auth);
    
    // サービスの初期化
    const quotaService = new QuotaService(subjectRepository, progressRepository, userSettingsRepository);
    const priorityService = new PriorityService(subjectRepository, progressRepository);
    const analyticsService = new AnalyticsService(subjectRepository, progressRepository);
    
    console.log('Application services initialized successfully');
    
    return {
      userRepository,
      subjectRepository,
      progressRepository,
      userSettingsRepository,
      studyAnalyticsRepository,
      learningAnalyticsRepository,
      quotaService,
      priorityService,
      analyticsService
    };
  } catch (error) {
    console.error('Error initializing application services:', error);
    throw new Error(`Services initialization failed: ${error}`);
  }
};

/**
 * サービスモック作成関数 (テスト用)
 */
export const createMockServices = (): ApplicationServices => {
  // テスト用のモックサービスを作成...
  return {} as ApplicationServices;
}; 