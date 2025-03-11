import React from 'react';
import { useMemo, useContext } from 'react';
import { SubjectService } from '../domain/services/SubjectService';
import { ProgressService } from '../domain/services/ProgressService';
import { QuotaService } from '../application/services/QuotaService';
import { PriorityService } from '../application/services/PriorityService';
import { AnalyticsService } from '../application/services/AnalyticsService';
import { UserRepository } from '../infrastructure/repositories/userRepository';
import { SubjectRepository } from '../infrastructure/repositories/subjectRepository';
import { ProgressRepository } from '../infrastructure/repositories/progressRepository';
import { UserSettingsRepository } from '../infrastructure/repositories/userSettingsRepository';
import { StudyAnalyticsRepository } from '../infrastructure/repositories/studyAnalyticsRepository';
import { useFirebase } from '../contexts/FirebaseContext';
import { ServicesContext, ServicesProviderProps } from '../contexts/ServicesContext';
import { ApplicationServices } from '../application/services';

/**
 * アプリケーション全体でサービスへのアクセスを提供するカスタムフック
 * サービスのシングルトンインスタンスを作成し、コンポーネント間で共有する
 */
export const useServices = () => {
  const context = useContext(ServicesContext);
  
  if (!context) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  
  return context.services;
};

export const ServicesProvider: React.FC<ServicesProviderProps> = ({ children, services = {} }) => {
  const { firestore, auth } = useFirebase();
  
  // リポジトリの初期化
  const userRepository = useMemo(() => services.userRepository || new UserRepository(firestore, auth), [services.userRepository, firestore, auth]);
  const subjectRepository = useMemo(() => services.subjectRepository || new SubjectRepository(firestore, auth), [services.subjectRepository, firestore, auth]);
  const progressRepository = useMemo(() => services.progressRepository || new ProgressRepository(firestore, auth), [services.progressRepository, firestore, auth]);
  const userSettingsRepository = useMemo(() => services.userSettingsRepository || new UserSettingsRepository(firestore, auth), [services.userSettingsRepository, firestore, auth]);
  const studyAnalyticsRepository = useMemo(() => services.studyAnalyticsRepository || new StudyAnalyticsRepository(firestore, auth), [services.studyAnalyticsRepository, firestore, auth]);
  
  // サービスの初期化
  const quotaService = useMemo(() => services.quotaService || new QuotaService(subjectRepository, progressRepository, userSettingsRepository), [services.quotaService, subjectRepository, progressRepository, userSettingsRepository]);
  const priorityService = useMemo(() => services.priorityService || new PriorityService(subjectRepository, progressRepository), [services.priorityService, subjectRepository, progressRepository]);
  const analyticsService = useMemo(() => services.analyticsService || new AnalyticsService(subjectRepository, progressRepository), [services.analyticsService, subjectRepository, progressRepository]);
  
  const servicesValue: ApplicationServices = useMemo(() => ({
    userRepository,
    subjectRepository,
    progressRepository,
    userSettingsRepository,
    studyAnalyticsRepository,
    quotaService,
    priorityService,
    analyticsService
  }), [userRepository, subjectRepository, progressRepository, userSettingsRepository, studyAnalyticsRepository, quotaService, priorityService, analyticsService]);
  
  return (
    <ServicesContext.Provider value={{ services: servicesValue }}>
      {children}
    </ServicesContext.Provider>
  );
}; 