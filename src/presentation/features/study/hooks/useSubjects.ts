import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useFirebase } from '../../../../contexts/FirebaseContext';
import { useServices } from '../../../../contexts/ServicesContext';

interface Subject {
  id: string;
  name: string;
  description?: string;
  currentPage: number;
  totalPages: number;
  examDate?: Date;
  textbookName?: string;
  reportDeadline?: Date;
  priority?: 'high' | 'medium' | 'low';
  category?: string;
  createdAt: any;
  updatedAt: any;
}

/**
 * 科目リストをリアルタイムで取得するカスタムフック
 */
export function useSubjects() {
  const { auth, firestore: db } = useFirebase();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setSubjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const subjectsRef = collection(db, `users/${userId}/subjects`);
    const q = query(subjectsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const subjectsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Subject[];

        setSubjects(subjectsList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('科目の取得中にエラーが発生しました:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    // クリーンアップ関数でリスナーを解除
    return () => unsubscribe();
  }, [auth, db]);

  return { subjects, loading, error };
}

/**
 * 特定の科目をリアルタイムで取得するカスタムフック
 */
export function useSubjectRealtime(userId: string | null | undefined, subjectId: string | null | undefined) {
  const { firestore: db } = useFirebase();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId || !subjectId) {
      setSubject(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const subjectRef = doc(db, `users/${userId}/subjects/${subjectId}`);
    
    const unsubscribe = onSnapshot(
      subjectRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setSubject({
            id: docSnapshot.id,
            ...docSnapshot.data()
          } as Subject);
        } else {
          setSubject(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('科目の取得中にエラーが発生しました:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, userId, subjectId]);

  return { subject, loading, error };
}

export default useSubjects; 