export interface Subject {
  id: string;
  name: string;
  currentPage: number;
  totalPages: number;
  examDate: Date;
  textbookName?: string;
  reportDeadline?: Date;
  priority?: 'high' | 'medium' | 'low';
  importance?: 'high' | 'medium' | 'low';
  bufferDays?: number;
  updatedAt?: Date;
  createdAt?: Date;
}

export interface SubjectCreateInput {
  name: string;
  totalPages: number;
  examDate: Date;
  textbookName?: string;
  reportDeadline?: Date;
  currentPage?: number;
  priority?: 'high' | 'medium' | 'low';
  importance?: 'high' | 'medium' | 'low';
  bufferDays?: number;
}

export interface SubjectUpdateInput {
  name?: string;
  totalPages?: number;
  examDate?: Date;
  textbookName?: string;
  reportDeadline?: Date;
  currentPage?: number;
  priority?: 'high' | 'medium' | 'low';
  importance?: 'high' | 'medium' | 'low';
  bufferDays?: number;
} 