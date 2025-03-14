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
  memo?: string; // 学習メモ
  reportProgress?: string; // レポート進捗
  satisfactionLevel?: number; // 満足度（1-3の範囲、1:低、2:中、3:高）
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 進捗データ（学習分析用のデータ形式）
 */
export interface ProgressData {
  id: string;
  userId: string;
  subjectId: string;
  subjectName: string;
  pageNumber: number;
  date: Date;
  duration: number;
  note: string;
  satisfaction: number;
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
  memo?: string;
  reportProgress?: string;
  satisfactionLevel?: number;
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
  memo?: string;
  reportProgress?: string;
  satisfactionLevel?: number;
}

export interface ProgressFormData {
  recordDate: string;
  startPage: number;
  endPage: number;
  pagesRead: number;
  startTime?: string;
  endTime?: string;
  duration?: number;
}

export interface QuickProgressInput {
  subjectId: string;
  pages: number;
  duration?: number;
} 