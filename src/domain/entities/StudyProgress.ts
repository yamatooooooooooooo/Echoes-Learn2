/**
 * 学習進捗エンティティ
 */
export interface StudyProgress {
  id: string;
  subjectId: string;
  subjectTitle?: string;
  pagesRead: number;
  fromPage: number;
  toPage: number;
  timestamp: Date | string;
  notes?: string;
  timeSpentMinutes?: number;
} 