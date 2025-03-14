import { UserRepository } from '../../infrastructure/repositories/userRepository';
import { SubjectRepository } from '../../infrastructure/repositories/subjectRepository';
import { ProgressRepository } from '../../infrastructure/repositories/progressRepository';
import { FirebaseUserSettingsRepository } from '../../infrastructure/repositories/userSettingsRepository';
import { StudyAnalyticsRepository } from '../../infrastructure/repositories/studyAnalyticsRepository';
import { LearningAnalyticsRepository } from '../../infrastructure/repositories/learningAnalyticsRepository';
import { QuotaService } from './QuotaService';
import { PriorityService } from './PriorityService';
import { AnalyticsService } from './AnalyticsService';

/**
 * アプリケーションサービスの型定義
 */
export interface ApplicationServices {
  userRepository: UserRepository;
  subjectRepository: SubjectRepository;
  progressRepository: ProgressRepository;
  userSettingsRepository: FirebaseUserSettingsRepository;
  studyAnalyticsRepository: StudyAnalyticsRepository;
  learningAnalyticsRepository: LearningAnalyticsRepository;
  quotaService: QuotaService;
  priorityService: PriorityService;
  analyticsService: AnalyticsService;
}
