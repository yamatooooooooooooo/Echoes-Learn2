import { Firestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { Subject } from '../../domain/models/SubjectModel';
import { ISubjectRepository } from '../../domain/interfaces/repositories/ISubjectRepository';

// モックデータ
const MOCK_SUBJECTS: Subject[] = [
  {
    id: 'subject-1',
    name: '情報処理概論',
    currentPage: 120,
    totalPages: 350,
    examDate: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000), // 10日後
    textbookName: '情報処理入門 第3版',
    priority: 'high',
    importance: 'high',
    updatedAt: new Date(),
    createdAt: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000) // 30日前
  },
  {
    id: 'subject-2',
    name: 'データベース設計',
    currentPage: 80,
    totalPages: 220,
    examDate: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000), // 15日後
    textbookName: 'データベース設計 実践ガイド',
    reportDeadline: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7日後
    priority: 'medium',
    importance: 'high',
    updatedAt: new Date(),
    createdAt: new Date(new Date().getTime() - 45 * 24 * 60 * 60 * 1000) // 45日前
  },
  {
    id: 'subject-3',
    name: 'アルゴリズムとデータ構造',
    currentPage: 60,
    totalPages: 280,
    examDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000), // 5日後
    textbookName: 'アルゴリズム図鑑',
    priority: 'high',
    importance: 'medium',
    updatedAt: new Date(),
    createdAt: new Date(new Date().getTime() - 20 * 24 * 60 * 60 * 1000) // 20日前
  }
];

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
    
    // 開発環境とモックデータが有効な場合はモックデータを返す
    if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
      return [...MOCK_SUBJECTS];
    }
    
    try {
      // Firestoreからデータを取得
      const subjectsRef = collection(this.firestore, 'users', userId, 'subjects');
      const subjectsSnapshot = await getDocs(subjectsRef);
      
      const subjects: Subject[] = [];
      subjectsSnapshot.forEach(doc => {
        const data = doc.data();
        // 日付をDateオブジェクトに変換
        const subject: Subject = {
          id: doc.id,
          ...data,
          examDate: data.examDate ? new Date(data.examDate.toDate()) : undefined,
          reportDeadline: data.reportDeadline ? new Date(data.reportDeadline.toDate()) : undefined,
          updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()) : new Date(),
          createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date()
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
    
    // 開発環境とモックデータが有効な場合はモックの処理を行う
    if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
      const newId = `subject-${Date.now()}`;
      return newId;
    }
    
    try {
      // タイムスタンプを追加
      const subjectWithTimestamp = {
        ...subjectData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Firestoreにデータを追加
      const subjectsRef = collection(this.firestore, 'users', userId, 'subjects');
      const docRef = await addDoc(subjectsRef, subjectWithTimestamp);
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
    console.log('科目を取得中...', id);
    
    // 開発環境とモックデータが有効な場合はモックデータを返す
    if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
      const subject = MOCK_SUBJECTS.find(s => s.id === id);
      return subject || null;
    }
    
    try {
      const userId = this.auth.currentUser?.uid;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Firestoreからデータを取得
      const subjectRef = doc(this.firestore, 'users', userId, 'subjects', id);
      const subjectSnap = await getDoc(subjectRef);
      
      if (!subjectSnap.exists()) {
        return null;
      }
      
      const data = subjectSnap.data();
      // 日付をDateオブジェクトに変換
      const subject: Subject = {
        id: subjectSnap.id,
        ...data,
        examDate: data.examDate ? new Date(data.examDate.toDate()) : undefined,
        reportDeadline: data.reportDeadline ? new Date(data.reportDeadline.toDate()) : undefined,
        updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()) : new Date(),
        createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date()
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
    console.log('科目を更新中...', id, subjectData);
    
    // 開発環境とモックデータが有効な場合は何もしない
    if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
      return;
    }
    
    try {
      const userId = this.auth.currentUser?.uid;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // updatedAtを更新
      const updateData = {
        ...subjectData,
        updatedAt: new Date()
      };
      
      // Firestoreのデータを更新
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
    console.log('科目を削除中...', id);
    
    // 開発環境とモックデータが有効な場合は何もしない
    if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
      return;
    }
    
    try {
      const userId = this.auth.currentUser?.uid;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Firestoreのドキュメントを削除
      const subjectRef = doc(this.firestore, 'users', userId, 'subjects', id);
      await deleteDoc(subjectRef);
    } catch (error) {
      console.error('科目データの削除中にエラーが発生しました:', error);
      throw error;
    }
  }
}

// モック用のインスタンス
export const subjectRepository = new SubjectRepository({} as Firestore, {} as Auth); 