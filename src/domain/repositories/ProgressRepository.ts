import { Progress, ProgressCreateInput, ProgressUpdateInput } from '../models/ProgressModel';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  deleteDoc,
  Timestamp,
  DocumentData,
  writeBatch
} from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';

/**
 * 進捗記録のリポジトリクラス
 * Firestoreとのデータのやり取りを担当
 */
export class ProgressRepository {
  private progressCollection;
  
  constructor(private db: Firestore) {
    this.progressCollection = collection(this.db, 'progresses');
  }

  /**
   * 進捗情報を新規登録
   * @param userId ユーザーID
   * @param data 進捗データ
   * @returns 進捗ID
   */
  async addProgress(userId: string, data: ProgressCreateInput): Promise<string> {
    const now = new Date();
    
    const progressData: Omit<Progress, 'id'> = {
      userId,
      subjectId: data.subjectId,
      startPage: data.startPage,
      endPage: data.endPage,
      pagesRead: data.pagesRead,
      recordDate: data.recordDate,
      studyDuration: data.studyDuration,
      satisfactionLevel: data.satisfactionLevel,
      memo: data.memo,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(this.progressCollection, progressData);
    return docRef.id;
  }

  /**
   * 進捗情報を更新
   * @param progressId 進捗ID
   * @param data 更新データ
   */
  async updateProgress(progressId: string, data: ProgressUpdateInput): Promise<void> {
    const updateData: Partial<Progress> = {
      ...data,
      updatedAt: new Date()
    };
    
    const docRef = doc(this.db, 'progresses', progressId);
    await updateDoc(docRef, updateData);
  }

  /**
   * 進捗情報を取得
   * @param progressId 進捗ID
   * @returns 進捗情報
   */
  async getProgress(progressId: string): Promise<Progress | null> {
    const docRef = doc(this.db, 'progresses', progressId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Progress;
  }

  /**
   * ユーザーの特定の科目に関する進捗情報を取得
   * @param userId ユーザーID
   * @param subjectId 科目ID
   * @returns 進捗情報の配列
   */
  async getProgressesBySubject(userId: string, subjectId: string): Promise<Progress[]> {
    const q = query(
      this.progressCollection,
      where('userId', '==', userId),
      where('subjectId', '==', subjectId),
      orderBy('recordDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Progress));
  }

  /**
   * ユーザーの全科目に関する進捗情報を取得
   * @param userId ユーザーID
   * @returns 進捗情報の配列
   */
  async getAllUserProgresses(userId: string): Promise<Progress[]> {
    const q = query(
      this.progressCollection,
      where('userId', '==', userId),
      orderBy('recordDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Progress));
  }

  /**
   * 指定期間内のユーザーの進捗情報を取得
   * @param userId ユーザーID
   * @param startDate 開始日
   * @param endDate 終了日
   * @returns 進捗情報の配列
   */
  async getProgressesByDateRange(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<Progress[]> {
    // Firestoreのクエリ用にタイムスタンプを変換
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    
    const q = query(
      this.progressCollection,
      where('userId', '==', userId),
      where('recordDate', '>=', startTimestamp),
      where('recordDate', '<=', endTimestamp),
      orderBy('recordDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Progress));
  }

  /**
   * 進捗情報を削除
   * @param progressId 進捗ID
   */
  async deleteProgress(progressId: string): Promise<void> {
    const docRef = doc(this.db, 'progresses', progressId);
    await deleteDoc(docRef);
  }

  /**
   * 科目に関連する全ての進捗情報を削除
   * @param subjectId 科目ID
   */
  async deleteProgressesBySubject(subjectId: string): Promise<void> {
    const q = query(
      this.progressCollection,
      where('subjectId', '==', subjectId)
    );
    
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(this.db);
    
    querySnapshot.docs.forEach(docSnapshot => {
      const docRef = doc(this.db, 'progresses', docSnapshot.id);
      batch.delete(docRef);
    });
    
    await batch.commit();
  }
} 