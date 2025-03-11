import { Progress, ProgressCreateInput, ProgressUpdateInput } from '../models/ProgressModel';
import { Subject } from '../models/SubjectModel';
import { IProgressRepository } from '../interfaces/repositories/IProgressRepository';
import { ISubjectRepository } from '../interfaces/repositories/ISubjectRepository';
import { ProgressError } from '../errors/ProgressError';

/**
 * 進捗記録のビジネスロジックを提供するサービスクラス
 */
export class ProgressService {
  constructor(
    private progressRepository: IProgressRepository,
    private subjectRepository: ISubjectRepository
  ) {}

  /**
   * 進捗を記録し、科目の現在ページを更新
   * @param userId ユーザーID
   * @param progressData 進捗記録データ
   * @returns 作成された進捗記録のID
   */
  async recordProgress(userId: string, progressData: ProgressCreateInput): Promise<string> {
    try {
      // 入力データのバリデーション
      this.validateProgressInput(progressData);
      
      // 関連する科目を取得
      const subject = await this.subjectRepository.getSubject(progressData.subjectId);
      if (!subject) {
        throw new ProgressError('指定された科目が見つかりません', 'SUBJECT_NOT_FOUND', 'subjectId');
      }
      
      // 進捗のページ数が科目の総ページ数を超えていないか確認
      if (progressData.endPage > subject.totalPages) {
        throw new ProgressError(
          `終了ページ（${progressData.endPage}）が科目の総ページ数（${subject.totalPages}）を超えています`,
          'PAGE_EXCEED_TOTAL',
          'endPage'
        );
      }
      
      // 進捗記録を追加
      const progressId = await this.progressRepository.addProgress(userId, progressData);
      
      // 科目の現在ページを更新（より進んだページまでの場合のみ）
      if (progressData.endPage > (subject.currentPage || 0)) {
        await this.subjectRepository.updateSubject(subject.id, {
          currentPage: progressData.endPage,
          updatedAt: new Date()
        });
      }
      
      return progressId;
    } catch (error) {
      // エラーを再スロー
      if (error instanceof ProgressError) {
        throw error;
      }
      console.error('進捗の記録中にエラーが発生しました:', error);
      throw new ProgressError('進捗の記録に失敗しました', 'RECORDING_FAILED');
    }
  }

  /**
   * 特定の科目の進捗記録を取得
   * @param userId ユーザーID
   * @param subjectId 科目ID
   * @returns 進捗記録の配列
   */
  async getSubjectProgress(userId: string, subjectId: string): Promise<Progress[]> {
    try {
      return await this.progressRepository.getSubjectProgress(userId, subjectId);
    } catch (error) {
      console.error('進捗記録の取得中にエラーが発生しました:', error);
      throw new ProgressError('進捗記録の取得に失敗しました', 'FETCH_FAILED');
    }
  }

  /**
   * 進捗記録を更新
   * @param progressId 進捗記録ID
   * @param progressData 更新データ
   */
  async updateProgress(progressId: string, progressData: ProgressUpdateInput): Promise<void> {
    try {
      // 現在の進捗記録を取得
      const currentProgress = await this.progressRepository.getProgress(progressId);
      if (!currentProgress) {
        throw new ProgressError('指定された進捗記録が見つかりません', 'PROGRESS_NOT_FOUND');
      }
      
      // 関連する科目を取得
      const subject = await this.subjectRepository.getSubject(currentProgress.subjectId);
      if (!subject) {
        throw new ProgressError('関連する科目が見つかりません', 'SUBJECT_NOT_FOUND');
      }
      
      // 更新データの検証
      this.validateProgressUpdateInput(progressData, subject);
      
      // 進捗記録を更新
      await this.progressRepository.updateProgress(progressId, progressData);
      
      // 科目の現在ページを更新（進捗の終了ページが現在のページより大きい場合）
      if (progressData.endPage && progressData.endPage > (subject.currentPage || 0)) {
        await this.subjectRepository.updateSubject(subject.id, {
          currentPage: progressData.endPage,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      if (error instanceof ProgressError) {
        throw error;
      }
      console.error('進捗記録の更新中にエラーが発生しました:', error);
      throw new ProgressError('進捗記録の更新に失敗しました', 'UPDATE_FAILED');
    }
  }

  /**
   * 進捗記録を削除
   * @param progressId 進捗記録ID
   */
  async deleteProgress(progressId: string): Promise<void> {
    try {
      await this.progressRepository.deleteProgress(progressId);
    } catch (error) {
      console.error('進捗記録の削除中にエラーが発生しました:', error);
      throw new ProgressError('進捗記録の削除に失敗しました', 'DELETE_FAILED');
    }
  }

  /**
   * 進捗データの入力値を検証
   * @private
   */
  private validateProgressInput(progress: ProgressCreateInput): void {
    if (!progress.subjectId) {
      throw new ProgressError('科目IDは必須です', 'MISSING_SUBJECT_ID', 'subjectId');
    }
    
    if (progress.startPage < 0) {
      throw new ProgressError('開始ページは0以上である必要があります', 'INVALID_START_PAGE', 'startPage');
    }
    
    if (progress.endPage < progress.startPage) {
      throw new ProgressError('終了ページは開始ページ以上である必要があります', 'INVALID_END_PAGE', 'endPage');
    }
    
    if (!progress.recordDate) {
      throw new ProgressError('記録日は必須です', 'MISSING_RECORD_DATE', 'recordDate');
    }
    
    // 日付が有効かチェック
    try {
      const date = new Date(progress.recordDate);
      if (isNaN(date.getTime())) {
        throw new ProgressError('有効な日付を入力してください', 'INVALID_DATE_FORMAT', 'recordDate');
      }
    } catch (error) {
      throw new ProgressError('有効な日付を入力してください', 'INVALID_DATE_FORMAT', 'recordDate');
    }
  }

  /**
   * 進捗更新データの入力値を検証
   * @private
   */
  private validateProgressUpdateInput(progress: ProgressUpdateInput, subject: Subject): void {
    // 開始ページの検証
    if (progress.startPage !== undefined && progress.startPage < 0) {
      throw new ProgressError('開始ページは0以上である必要があります', 'INVALID_START_PAGE', 'startPage');
    }
    
    // 終了ページの検証
    if (progress.endPage !== undefined) {
      // 開始ページも指定されている場合
      if (progress.startPage !== undefined && progress.endPage < progress.startPage) {
        throw new ProgressError('終了ページは開始ページ以上である必要があります', 'INVALID_END_PAGE', 'endPage');
      }
      
      // 科目の総ページ数を超えていないか
      if (progress.endPage > subject.totalPages) {
        throw new ProgressError(
          `終了ページ（${progress.endPage}）が科目の総ページ数（${subject.totalPages}）を超えています`,
          'PAGE_EXCEED_TOTAL',
          'endPage'
        );
      }
    }
    
    // 記録日が指定されている場合は検証
    if (progress.recordDate) {
      try {
        const date = new Date(progress.recordDate);
        if (isNaN(date.getTime())) {
          throw new ProgressError('有効な日付を入力してください', 'INVALID_DATE_FORMAT', 'recordDate');
        }
      } catch (error) {
        throw new ProgressError('有効な日付を入力してください', 'INVALID_DATE_FORMAT', 'recordDate');
      }
    }
  }
} 