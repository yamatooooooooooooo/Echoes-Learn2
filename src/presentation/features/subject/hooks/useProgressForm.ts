import { useState, useCallback } from 'react';
import { ProgressCreateInput, Progress } from '../../../../domain/models/ProgressModel';
import { Subject } from '../../../../domain/models/SubjectModel';
import { useServices } from '../../../../hooks/useServices';
import { useAuth } from '../../../../contexts/AuthContext';
import { format } from 'date-fns';

interface UseProgressFormParams {
  subject?: Subject;
  progress?: Progress;
  isEditMode?: boolean;
  onSuccess?: (progressId: string) => void;
}

/**
 * 進捗記録フォームのカスタムフック
 */
export const useProgressForm = ({ subject, progress, isEditMode = false, onSuccess }: UseProgressFormParams) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // サービスを取得
  const { progressRepository, subjectRepository } = useServices();
  const { currentUser } = useAuth();
  
  // 今日の日付を取得（YYYY-MM-DD形式）
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // 初期値を設定
  const initialValues: ProgressCreateInput = {
    subjectId: subject?.id || progress?.subjectId || '',
    startPage: subject?.currentPage || progress?.startPage || 0,
    endPage: progress?.endPage || subject?.currentPage || 0,
    pagesRead: progress?.pagesRead || 0,
    recordDate: progress?.recordDate ? 
      (typeof progress.recordDate === 'string' ? progress.recordDate : format(progress.recordDate, 'yyyy-MM-dd')) : 
      today,
    studyDuration: progress?.studyDuration || 0,
    memo: progress?.memo || ''
  };
  
  const [formData, setFormData] = useState<ProgressCreateInput>(initialValues);
  
  // 進捗データからフォームデータを設定
  const setFormDataFromProgress = useCallback((progress: Progress) => {
    setFormData({
      subjectId: progress.subjectId,
      startPage: progress.startPage,
      endPage: progress.endPage,
      pagesRead: progress.pagesRead,
      recordDate: typeof progress.recordDate === 'string' 
        ? progress.recordDate 
        : format(progress.recordDate, 'yyyy-MM-dd'),
      studyDuration: progress.studyDuration || 0,
      memo: progress.memo || ''
    });
  }, []);
  
  // フォーム入力の処理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: any = value;
    
    // 入力タイプに応じた値の変換
    if (type === 'number') {
      parsedValue = value === '' ? '' : Number(value);
    }
    
    // startPageとendPageの場合はpagesReadを計算
    if (name === 'startPage' || name === 'endPage') {
      const startPage = name === 'startPage' ? parsedValue : formData.startPage;
      const endPage = name === 'endPage' ? parsedValue : formData.endPage;
      
      // 妥当な値の場合のみ計算
      if (typeof startPage === 'number' && typeof endPage === 'number' && endPage >= startPage) {
        setFormData(prev => ({
          ...prev,
          [name]: parsedValue,
          pagesRead: endPage - startPage + 1
        }));
        return;
      }
    }
    
    // 通常の入力
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
    
    // フィールドエラーをクリア
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // 日付選択の処理
  const handleDateChange = (date: Date | null) => {
    const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
    handleChange({
      target: { name: 'recordDate', value: formattedDate, type: 'text' }
    } as React.ChangeEvent<HTMLInputElement>);
  };
  
  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject) {
      setError('科目が選択されていません');
      return;
    }
    
    if (!currentUser) {
      setError('認証エラーが発生しました。再度ログインしてください。');
      return;
    }
    
    // バリデーション
    const validationErrors = validateProgress(formData, subject);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      let progressId: string;
      
      // 数値型に変換したデータを準備
      const numericFormData = {
        ...formData,
        startPage: Number(formData.startPage),
        endPage: Number(formData.endPage),
        pagesRead: Number(formData.pagesRead),
        studyDuration: Number(formData.studyDuration || 0)
      };
      
      if (isEditMode && progress && progress.id) {
        // 進捗情報を更新
        await progressRepository.updateProgress(progress.id, numericFormData);
        progressId = progress.id;
      } else {
        // 進捗情報を追加
        progressId = await progressRepository.addProgress(currentUser.uid, {
          ...numericFormData,
          subjectId: subject.id // subjectは既に存在チェック済み
        });
        
        // 科目の現在のページを更新
        await subjectRepository.updateSubject(subject.id, {
          currentPage: numericFormData.endPage
        });
      }
      
      // 成功時のコールバック
      if (onSuccess) {
        onSuccess(progressId);
      }
      
      // フォームをリセット
      resetForm();
    } catch (error) {
      console.error('進捗情報の保存に失敗しました:', error);
      setError('進捗情報の保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // フォームリセット
  const resetForm = () => {
    setFormData(initialValues);
    setError(null);
    setFieldErrors({});
  };
  
  // バリデーション関数
  const validateProgress = (data: ProgressCreateInput, subject: Subject): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!data.subjectId) {
      errors.subjectId = '科目IDは必須です';
    }
    
    const startPage = Number(data.startPage);
    const endPage = Number(data.endPage);
    const totalPages = Number(subject.totalPages || 0);
    
    if (data.startPage === undefined || data.startPage === null || data.startPage === '') {
      errors.startPage = '開始ページは必須です';
    } else if (startPage < 0) {
      errors.startPage = '開始ページは0以上である必要があります';
    }
    
    if (data.endPage === undefined || data.endPage === null || data.endPage === '') {
      errors.endPage = '終了ページは必須です';
    } else if (endPage < startPage) {
      errors.endPage = '終了ページは開始ページ以上である必要があります';
    } else if (totalPages > 0 && endPage > totalPages) {
      errors.endPage = `終了ページは教科書の総ページ数(${totalPages})以下である必要があります`;
    }
    
    if (!data.recordDate) {
      errors.recordDate = '記録日は必須です';
    }
    
    const studyDuration = Number(data.studyDuration || 0);
    
    if (data.studyDuration === undefined || data.studyDuration === null || data.studyDuration === '') {
      errors.studyDuration = '学習時間は必須です';
    } else if (studyDuration < 0) {
      errors.studyDuration = '学習時間は0以上である必要があります';
    } else if (studyDuration > 1440) {
      errors.studyDuration = '学習時間は24時間（1440分）以内である必要があります';
    }
    
    return errors;
  };
  
  return {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    handleChange,
    handleDateChange,
    handleSubmit,
    resetForm,
    setFormDataFromProgress
  };
}; 