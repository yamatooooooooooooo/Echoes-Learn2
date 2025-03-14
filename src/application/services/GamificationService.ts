import { GamificationRepository } from '../../infrastructure/repositories/gamificationRepository';
import { StudyAnalyticsRepository } from '../../infrastructure/repositories/studyAnalyticsRepository';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';

/**
 * ゲーミフィケーション機能を処理するサービスクラス
 */
export class GamificationService {
  private gamificationRepo: GamificationRepository;
  private studyAnalyticsRepo: StudyAnalyticsRepository;

  constructor(firestore: Firestore, auth: Auth) {
    if (!firestore || !auth) {
      throw new Error('GamificationServiceの初期化にはFirestoreとAuthインスタンスが必要です');
    }

    // リポジトリインスタンスを初期化
    this.gamificationRepo = new GamificationRepository(firestore, auth);
    this.studyAnalyticsRepo = new StudyAnalyticsRepository(firestore, auth);
  }

  /**
   * ユーザーの経験値情報を取得
   */
  async getUserExperience(userId: string): Promise<any> {
    return this.gamificationRepo.getUserExperience(userId);
  }

  /**
   * ユーザーの実績を取得
   */
  async getUserAchievements(userId: string): Promise<any[]> {
    return this.gamificationRepo.getAchievements(userId);
  }

  /**
   * 経験値を追加
   */
  async addExperience(userId: string, amount: number): Promise<any> {
    return this.gamificationRepo.addExperience(userId, amount);
  }
}
