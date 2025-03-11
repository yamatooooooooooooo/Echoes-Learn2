import { 
  Firestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { Progress, ProgressCreateInput, ProgressUpdateInput } from '../../domain/models/ProgressModel';
import { IProgressRepository } from '../../domain/interfaces/repositories/IProgressRepository';

/**
 * 進捗記録リポジトリの実装クラス
 * Firestoreとの連携を行う
 */
export class ProgressRepository implements IProgressRepository {
  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {}

  /**
   * 進捗記録を追加
   */
  async addProgress(userId: string, progressData: ProgressCreateInput): Promise<string> {
    try {
      // タイムスタンプを追加
      const progressWithTimestamp = {
        ...progressData,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Firestoreに保存
      const progressRef = collection(this.firestore, 'users', userId, 'progress');
      const docRef = await addDoc(progressRef, progressWithTimestamp);
      return docRef.id;
    } catch (error) {
      console.error('進捗記録の追加に失敗しました:', error);
      throw error;
    }
  }

  /**
   * 指定IDの進捗記録を取得
   */
  async getProgress(progressId: string): Promise<Progress | null> {
    try {
      const userId = this.auth.currentUser?.uid;
      if (!userId) {
        throw new Error('認証されていません');
      }
      
      const progressRef = doc(this.firestore, 'users', userId, 'progress', progressId);
      const progressSnap = await getDoc(progressRef);
      
      if (!progressSnap.exists()) {
        return null;
      }
      
      const data = progressSnap.data();
      // 日付をDateオブジェクトに変換
      return {
        id: progressSnap.id,
        ...data,
        recordDate: data.recordDate ? new Date(data.recordDate.toDate()) : new Date(),
        createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
        updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()) : new Date()
      } as Progress;
    } catch (error) {
      console.error('進捗記録の取得に失敗しました:', error);
      throw error;
    }
  }

  /**
   * 指定ユーザーの全進捗記録を取得
   */
  async getAllProgress(userId: string): Promise<Progress[]> {
    try {
      const progressRef = collection(this.firestore, 'users', userId, 'progress');
      const q = query(progressRef, orderBy('recordDate', 'desc'));
      const snapshot = await getDocs(q);
      
      const progress: Progress[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        progress.push({
          id: doc.id,
          ...data,
          recordDate: data.recordDate ? new Date(data.recordDate.toDate()) : new Date(),
          createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()) : new Date()
        } as Progress);
      });
      
      return progress;
    } catch (error) {
      console.error('進捗記録の取得に失敗しました:', error);
      throw error;
    }
  }

  /**
   * 特定の科目の進捗記録を取得
   */
  async getSubjectProgress(userId: string, subjectId: string): Promise<Progress[]> {
    try {
      const progressRef = collection(this.firestore, 'users', userId, 'progress');
      const q = query(
        progressRef,
        where('subjectId', '==', subjectId),
        orderBy('recordDate', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      const progress: Progress[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        progress.push({
          id: doc.id,
          ...data,
          recordDate: data.recordDate ? new Date(data.recordDate.toDate()) : new Date(),
          createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()) : new Date()
        } as Progress);
      });
      
      return progress;
    } catch (error) {
      console.error('科目の進捗記録の取得に失敗しました:', error);
      throw error;
    }
  }

  /**
   * 進捗記録を更新
   */
  async updateProgress(progressId: string, progressData: ProgressUpdateInput): Promise<void> {
    try {
      const userId = this.auth.currentUser?.uid;
      if (!userId) {
        throw new Error('認証されていません');
      }
      
      // updatedAtを更新
      const updateData = {
        ...progressData,
        updatedAt: new Date()
      };
      
      const progressRef = doc(this.firestore, 'users', userId, 'progress', progressId);
      await updateDoc(progressRef, updateData);
    } catch (error) {
      console.error('進捗記録の更新に失敗しました:', error);
      throw error;
    }
  }

  /**
   * 進捗記録を削除
   */
  async deleteProgress(progressId: string): Promise<void> {
    try {
      const userId = this.auth.currentUser?.uid;
      if (!userId) {
        throw new Error('認証されていません');
      }
      
      const progressRef = doc(this.firestore, 'users', userId, 'progress', progressId);
      await deleteDoc(progressRef);
    } catch (error) {
      console.error('進捗記録の削除に失敗しました:', error);
      throw error;
    }
  }
} 