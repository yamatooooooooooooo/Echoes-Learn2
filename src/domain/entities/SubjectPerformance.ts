/**
 * 教材パフォーマンスエンティティ
 */
export interface SubjectPerformance {
  subjectId: string;
  subjectTitle: string;
  averagePagesPerDay: number;
  averageTimePerDay: number;
  totalTimeSpent: number;
  consistencyScore: number; // 0-100の値、高いほど一貫性がある
  productivity: number; // ページ数/時間の効率
  lastStudyDate: Date | string;
  studyFrequency: number; // 週あたりの学習日数
} 