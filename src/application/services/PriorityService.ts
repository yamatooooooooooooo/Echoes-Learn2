import { SubjectRepository } from '../../infrastructure/repositories/subjectRepository';
import { ProgressRepository } from '../../infrastructure/repositories/progressRepository';

/**
 * 科目の優先順位を計算するサービス
 */
export class PriorityService {
  constructor(
    private subjectRepository: SubjectRepository,
    private progressRepository: ProgressRepository
  ) {}

  /**
   * 科目の優先順位を自動計算する
   * @param userId ユーザーID
   */
  async calculatePriorities(userId: string): Promise<void> {
    console.log('優先順位を計算中...', userId);
    // 実際の実装はここに記述
  }
}
