/**
 * ユーザー設定モデル
 * アプリケーション全体の設定情報を管理
 */
export interface UserSettings {
  id: string;
  maxConcurrentSubjects: number;   // 同時に学習する最大科目数
  dailyStudyHours: number;         // 1日あたりの学習時間（時間）
  studyDaysPerWeek: number;        // 週あたりの学習日数
  averagePageReadingTime: number;  // 1ページあたりの平均読了時間（分）
  examBufferDays: number;          // 試験前の余裕日数
  themeMode: 'light' | 'dark' | 'system';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ユーザー設定の新規作成用インターフェース
 */
export interface UserSettingsCreateInput {
  maxConcurrentSubjects: number;
  dailyStudyHours: number;
  studyDaysPerWeek: number;
  averagePageReadingTime: number;
  examBufferDays: number;
  themeMode?: 'light' | 'dark' | 'system';
}

/**
 * ユーザー設定の更新用インターフェース
 */
export interface UserSettingsUpdateInput {
  maxConcurrentSubjects?: number;
  dailyStudyHours?: number;
  studyDaysPerWeek?: number;
  averagePageReadingTime?: number;
  examBufferDays?: number;
  themeMode?: 'light' | 'dark' | 'system';
}

/**
 * デフォルトのユーザー設定
 */
export const DEFAULT_USER_SETTINGS = {
  maxConcurrentSubjects: 3,
  studyDaysPerWeek: 5,
  dailyStudyHours: 2,
  averagePageReadingTime: 3, // 1ページあたり3分
  examBufferDays: 7, // 試験日の1週間前までにノルマを完了
  themeMode: 'system' as 'light' | 'dark' | 'system',
}; 