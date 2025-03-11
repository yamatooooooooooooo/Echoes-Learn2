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
  orderBy,
  limit,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { Progress, ProgressCreateInput, ProgressUpdateInput } from '../../domain/models/ProgressModel';
import { IProgressRepository } from '../../domain/interfaces/repositories/IProgressRepository';

/**
 * 進捗情報を管理するリポジトリ
 */
export class ProgressRepository implements IProgressRepository {
  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {}

  /**
   * Firestoreのタイムスタンプまたは日付文字列からJavaScriptのDateオブジェクトに変換する
   * @param dateField Firestoreのタイムスタンプか日付文字列
   * @returns JavaScriptのDateオブジェクト
   */
  private convertToDate(dateField: any): Date {
    if (!dateField) return new Date();
    
    // FirestoreのTimestamp型の場合
    if (dateField && typeof dateField.toDate === 'function') {
      return dateField.toDate();
    }
    
    // 文字列の場合
    if (typeof dateField === 'string') {
      return new Date(dateField);
    }
    
    // Dateオブジェクトの場合
    if (dateField instanceof Date) {
      return dateField;
    }
    
    // 数値（タイムスタンプ）の場合
    if (typeof dateField === 'number') {
      return new Date(dateField);
    }
    
    console.warn('不明な日付形式:', dateField);
    return new Date(); // デフォルトは現在時刻
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
          recordDate: this.convertToDate(data.recordDate),
          updatedAt: this.convertToDate(data.updatedAt),
          createdAt: this.convertToDate(data.createdAt)
        } as Progress);
      });
      
      return progress;
    } catch (error) {
      console.error('進捗データの取得中にエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * 指定IDの進捗情報を取得
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
      const progress: Progress = {
        id: progressSnap.id,
        ...data,
        recordDate: this.convertToDate(data.recordDate),
        updatedAt: this.convertToDate(data.updatedAt),
        createdAt: this.convertToDate(data.createdAt)
      } as Progress;
      
      return progress;
    } catch (error) {
      console.error('進捗データの取得中にエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * 進捗情報を追加
   */
  async addProgress(userId: string, progressData: ProgressCreateInput): Promise<string> {
    try {
      // 日付データを適切な形式に変換
      const firestoreData = {
        ...progressData,
        recordDate: progressData.recordDate ? 
          (typeof progressData.recordDate === 'string' ? 
            Timestamp.fromDate(new Date(progressData.recordDate)) : 
            Timestamp.fromDate(progressData.recordDate)
          ) : 
          Timestamp.fromDate(new Date()),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Firestoreにデータを追加
      const progressRef = collection(this.firestore, 'users', userId, 'progress');
      const docRef = await addDoc(progressRef, firestoreData);
      return docRef.id;
    } catch (error) {
      console.error('進捗データの追加中にエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * 進捗情報を更新
   */
  async updateProgress(progressId: string, progressData: ProgressUpdateInput): Promise<void> {
    try {
      const userId = this.auth.currentUser?.uid;
      if (!userId) {
        throw new Error('認証されていません');
      }
      
      // 日付データを適切な形式に変換
      const updateData: any = {...progressData};
      
      if (progressData.recordDate) {
        updateData.recordDate = typeof progressData.recordDate === 'string' ? 
          Timestamp.fromDate(new Date(progressData.recordDate)) : 
          Timestamp.fromDate(progressData.recordDate);
      }
      
      // 更新日時を設定
      updateData.updatedAt = serverTimestamp();
      
      const progressRef = doc(this.firestore, 'users', userId, 'progress', progressId);
      await updateDoc(progressRef, updateData);
    } catch (error) {
      console.error('進捗データの更新中にエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * 進捗情報を削除
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
      console.error('進捗データの削除中にエラーが発生しました:', error);
      throw error;
    }
  }
  
  /**
   * 最近の進捗記録を取得
   */
  async getRecentProgress(userId: string, limitCount: number = 10): Promise<Progress[]> {
    try {
      const progressRef = collection(this.firestore, 'users', userId, 'progress');
      const q = query(
        progressRef,
        orderBy('recordDate', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      
      const progressList: Progress[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        progressList.push({
          id: doc.id,
          ...data,
          recordDate: this.convertToDate(data.recordDate),
          updatedAt: this.convertToDate(data.updatedAt),
          createdAt: this.convertToDate(data.createdAt)
        } as Progress);
      });
      
      return progressList;
    } catch (error) {
      console.error('最近の進捗データの取得中にエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * ユーザーの全進捗情報を取得
   */
  async getAllProgress(userId: string): Promise<Progress[]> {
    try {
      const progressRef = collection(this.firestore, 'users', userId, 'progress');
      const q = query(progressRef, orderBy('recordDate', 'desc'));
      
      const snapshot = await getDocs(q);
      
      const progressList: Progress[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        progressList.push({
          id: doc.id,
          ...data,
          recordDate: this.convertToDate(data.recordDate),
          updatedAt: this.convertToDate(data.updatedAt),
          createdAt: this.convertToDate(data.createdAt)
        } as Progress);
      });
      
      return progressList;
    } catch (error) {
      console.error('進捗データの取得中にエラーが発生しました:', error);
      throw error;
    }
  }
  
  /**
   * 特定の期間の進捗情報を取得
   */
  async getProgressByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Progress[]> {
    try {
      const progressRef = collection(this.firestore, 'users', userId, 'progress');
      const q = query(
        progressRef,
        where('recordDate', '>=', Timestamp.fromDate(startDate)),
        where('recordDate', '<=', Timestamp.fromDate(endDate)),
        orderBy('recordDate', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      const progressList: Progress[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        progressList.push({
          id: doc.id,
          ...data,
          recordDate: this.convertToDate(data.recordDate),
          updatedAt: this.convertToDate(data.updatedAt),
          createdAt: this.convertToDate(data.createdAt)
        } as Progress);
      });
      
      return progressList;
    } catch (error) {
      console.error('期間指定での進捗データの取得中にエラーが発生しました:', error);
      throw error;
    }
  }
} 