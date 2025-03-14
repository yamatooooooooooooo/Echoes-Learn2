import { Subject } from '../../models/SubjectModel';

/**
 * 科目リポジトリのインターフェース定義
 * ドメイン層とインフラ層の間の契約
 */
export interface ISubjectRepository {
  /**
   * ユーザーの全科目を取得
   */
  getAllSubjects(userId: string): Promise<Subject[]>;

  /**
   * 指定IDの科目を取得
   */
  getSubject(id: string): Promise<Subject | null>;

  /**
   * 科目を追加
   */
  addSubject(userId: string, subjectData: Partial<Subject>): Promise<string>;

  /**
   * 科目を更新
   */
  updateSubject(id: string, subjectData: Partial<Subject>): Promise<void>;

  /**
   * 科目を削除
   */
  deleteSubject(id: string): Promise<void>;

  getHighPrioritySubjects(userId: string, limit?: number): Promise<Subject[]>;
  getUpcomingExamSubjects(userId: string, limit?: number): Promise<Subject[]>;
  updateCompletionRate(id: string, completionRate: number): Promise<void>;
}
