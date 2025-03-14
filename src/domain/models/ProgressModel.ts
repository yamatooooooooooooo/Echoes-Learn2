/**
 * 進捗記録のモデル定義
 */
export interface Progress {
  id?: string;
  userId: string;
  subjectId: string;
  startPage: number;
  endPage: number;
  pagesRead: number;
  recordDate: string | Date;
  studyDuration?: number; // 学習時間（分）
  satisfactionLevel?: 'good' | 'neutral' | 'bad'; // 満足度（良い・普通・悪い）
  memo?: string; // 学習メモ
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 進捗記録作成時の入力インターフェース
 */
export interface ProgressCreateInput {
  subjectId: string;
  startPage: number;
  endPage: number;
  pagesRead: number;
  recordDate: string | Date;
  studyDuration?: number;
  satisfactionLevel?: 'good' | 'neutral' | 'bad';
  memo?: string;
}

/**
 * 進捗記録更新時の入力インターフェース
 */
export interface ProgressUpdateInput {
  startPage?: number;
  endPage?: number;
  pagesRead?: number;
  recordDate?: string | Date;
  studyDuration?: number;
  satisfactionLevel?: 'good' | 'neutral' | 'bad';
  memo?: string;
}

export interface ProgressFormData {
  recordDate: string;
  startPage: number;
  endPage: number;
  pagesRead: number;
  startTime?: string;
  endTime?: string;
  duration?: number;
  studyDuration?: number;
  satisfactionLevel?: 'good' | 'neutral' | 'bad';
  memo?: string;
}

export interface QuickProgressInput {
  subjectId: string;
  pages: number;
  duration?: number;
  satisfactionLevel?: 'good' | 'neutral' | 'bad';
} 