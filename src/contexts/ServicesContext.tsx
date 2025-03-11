import React, { createContext, ReactNode, useContext } from 'react';
import { ApplicationServices } from '../application/services';
import { SubjectService } from '../domain/services/SubjectService';
import { ProgressService } from '../domain/services/ProgressService';
import { QuotaService } from '../domain/services/QuotaService';
import { SubjectRepository } from '../infrastructure/repositories/subjectRepository';
import { UserSettingsRepository } from '../infrastructure/repositories/userSettingsRepository';
import { StudyAnalyticsRepository } from '../infrastructure/repositories/studyAnalyticsRepository';
import { ProgressRepository } from '../infrastructure/repositories/progressRepository';
import { Firestore } from 'firebase/firestore';
import { collection, query, limit, getDocs } from 'firebase/firestore';

/**
 * アプリケーションで使用するサービスを提供するコンテキスト
 */
export interface ServicesContextProps {
  subjectService: SubjectService;
  progressService: ProgressService;
  quotaService: QuotaService;
  subjectRepository: SubjectRepository;
  userSettingsRepository: UserSettingsRepository;
  studyAnalyticsRepository: StudyAnalyticsRepository;
  progressRepository: ProgressRepository;
}

// サービスコンテキストの型定義
interface ServicesContextType {
  services: ApplicationServices;
}

// コンテキストの作成
export const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

// プロバイダーのプロパティ型
export interface ServicesProviderProps {
  children: ReactNode;
  services: ApplicationServices;
}

// ServicesContextからのフックの実装
export const useServices = () => {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context.services;
};

const testFirebaseConnection = async (firestore: Firestore): Promise<boolean> => {
  try {
    // 読み取り専用のテストクエリを実行
    const testRef = collection(firestore, 'public');
    const testQuery = query(testRef, limit(1));
    await getDocs(testQuery);
    console.log('Firebase接続テスト成功');
    return true;
  } catch (error) {
    console.error('Firebase接続テスト失敗:', error);
    return false;
  }
};

export default ServicesContext; 