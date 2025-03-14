import { Progress, ProgressCreateInput, ProgressUpdateInput } from '../../models/ProgressModel';

/**
 * 進捗記録リポジトリのインターフェース
 */
export interface IProgressRepository {
  /**
   * 進捗記録を追加
   * @param userId ユーザーID
   * @param progressData 進捗記録データ
   */
  addProgress(userId: string, progressData: ProgressCreateInput): Promise<string>;

  /**
   * 指定IDの進捗記録を取得
   * @param progressId 進捗記録ID
   */
  getProgress(progressId: string): Promise<Progress | null>;

  /**
   * 指定ユーザーの全進捗記録を取得
   * @param userId ユーザーID
   */
  getAllProgress(userId: string): Promise<Progress[]>;

  /**
   * 特定の科目の進捗記録を取得
   * @param userId ユーザーID
   * @param subjectId 科目ID
   */
  getSubjectProgress(userId: string, subjectId: string): Promise<Progress[]>;

  /**
   * 進捗記録を更新
   * @param progressId 進捗記録ID
   * @param progressData 更新データ
   */
  updateProgress(progressId: string, progressData: ProgressUpdateInput): Promise<void>;

  /**
   * 進捗記録を削除
   * @param progressId 進捗記録ID
   */
  deleteProgress(progressId: string): Promise<void>;
}
