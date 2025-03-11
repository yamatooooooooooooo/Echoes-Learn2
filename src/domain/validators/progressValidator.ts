import { ProgressFormData } from '../models/ProgressModel';
import { Subject } from '../models/SubjectModel';

export class ProgressValidator {
  static validateProgressInput(
    progressData: ProgressFormData,
    subject: Subject
  ): void {
    if (progressData.endPage < progressData.startPage) {
      throw new Error('終了ページは開始ページより大きい値を入力してください');
    }

    if (progressData.endPage > subject.totalPages) {
      throw new Error('終了ページが総ページ数を超えています');
    }

    if (progressData.startPage < 0) {
      throw new Error('開始ページは0以上の値を入力してください');
    }
  }

  static validateQuickProgress(
    currentPage: number,
    newPage: number,
    totalPages: number
  ): void {
    if (currentPage === newPage) {
      throw new Error('これ以上進捗を追加できません');
    }

    if (newPage > totalPages) {
      throw new Error('追加ページ数が総ページ数を超えています');
    }
  }
} 