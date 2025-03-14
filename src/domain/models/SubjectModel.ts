export interface Subject {
  id: string;
  name: string;
  currentPage: number;
  totalPages: number;
  examDate: Date;
  textbookName?: string;
  reportDeadline?: Date;
  deadlineType?: 'report' | 'assignment' | 'other';
  reportDetails?: string;
  reportSubmitted?: boolean;
  priority?: 'high' | 'medium' | 'low';
  importance?: 'high' | 'medium' | 'low';
  bufferDays?: number;
  completionRate?: number;
  updatedAt?: Date;
  createdAt?: Date;
}

export interface SubjectCreateInput {
  name: string;
  totalPages: number;
  examDate: Date;
  textbookName?: string;
  reportDeadline?: Date;
  deadlineType?: 'report' | 'assignment' | 'other';
  reportDetails?: string;
  currentPage?: number;
  priority?: 'high' | 'medium' | 'low';
  importance?: 'high' | 'medium' | 'low';
  bufferDays?: number;
  completionRate?: number;
}

export interface SubjectUpdateInput {
  name?: string;
  totalPages?: number;
  examDate?: Date;
  textbookName?: string;
  reportDeadline?: Date;
  deadlineType?: 'report' | 'assignment' | 'other';
  reportDetails?: string;
  currentPage?: number;
  priority?: 'high' | 'medium' | 'low';
  importance?: 'high' | 'medium' | 'low';
  bufferDays?: number;
  completionRate?: number;
} 