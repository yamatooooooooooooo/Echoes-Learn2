/**
 * 学習セッションエンティティ
 */
export interface StudySession {
  id: string;
  subjectId: string;
  subjectTitle?: string;
  startTime: Date | string;
  endTime: Date | string;
  durationMinutes: number;
  pagesRead?: number;
  fromPage?: number;
  toPage?: number;
  notes?: string;
  rating?: number; // 1-5の評価
} 