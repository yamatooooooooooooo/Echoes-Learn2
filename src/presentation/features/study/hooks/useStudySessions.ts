import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit as firebaseLimit, 
  startAfter, 
  getDocs, 
  doc, 
  getDoc, 
  onSnapshot,
  QueryConstraint
} from 'firebase/firestore';
import { useFirebase } from '../../../../contexts/FirebaseContext';

interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  date: string;
  startTime: string;
  duration: number;
  pagesCompleted: number;
  effectivenessRating: number;
  notes: string;
  timeOfDay: string;
  [key: string]: any;
}

interface PaginatedResult<T> {
  data: T[];
  lastVisible: any;
  hasMore: boolean;
}

/**
 * 学習セッションのページネーション取得
 * @param userId ユーザーID
 * @param limit 1ページあたりの件数
 * @param startAfterDoc 最後に取得したドキュメント
 */
export async function fetchStudySessions(
  userId: string,
  limit: number = 10,
  startAfterDoc?: any
): Promise<PaginatedResult<StudySession>> {
  try {
    if (!userId) {
      return { data: [], lastVisible: null, hasMore: false };
    }

    const db = useFirebase().firestore;
    const sessionsRef = collection(db, `users/${userId}/studySessions`);
    
    // クエリ構築
    let baseQuery = query(sessionsRef, orderBy('date', 'desc'));
    
    // 一度に取得する件数を制限
    baseQuery = query(baseQuery, firebaseLimit(limit + 1));
    
    // 続きから取得する場合は開始位置を指定
    if (startAfterDoc) {
      baseQuery = query(baseQuery, startAfter(startAfterDoc));
    }
    
    const snapshot = await getDocs(baseQuery);
    const docs = snapshot.docs;
    
    // 次ページの有無を確認
    const hasMore = docs.length > limit;
    
    // 返却データの整形
    const data = docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as StudySession[];
    
    // 最後のドキュメントを返却
    const lastVisible = docs.length > 0 ? docs[docs.length - 1] : null;
    
    return { data, lastVisible, hasMore };
  } catch (error) {
    console.error('学習セッションの取得中にエラーが発生しました:', error);
    throw error;
  }
}

/**
 * フィルター条件付きの学習セッション取得
 */
export async function fetchFilteredSessions(
  userId: string,
  filters: {
    subjectId?: string;
    startDate?: string;
    endDate?: string;
  },
  limit: number = 10,
  startAfterDoc?: any
): Promise<PaginatedResult<StudySession>> {
  try {
    if (!userId) {
      return { data: [], lastVisible: null, hasMore: false };
    }

    const db = useFirebase().firestore;
    const sessionsRef = collection(db, `users/${userId}/studySessions`);
    
    // クエリの条件を構築
    let queryConditions: QueryConstraint[] = [
      orderBy('date', 'desc')
    ];
    
    // フィルター条件があれば追加
    if (filters.subjectId) {
      queryConditions.push(where('subjectId', '==', filters.subjectId));
    }
    
    if (filters.startDate && filters.endDate) {
      queryConditions.push(where('date', '>=', filters.startDate));
      queryConditions.push(where('date', '<=', filters.endDate));
    }
    
    // 基本クエリを構築
    let baseQuery = query(sessionsRef, ...queryConditions);
    
    // 一度に取得する件数を制限
    baseQuery = query(baseQuery, firebaseLimit(limit + 1));
    
    // 続きから取得する場合は開始位置を指定
    if (startAfterDoc) {
      baseQuery = query(baseQuery, startAfter(startAfterDoc));
    }
    
    const snapshot = await getDocs(baseQuery);
    const docs = snapshot.docs;
    
    // 次ページの有無を確認
    const hasMore = docs.length > limit;
    
    // 返却データの整形
    const data = docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as StudySession[];
    
    // 最後のドキュメントを返却
    const lastVisible = docs.length > 0 ? docs[docs.length - 1] : null;
    
    return { data, lastVisible, hasMore };
  } catch (error) {
    console.error('フィルター付き学習セッションの取得中にエラーが発生しました:', error);
    throw error;
  }
}

