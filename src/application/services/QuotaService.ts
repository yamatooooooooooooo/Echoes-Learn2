import { SubjectRepository } from '../../infrastructure/repositories/subjectRepository';
import { ProgressRepository } from '../../infrastructure/repositories/progressRepository';
import { UserSettingsRepository } from '../../infrastructure/repositories/userSettingsRepository';

/**
 * 学習ノルマを計算するサービス
 */
export class QuotaService {
  constructor(
    private subjectRepository: SubjectRepository,
    private progressRepository: ProgressRepository,
    private userSettingsRepository: UserSettingsRepository
  ) {}

  /**
   * 日次ノルマを計算する
   * @param userId ユーザーID
   */
  async calculateDailyQuota(userId: string): Promise<any> {
    console.log('日次ノルマを計算中...', userId);
    // 実際の実装はここに記述
    return {};
  }

  /**
   * 週次ノルマを計算する
   * @param userId ユーザーID
   */
  async calculateWeeklyQuota(userId: string): Promise<any> {
    console.log('週次ノルマを計算中...', userId);
    // 実際の実装はここに記述
    return {};
  }
}
