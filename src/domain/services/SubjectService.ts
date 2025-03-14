import { Subject, SubjectCreateInput, SubjectUpdateInput } from '../models/SubjectModel';
import { ISubjectRepository } from '../interfaces/repositories/ISubjectRepository';
import {
  calculatePriority,
  calculateDaysRemaining,
} from '../../presentation/features/subject/utils/subjectUtils';

/**
 * 科目に関するビジネスロジックを提供するサービスクラス
 * プレゼンテーション層とデータ層の間の仲介役となる
 */
export class SubjectService {
  constructor(private subjectRepository: ISubjectRepository) {}

  /**
   * すべての科目を取得
   */
  async getAllSubjects(): Promise<Subject[]> {
    const userId = 'current-user'; // 実際の実装ではユーザー認証情報から取得する
    return this.subjectRepository.getAllSubjects(userId);
  }

  /**
   * 指定IDの科目を取得
   */
  async getSubject(id: string): Promise<Subject | null> {
    return this.subjectRepository.getSubject(id);
  }

  /**
   * 新しい科目を作成
   */
  async createSubject(subjectData: SubjectCreateInput): Promise<string> {
    const userId = 'current-user'; // 実際の実装ではユーザー認証情報から取得する

    // 優先度が指定されていない場合は自動計算
    if (!subjectData.priority) {
      const tempSubject = {
        id: '',
        ...subjectData,
        currentPage: subjectData.currentPage || 0,
      } as Subject;

      subjectData.priority = calculatePriority(tempSubject);
    }

    return this.subjectRepository.addSubject(userId, subjectData);
  }

  /**
   * 科目を更新
   */
  async updateSubject(id: string, subjectData: SubjectUpdateInput): Promise<void> {
    // 優先度の自動計算が必要かどうかを判断
    if (subjectData.examDate && !subjectData.priority) {
      // 現在の科目データを取得
      const currentSubject = await this.subjectRepository.getSubject(id);

      if (currentSubject) {
        // 更新データと現在のデータをマージ
        const updatedSubject = {
          ...currentSubject,
          ...subjectData,
        };

        // 優先度を計算
        subjectData.priority = calculatePriority(updatedSubject);
      }
    }

    await this.subjectRepository.updateSubject(id, subjectData);
  }

  /**
   * 科目を削除
   */
  async deleteSubject(id: string): Promise<void> {
    await this.subjectRepository.deleteSubject(id);
  }

  /**
   * 試験日までの残り日数を計算
   */
  calculateRemainingDays(examDate: Date | string): number {
    return calculateDaysRemaining(examDate);
  }

  /**
   * 科目の優先度を計算
   */
  calculateSubjectPriority(subject: Subject): 'high' | 'medium' | 'low' {
    return calculatePriority(subject);
  }

  /**
   * 複数の科目の優先順位を一括更新
   */
  async updateSubjectPriorities(subjects: Subject[]): Promise<Subject[]> {
    const updatedSubjects: Subject[] = [];

    for (const subject of subjects) {
      if (subject.id) {
        await this.subjectRepository.updateSubject(subject.id, { priority: subject.priority });
        updatedSubjects.push(subject);
      }
    }

    return updatedSubjects;
  }
}
