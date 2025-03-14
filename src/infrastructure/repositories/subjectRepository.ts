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
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { Subject } from '../../domain/models/SubjectModel';
import { ISubjectRepository } from '../../domain/interfaces/repositories/ISubjectRepository';

/**
 * 科目情報を管理するリポジトリ
 */
export class SubjectRepository implements ISubjectRepository {
  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {}

  /**
   * ユーザーの全科目を取得
   */
  async getAllSubjects(userId: string): Promise<Subject[]> {
    console.log('全科目を取得中...', userId);

    try {
      // Firestoreからデータを取得
      const subjectsRef = collection(this.firestore, 'users', userId, 'subjects');
      const q = query(subjectsRef, orderBy('updatedAt', 'desc'));
      const subjectsSnapshot = await getDocs(q);

      const subjects: Subject[] = [];
      subjectsSnapshot.forEach((doc) => {
        const data = doc.data();
        // 日付をDateオブジェクトに変換
        const subject: Subject = {
          id: doc.id,
          ...data,
          examDate: data.examDate ? new Date(data.examDate.toDate()) : new Date(),
          reportDeadline: data.reportDeadline ? new Date(data.reportDeadline.toDate()) : undefined,
          updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()) : new Date(),
          createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
        } as Subject;
        subjects.push(subject);
      });

      return subjects;
    } catch (error) {
      console.error('科目データの取得中にエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * 科目を追加
   */
  async addSubject(userId: string, subjectData: Partial<Subject>): Promise<string> {
    console.log('科目を追加中...', userId, subjectData);

    try {
      // 日付データを適切な形式に変換
      const firestoreData = {
        ...subjectData,
        examDate: subjectData.examDate ? Timestamp.fromDate(new Date(subjectData.examDate)) : null,
        reportDeadline: subjectData.reportDeadline
          ? Timestamp.fromDate(new Date(subjectData.reportDeadline))
          : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Firestoreにデータを追加
      const subjectsRef = collection(this.firestore, 'users', userId, 'subjects');
      const docRef = await addDoc(subjectsRef, firestoreData);
      return docRef.id;
    } catch (error) {
      console.error('科目データの追加中にエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * 指定IDの科目を取得
   */
  async getSubject(id: string): Promise<Subject | null> {
    try {
      const userId = this.auth.currentUser?.uid;
      if (!userId) {
        throw new Error('認証されていません');
      }

      const subjectRef = doc(this.firestore, 'users', userId, 'subjects', id);
      const subjectSnap = await getDoc(subjectRef);

      if (!subjectSnap.exists()) {
        return null;
      }

      const data = subjectSnap.data();
      const subject: Subject = {
        id: subjectSnap.id,
        ...data,
        examDate: data.examDate ? new Date(data.examDate.toDate()) : new Date(),
        reportDeadline: data.reportDeadline ? new Date(data.reportDeadline.toDate()) : undefined,
        updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()) : new Date(),
        createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
      } as Subject;

      return subject;
    } catch (error) {
      console.error('科目データの取得中にエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * 科目を更新
   */
  async updateSubject(id: string, subjectData: Partial<Subject>): Promise<void> {
    try {
      const userId = this.auth.currentUser?.uid;
      if (!userId) {
        throw new Error('認証されていません');
      }

      // 日付データを適切な形式に変換
      const updateData: any = { ...subjectData };

      if (subjectData.examDate) {
        updateData.examDate = Timestamp.fromDate(new Date(subjectData.examDate));
      }

      if (subjectData.reportDeadline) {
        updateData.reportDeadline = Timestamp.fromDate(new Date(subjectData.reportDeadline));
      }

      // 更新日時を設定
      updateData.updatedAt = serverTimestamp();

      const subjectRef = doc(this.firestore, 'users', userId, 'subjects', id);
      await updateDoc(subjectRef, updateData);
    } catch (error) {
      console.error('科目データの更新中にエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * 科目を削除
   */
  async deleteSubject(id: string): Promise<void> {
    try {
      const userId = this.auth.currentUser?.uid;
      if (!userId) {
        throw new Error('認証されていません');
      }

      const subjectRef = doc(this.firestore, 'users', userId, 'subjects', id);
      await deleteDoc(subjectRef);
    } catch (error) {
      console.error('科目データの削除中にエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * 科目の完了率を更新
   * @param id 科目ID
   * @param completionRate 新しい完了率 (0-100)
   */
  async updateCompletionRate(id: string, completionRate: number): Promise<void> {
    try {
      const userId = this.auth.currentUser?.uid;
      if (!userId) {
        throw new Error('認証されていません');
      }

      // 完了率は0-100の範囲内に制限
      const validCompletionRate = Math.max(0, Math.min(100, completionRate));

      const subjectRef = doc(this.firestore, 'users', userId, 'subjects', id);
      await updateDoc(subjectRef, {
        completionRate: validCompletionRate,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('科目の完了率更新中にエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * 優先度の高い科目を取得
   */
  async getHighPrioritySubjects(userId: string, limit = 5): Promise<Subject[]> {
    try {
      const subjectsRef = collection(this.firestore, 'users', userId, 'subjects');
      const q = query(subjectsRef, where('priority', '==', 'high'), orderBy('examDate', 'asc'));

      const snapshot = await getDocs(q);

      const subjects: Subject[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        subjects.push({
          id: doc.id,
          ...data,
          examDate: data.examDate ? new Date(data.examDate.toDate()) : new Date(),
          reportDeadline: data.reportDeadline ? new Date(data.reportDeadline.toDate()) : undefined,
          updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()) : new Date(),
          createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
        } as Subject);
      });

      return subjects.slice(0, limit);
    } catch (error) {
      console.error('優先度の高い科目の取得中にエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * 試験日が近い科目を取得
   */
  async getUpcomingExamSubjects(userId: string, limit = 5): Promise<Subject[]> {
    try {
      const now = new Date();
      const subjectsRef = collection(this.firestore, 'users', userId, 'subjects');
      const q = query(
        subjectsRef,
        where('examDate', '>=', Timestamp.fromDate(now)),
        orderBy('examDate', 'asc')
      );

      const snapshot = await getDocs(q);

      const subjects: Subject[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        subjects.push({
          id: doc.id,
          ...data,
          examDate: data.examDate ? new Date(data.examDate.toDate()) : new Date(),
          reportDeadline: data.reportDeadline ? new Date(data.reportDeadline.toDate()) : undefined,
          updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()) : new Date(),
          createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
        } as Subject);
      });

      return subjects.slice(0, limit);
    } catch (error) {
      console.error('試験日が近い科目の取得中にエラーが発生しました:', error);
      throw error;
    }
  }
}
