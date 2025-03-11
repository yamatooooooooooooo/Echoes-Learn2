import { Firestore, collection, getDocs, doc, deleteDoc, query, where, writeBatch } from 'firebase/firestore';
import { Auth } from 'firebase/auth';

/**
 * Firebaseデータクリーンアップユーティリティ
 */
export class FirebaseCleanupUtil {
  constructor(
    private readonly firestore: Firestore,
    private readonly auth: Auth
  ) {}

  /**
   * 現在のユーザーの全科目データを削除
   * @returns 削除した科目の数
   */
  async deleteAllSubjectsForCurrentUser(): Promise<number> {
    try {
      const userId = this.auth.currentUser?.uid;
      if (!userId) {
        throw new Error('認証されていません');
      }

      // バッチ操作で効率的に削除
      const batch = writeBatch(this.firestore);
      const subjectsRef = collection(this.firestore, 'subjects');
      const q = query(subjectsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      let count = 0;
      
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
        count++;
      });
      
      await batch.commit();
      console.log(`${count}個の科目を削除しました`);
      return count;
    } catch (error) {
      console.error('科目データの削除中にエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * 現在のユーザーの全進捗データを削除
   * @returns 削除した進捗データの数
   */
  async deleteAllProgressForCurrentUser(): Promise<number> {
    try {
      const userId = this.auth.currentUser?.uid;
      if (!userId) {
        throw new Error('認証されていません');
      }

      // ユーザーの進捗コレクションパス
      const progressRef = collection(this.firestore, 'users', userId, 'progress');
      const snapshot = await getDocs(progressRef);
      
      // バッチ操作で効率的に削除
      const batch = writeBatch(this.firestore);
      let count = 0;
      
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
        count++;
      });
      
      await batch.commit();
      console.log(`${count}個の進捗データを削除しました`);
      return count;
    } catch (error) {
      console.error('進捗データの削除中にエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * 現在のユーザーの学習分析データを削除
   * @returns 削除したデータの数
   */
  async deleteAllAnalyticsForCurrentUser(): Promise<number> {
    try {
      const userId = this.auth.currentUser?.uid;
      if (!userId) {
        throw new Error('認証されていません');
      }

      let totalCount = 0;
      
      // 学習セッションの削除
      const sessionsRef = collection(this.firestore, 'users', userId, 'study_sessions');
      const sessionsSnapshot = await getDocs(sessionsRef);
      
      const sessionsBatch = writeBatch(this.firestore);
      let sessionsCount = 0;
      
      sessionsSnapshot.forEach((doc) => {
        sessionsBatch.delete(doc.ref);
        sessionsCount++;
      });
      
      if (sessionsCount > 0) {
        await sessionsBatch.commit();
        totalCount += sessionsCount;
      }
      
      // 科目パフォーマンスデータの削除
      const performanceRef = collection(this.firestore, 'users', userId, 'subject_performances');
      const performanceSnapshot = await getDocs(performanceRef);
      
      const perfBatch = writeBatch(this.firestore);
      let perfCount = 0;
      
      performanceSnapshot.forEach((doc) => {
        perfBatch.delete(doc.ref);
        perfCount++;
      });
      
      if (perfCount > 0) {
        await perfBatch.commit();
        totalCount += perfCount;
      }
      
      console.log(`合計${totalCount}個の分析データを削除しました`);
      return totalCount;
    } catch (error) {
      console.error('分析データの削除中にエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * 現在のユーザーのすべてのデータを削除
   * @returns 削除したデータの総数
   */
  async cleanupAllUserData(): Promise<number> {
    try {
      const subjectsCount = await this.deleteAllSubjectsForCurrentUser();
      const progressCount = await this.deleteAllProgressForCurrentUser();
      const analyticsCount = await this.deleteAllAnalyticsForCurrentUser();
      
      const totalCount = subjectsCount + progressCount + analyticsCount;
      console.log(`クリーンアップ完了: 合計${totalCount}個のデータを削除しました`);
      return totalCount;
    } catch (error) {
      console.error('データクリーンアップ中にエラーが発生しました:', error);
      throw error;
    }
  }
} 