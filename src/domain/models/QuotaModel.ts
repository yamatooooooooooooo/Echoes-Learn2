import { Subject } from './SubjectModel';

/**
 * 学習ノルマのインターフェース
 */
export interface StudyQuota {
  subjectId: string;
  subjectName: string;
  pages: number;             // 学習するページ数
  estimatedMinutes: number;  // 推定学習時間（分）
  priority: 'high' | 'medium' | 'low';
  examDate?: Date;
  isCompleted: boolean;      // 完了済みかどうか
  pagesRead?: number;        // 実際に読了したページ数
  progressPercentage?: number; // 進捗率（%）
  daysRemaining?: number;    // 試験日までの残り日数
  daysUntilTarget?: number;  // 目標達成日までの残り日数（バッファ含む）
}

/**
 * デイリーノルマのインターフェース
 */
export interface DailyQuota {
  date: Date;                 // 対象日
  totalPages: number;         // 合計ページ数
  totalMinutes: number;       // 合計推定時間（分）
  quotaItems: StudyQuota[];   // 科目ごとのノルマ
  isCompleted: boolean;       // すべてのノルマが完了しているか
  pages?: number;             // 既存コードとの互換性のため
  targetPages?: number;       // 既存コードとの互換性のため
  completedPages?: number;    // 既存コードとの互換性のため
  activeSubjectsCount?: number; // 同時進行中の科目数
}

/**
 * ウィークリーノルマのインターフェース
 */
export interface WeeklyQuota {
  startDate: Date;            // 週の開始日
  endDate: Date;              // 週の終了日
  totalPages: number;         // 合計ページ数
  totalMinutes: number;       // 合計推定時間（分）
  quotaItems: StudyQuota[];   // 科目ごとのノルマ
  dailyDistribution: {        // 日ごとの配分
    [key: string]: number;    // 日付：ページ数
  };
  isCompleted: boolean;       // すべてのノルマが完了しているか
  weekStart?: string;         // 既存コードとの互換性のため
  weekEnd?: string;           // 既存コードとの互換性のため
  targetPages?: number;       // 既存コードとの互換性のため
  completedPages?: number;    // 既存コードとの互換性のため
} 