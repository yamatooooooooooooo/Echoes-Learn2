import { useState, useEffect } from 'react';
import { useServices } from '../../../../hooks/useServices';
import { useFirebase } from '../../../../contexts/FirebaseContext';
import { Subject } from '../../../../domain/models/SubjectModel';

/**
 * 科目一覧を取得するためのカスタムフック
 */
export const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { subjectRepository } = useServices();
  const { auth } = useFirebase();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const userId = auth.currentUser?.uid || 'current-user';
        const subjectList = await subjectRepository.getAllSubjects(userId);
        setSubjects(subjectList);
      } catch (err) {
        console.error('科目の取得に失敗しました:', err);
        setError('科目の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [subjectRepository, auth]);

  return { subjects, loading, error };
};
