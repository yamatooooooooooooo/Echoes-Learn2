import { useState, useCallback } from 'react';
import { ProgressCreateInput, Progress } from '../../../../domain/models/ProgressModel';
import { Subject } from '../../../../domain/models/SubjectModel';
import { useServices } from '../../../../hooks/useServices';
import { useFirebase } from '../../../../contexts/FirebaseContext';
import { ProgressError } from '../../../../domain/errors/ProgressError';
import { ProgressService } from '../../../../domain/services/ProgressService';
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
  const { auth } = useFirebase();
  
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
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});
    
    try {
      // バリデーション
      const subjectToValidate = subject || (isEditMode && progress ? { totalPages: Infinity } as Subject : undefined);
      
      if (!subjectToValidate) {
        throw new Error('科目情報が必要です');
      }
      
      const validationErrors = validateProgress(formData, subjectToValidate);
      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }
      
      // 認証状態の確認
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError('認証されていません。ログインしてください。');
        setIsSubmitting(false);
        return;
      }
      
      // ProgressServiceのインスタンス作成
      const progressService = new ProgressService(progressRepository, subjectRepository);
      
      let progressId = '';
      
      if (isEditMode && progress?.id) {
        // 既存の進捗を更新
        await progressService.updateProgress(progress.id, {
          startPage: formData.startPage,
          endPage: formData.endPage,
          pagesRead: formData.pagesRead,
          recordDate: formData.recordDate,
          studyDuration: formData.studyDuration,
          memo: formData.memo
        });
        progressId = progress.id;
      } else {
        // 新規進捗記録を作成
        progressId = await progressService.recordProgress(currentUser.uid, formData);
      }
      
      // 成功コールバック
      if (onSuccess) {
        onSuccess(progressId);
      }
      
      // フォームをリセット
      resetForm();
    } catch (error) {
      console.error('進捗の記録に失敗しました:', error);
      
      // ProgressErrorの場合は構造化されたエラー処理
      if (error instanceof ProgressError && error.field) {
        setFieldErrors({
          [error.field]: error.message
        });
      } else {
        setError(error instanceof Error ? error.message : '予期しないエラーが発生しました');
      }
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
    
    if (data.startPage < 0) {
      errors.startPage = '開始ページは0以上である必要があります';
    }
    
    if (data.endPage < data.startPage) {
      errors.endPage = '終了ページは開始ページ以上である必要があります';
    }
    
    if (data.endPage > subject.totalPages && subject.totalPages !== Infinity) {
      errors.endPage = `終了ページは科目の総ページ数（${subject.totalPages}）以下である必要があります`;
    }
    
    if (!data.recordDate) {
      errors.recordDate = '記録日を選択してください';
    }
    
    // 日付が有効かチェック
    try {
      const date = new Date(data.recordDate);
      if (isNaN(date.getTime())) {
        throw new ProgressError('有効な日付を入力してください', 'INVALID_DATE_FORMAT', 'recordDate');
      }
    } catch (error) {
      throw new ProgressError('有効な日付を入力してください', 'INVALID_DATE_FORMAT', 'recordDate');
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