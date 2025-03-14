/**
 * 教材エンティティ
 */
export interface Subject {
  id: string;
  title: string;
  totalPages: number;
  completedPages: number;
  progress: number; // パーセンテージ（0-100）
  createdAt: Date | string;
  updatedAt: Date | string;
  category?: string;
  deadline?: Date | string | null;
  description?: string;
  author?: string;
  imageUrl?: string;
}
