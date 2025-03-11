import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';

/**
 * ユーザー情報を管理するリポジトリ
 */
export class UserRepository {
  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {}

  /**
   * 現在のユーザーIDを取得
   */
  getCurrentUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }

  /**
   * ユーザー情報を取得
   */
  async getUserProfile(userId: string): Promise<any> {
    console.log('ユーザー情報を取得中...', userId);
    // 実際の実装はここに記述
    return {};
  }
} 