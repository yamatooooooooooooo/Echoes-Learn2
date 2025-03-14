/**
 * ダッシュボードデータのエンティティ定義
 */

import { Subject } from './Subject';
import { StudyProgress } from './StudyProgress';
import { StudySession } from './StudySession';
import { SubjectPerformance } from './SubjectPerformance';

export interface WeeklyProgressData {
  date: string;
  pagesRead: number;
  timeSpent: number;
}

export interface DashboardData {
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
} 