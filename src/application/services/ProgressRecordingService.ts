import { ProgressRepository } from '../../infrastructure/repositories/progressRepository';
import { GamificationService } from './GamificationService';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { ProgressFormData, ProgressCreateInput } from '../../domain/models/ProgressModel';

/**
 * 進捗記録サービス
 */
export class ProgressRecordingService {
  private progressRepo: ProgressRepository;
  private gamificationService: GamificationService;
  
  constructor(firestore: Firestore, auth: Auth) {
    if (!firestore || !auth) {
      throw new Error('ProgressRecordingServiceの初期化にはFirestoreとAuthインスタンスが必要です');
    }
    
    // リポジトリインスタンスを初期化
    this.progressRepo = new ProgressRepository(firestore, auth);
    this.gamificationService = new GamificationService(firestore, auth);
  }
  
  /**
   * 進捗を記録する
   */
  async recordProgress(
    userId: string, 
    subjectId: string, 
    progressData: ProgressFormData
  ): Promise<{ success: boolean; expGained: number }> {
    // 進捗を保存
    const progressInput: ProgressCreateInput = {
      subjectId,
      startPage: progressData.startPage,
      endPage: progressData.endPage,
      pagesRead: progressData.pagesRead,
      recordDate: progressData.recordDate,
      studyDuration: progressData.duration,
      memo: ''
    };
    
    // 新しい進捗を追加
    await this.progressRepo.addProgress(userId, progressInput);
    
    // 経験値を付与（ページ数に応じて）
    const pagesRead = progressData.pagesRead || 0;
    const expGained = pagesRead * 10; // 1ページあたり10EXP
    
    if (expGained > 0) {
      await this.gamificationService.addExperience(userId, expGained);
    }
    
    return {
      success: true,
      expGained
    };
  }
} 