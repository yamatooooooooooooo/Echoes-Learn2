/**
 * ダッシュボードデータのエンティティ定義
 */

import { Subject } from './Subject';
import { StudyProgress } from './StudyProgress';
import { StudySession } from './StudySession';
import { SubjectPerformance } from './SubjectPerformance';
import { RadarChartData } from '../services/visualizationService';

// 試験情報インターフェース
export interface ExamInfo {
  id: string;
  subject: string;
  date: Date;
  remainingDays: number;
  priority: 'high' | 'medium' | 'low';
}

// レポート情報インターフェース
export interface ReportInfo {
  id: string;
  subject: string;
  date: Date;
  remainingDays: number;
  priority: 'high' | 'medium' | 'low';
}

export interface WeeklyProgressData {
  date: string;
  pagesRead: number;
  timeSpent: number;
}

export interface DashboardData {
  userId: string;
  totalSubjects: number;
  completedSubjects: number;
  inProgressSubjects: number;
  notStartedSubjects: number;
  totalPages: number;
  completedPages: number;
  weeklyProgressData: WeeklyProgressData[];
  subjects: Subject[];
  recentProgress: StudyProgress[];
  studySessions: StudySession[];
  subjectPerformances: SubjectPerformance[];
  exams: ExamInfo[];
  reports: ReportInfo[];
  radarChartData: RadarChartData[];
}
