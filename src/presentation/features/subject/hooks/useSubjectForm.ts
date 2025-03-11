import { useState } from 'react';
import { SubjectCreateInput, Subject } from '../../../../domain/models/SubjectModel';
import { SubjectRepository } from '../../../../infrastructure/repositories/subjectRepository';
import { useFirebase } from '../../../../contexts/FirebaseContext';

export const useSubjectForm = (onSuccess?: (subject: Subject) => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Firebaseサービスを取得
  const { firestore, auth } = useFirebase();
  const subjectRepository = new SubjectRepository(firestore, auth);

  const createSubject = async (data: SubjectCreateInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 認証状態の確認
      const currentUser = auth.currentUser;
      const userId = currentUser?.uid;
      
      if (!userId) {
        setError('認証されていません。ログインしてください。');
        setIsLoading(false);
        return null;
      }
      
      // ユーザーIDを設定
      const subjectData = {
        ...data,
        userId
      };
      
      // 科目を登録
      const subjectId = await subjectRepository.addSubject(userId, subjectData);
      
      // 登録した科目を取得
      const newSubject = await subjectRepository.getSubject(subjectId);
      
      // 成功コールバックを実行
      if (onSuccess && newSubject) {
        onSuccess(newSubject);
      }
      
      return newSubject;
    } catch (err) {
      console.error('科目の作成に失敗しました:', err);
      setError('科目の作成に失敗しました。もう一度お試しください。');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createSubject,
    isLoading,
    error
  };
}; 