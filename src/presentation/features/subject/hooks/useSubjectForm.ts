import { useState } from 'react';
import { SubjectCreateInput, Subject } from '../../../../domain/models/SubjectModel';
import { useServices } from '../../../../hooks/useServices';
import { useAuth } from '../../../../contexts/AuthContext';

interface UseSubjectFormProps {
  subject?: Subject | null;
  onSuccess?: (subjectId: string) => void;
}

export const useSubjectForm = ({ subject, onSuccess }: UseSubjectFormProps = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { subjectRepository } = useServices();
  const { currentUser } = useAuth();
  
  const handleSubmit = async (data: SubjectCreateInput) => {
    if (!currentUser) {
      setError('認証エラーが発生しました。再度ログインしてください。');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (subject) {
        // 既存の科目を更新
        await subjectRepository.updateSubject(subject.id, data);
        if (onSuccess) onSuccess(subject.id);
      } else {
        // 新規科目を追加
        const subjectId = await subjectRepository.addSubject(currentUser.uid, data);
        if (onSuccess) onSuccess(subjectId);
      }
    } catch (err) {
      console.error('科目の保存に失敗しました:', err);
      setError('科目の保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const deleteSubject = async (subjectId: string) => {
    if (!currentUser) {
      setError('認証エラーが発生しました。再度ログインしてください。');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await subjectRepository.deleteSubject(subjectId);
    } catch (err) {
      console.error('科目の削除に失敗しました:', err);
      setError('科目の削除に失敗しました。もう一度お試しください。');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    handleSubmit,
    deleteSubject,
    isSubmitting,
    error
  };
}; 