/**
 * 最近の学習セッションをリアルタイムで取得するカスタムフック
 */
export function useRecentSessionsRealtime(userId: string | null | undefined, sessionCount: number = 5) {
  const { firestore: db } = useFirebase();
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setRecentSessions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const sessionsRef = collection(db, `users/${userId}/studySessions`);
    const q = query(
      sessionsRef, 
      orderBy('date', 'desc'), 
      orderBy('startTime', 'desc'),
      firebaseLimit(sessionCount)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const sessionsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as StudySession[];

        setRecentSessions(sessionsList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('最近の学習セッションの取得中にエラーが発生しました:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, userId, sessionCount]);

  return { recentSessions, loading, error };
}

/**
 * 進行中の学習セッションを取得するカスタムフック
 */
export function useActiveSessionRealtime(userId: string | null | undefined, subjectId: string | null | undefined) {
  const { firestore: db } = useFirebase();
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId || !subjectId) {
      setActiveSession(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // 今日の日付を取得
    const today = new Date().toISOString().split('T')[0];
    
    const sessionsRef = collection(db, `users/${userId}/studySessions`);
    const q = query(
      sessionsRef,
      where('subjectId', '==', subjectId),
      where('date', '==', today),
      where('completed', '==', false),
      orderBy('startTime', 'desc'),
      firebaseLimit(1)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          setActiveSession({
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data()
          } as StudySession);
        } else {
          setActiveSession(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('進行中セッションの取得中にエラーが発生しました:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, userId, subjectId]);

  return { activeSession, loading, error };
}

/**
 * 同じ科目を学習中のユーザーを取得するカスタムフック
 */
export function useStudyBuddiesRealtime(subjectId: string | null | undefined) {
  const { firestore: db } = useFirebase();
  const [studyBuddies, setStudyBuddies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subjectId) {
      setStudyBuddies([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // 今日の日付を取得
    const today = new Date().toISOString().split('T')[0];
    
    // アクティブなセッションを持つユーザーを検索するクエリ
    // NOTE: これは実際にはセキュリティルールの関係で難しい場合があります
    // ここではモックデータを使用
    
    // モックデータ
    const mockBuddies = [
      { id: 'user1', name: '山田太郎', streak: 5, lastActive: today, currentPage: 45 },
      { id: 'user2', name: '佐藤花子', streak: 12, lastActive: today, currentPage: 67 },
      { id: 'user3', name: '鈴木一郎', streak: 3, lastActive: today, currentPage: 32 }
    ];
    
    // 実際の実装では、サーバー側の関数やセキュリティを考慮した設計が必要
    setStudyBuddies(mockBuddies);
    setLoading(false);

    // リアルデータを使用する場合は以下のようなコードになります
    /*
    const activeSessionsRef = collectionGroup(db, 'studySessions');
    const q = query(
      activeSessionsRef,
      where('subjectId', '==', subjectId),
      where('date', '==', today),
      where('completed', '==', false)
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const buddyPromises = snapshot.docs.map(async (doc) => {
          const userId = doc.ref.path.split('/')[1];
          const userDoc = await getDoc(doc(db, `users/${userId}`));
          return {
            id: userId,
            name: userDoc.data()?.displayName || '匿名',
            streak: userDoc.data()?.streak || 0,
            lastActive: today,
            currentPage: doc.data().currentPage
          };
        });
        
        const buddies = await Promise.all(buddyPromises);
        setStudyBuddies(buddies);
        setLoading(false);
      },
      (err) => {
        console.error('学習仲間の取得中にエラーが発生しました:', err);
        setStudyBuddies([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
    */
    
    // このモック実装ではクリーンアップは不要
    return () => {};
  }, [db, subjectId]);

  return { studyBuddies, loading };
}

export default {
  fetchStudySessions,
  fetchFilteredSessions,
  useRecentSessionsRealtime,
  useActiveSessionRealtime,
  useStudyBuddiesRealtime
}; 