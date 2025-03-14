import { useState, useCallback, useMemo, useRef } from 'react';
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
 * 進捗記録フォームのカスタムフック - パフォーマンス最適化版
 */
export const useProgressForm = ({
  subject,
  progress,
  isEditMode = false,
  onSuccess,
}: UseProgressFormParams) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // 参照を保持することでサービスへの再アクセスを防止
  const servicesRef = useRef(useServices());
  const { progressRepository, subjectRepository } = servicesRef.current;
  const { currentUser } = useAuth();

  // 今日の日付を計算 - アプリケーションのライフサイクル中に変更されることはほぼないのでメモ化
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  // 初期値を設定 - メモ化で不要な再計算を防止
  const initialValues = useMemo<ProgressCreateInput>(
    () => ({
      subjectId: subject?.id || progress?.subjectId || '',
      startPage: subject?.currentPage || progress?.startPage || 0,
      endPage: progress?.endPage || subject?.currentPage || 0,
      pagesRead: progress?.pagesRead || 0,
      recordDate: progress?.recordDate
        ? typeof progress.recordDate === 'string'
          ? progress.recordDate
          : format(progress.recordDate, 'yyyy-MM-dd')
        : today,
      studyDuration: progress?.studyDuration || 0,
      memo: progress?.memo || '',
      reportProgress: progress?.reportProgress || '',
      satisfactionLevel: progress?.satisfactionLevel || 2, // デフォルトは「普通」（2）
    }),
    [subject, progress, today]
  );

  const [formData, setFormData] = useState<ProgressCreateInput>(initialValues);

  // 進捗データからフォームデータを設定 - メモ化で参照の一貫性を保持
  const setFormDataFromProgress = useCallback((progress: Progress) => {
    setFormData({
      subjectId: progress.subjectId,
      startPage: progress.startPage,
      endPage: progress.endPage,
      pagesRead: progress.pagesRead,
      recordDate:
        typeof progress.recordDate === 'string'
          ? progress.recordDate
          : format(progress.recordDate, 'yyyy-MM-dd'),
      studyDuration: progress.studyDuration || 0,
      memo: progress.memo || '',
      reportProgress: progress.reportProgress || '',
      satisfactionLevel: progress.satisfactionLevel || 2,
    });
  }, []);

  // フォーム入力の処理 - useCallbackでメモ化
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;

      let parsedValue: any = value;

      // 入力タイプに応じた値の変換
      if (type === 'number') {
        parsedValue = value === '' ? 0 : Number(value);
      }

      // startPageとendPageの場合はpagesReadを計算
      if (name === 'startPage' || name === 'endPage') {
        setFormData((prev) => {
          const startPage = name === 'startPage' ? parsedValue : prev.startPage;
          const endPage = name === 'endPage' ? parsedValue : prev.endPage;

          // 妥当な値の場合のみ計算
          if (
            typeof startPage === 'number' &&
            typeof endPage === 'number' &&
            endPage >= startPage
          ) {
            return {
              ...prev,
              [name]: parsedValue,
              pagesRead: endPage - startPage + 1,
            };
          }

          return {
            ...prev,
            [name]: parsedValue,
          };
        });

        // フィールドエラーをクリア
        if (fieldErrors[name]) {
          setFieldErrors((prev) => ({
            ...prev,
            [name]: '',
          }));
        }

        return;
      }

      // 通常の入力
      setFormData((prev) => ({
        ...prev,
        [name]: parsedValue,
      }));

      // フィールドエラーをクリア
      if (fieldErrors[name]) {
        setFieldErrors((prev) => ({
          ...prev,
          [name]: '',
        }));
      }
    },
    [fieldErrors]
  );

  // 日付選択の処理 - useCallbackでメモ化
  const handleDateChange = useCallback(
    (date: Date | null) => {
      const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';

      setFormData((prev) => ({
        ...prev,
        recordDate: formattedDate,
      }));

      // フィールドエラーをクリア
      if (fieldErrors.recordDate) {
        setFieldErrors((prev) => ({
          ...prev,
          recordDate: '',
        }));
      }
    },
    [fieldErrors]
  );

  // バリデーション関数 - パフォーマンス最適化
  const validateProgress = useCallback(
    (data: ProgressCreateInput, subject: Subject): Record<string, string> => {
      const errors: Record<string, string> = {};

      if (!data.subjectId) {
        errors.subjectId = '科目IDは必須です';
      }

      const startPage = Number(data.startPage);
      const endPage = Number(data.endPage);
      const totalPages = Number(subject.totalPages || 0);

      if (!data.startPage && data.startPage !== 0) {
        errors.startPage = '開始ページは必須です';
      } else if (isNaN(startPage) || startPage < 0) {
        errors.startPage = '開始ページは0以上の数値である必要があります';
      }

      if (!data.endPage && data.endPage !== 0) {
        errors.endPage = '終了ページは必須です';
      } else if (isNaN(endPage) || endPage < startPage) {
        errors.endPage = '終了ページは開始ページ以上の数値である必要があります';
      } else if (totalPages > 0 && endPage > totalPages) {
        errors.endPage = `終了ページは教科書の総ページ数(${totalPages})以下である必要があります`;
      }

      if (!data.recordDate) {
        errors.recordDate = '記録日は必須です';
      }

      // 学習時間のバリデーション - 数値変換は一度だけ行う
      if (data.studyDuration !== undefined) {
        const studyDuration = Number(data.studyDuration);
        if (isNaN(studyDuration) || studyDuration < 0) {
          errors.studyDuration = '学習時間は0以上の数値である必要があります';
        } else if (studyDuration > 1440) {
          errors.studyDuration = '学習時間は24時間（1440分）以内である必要があります';
        }
      }

      // 満足度のバリデーション - 数値変換は一度だけ行う
      if (data.satisfactionLevel !== undefined) {
        const level = Number(data.satisfactionLevel);
        if (isNaN(level) || level < 1 || level > 3 || !Number.isInteger(level)) {
          errors.satisfactionLevel = '満足度は1から3の整数値である必要があります';
        }
      }

      return errors;
    },
    []
  );

  // フォームリセット - useCallbackでメモ化
  const resetForm = useCallback(() => {
    setFormData(initialValues);
    setError(null);
    setFieldErrors({});
  }, [initialValues]);

  // フォーム送信 - useCallbackでメモ化
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
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

        // 数値型に変換したデータを準備 - オブジェクトをシャローコピーして変更
        const numericFormData = {
          ...formData,
          startPage: Number(formData.startPage),
          endPage: Number(formData.endPage),
          pagesRead: Number(formData.pagesRead),
          studyDuration: Number(formData.studyDuration || 0),
        };

        if (isEditMode && progress && progress.id) {
          // 進捗情報を更新
          await progressRepository.updateProgress(progress.id, numericFormData);
          progressId = progress.id;
        } else {
          // 進捗情報を追加
          progressId = await progressRepository.addProgress(currentUser.uid, {
            ...numericFormData,
            subjectId: subject.id,
          });

          // 科目の現在のページを更新
          await subjectRepository.updateSubject(subject.id, {
            currentPage: numericFormData.endPage,
          });
        }

        // 成功時のコールバック
        if (onSuccess) {
          onSuccess(progressId);
        }

        // フォームをリセット
        setFormData(initialValues);
        setError(null);
        setFieldErrors({});
      } catch (error) {
        console.error('進捗情報の保存に失敗しました:', error);
        setError('進捗情報の保存に失敗しました。もう一度お試しください。');
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      currentUser,
      formData,
      isEditMode,
      onSuccess,
      progress,
      progressRepository,
      subject,
      subjectRepository,
      validateProgress,
      initialValues,
    ]
  );

  return {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    handleChange,
    handleDateChange,
    handleSubmit,
    resetForm,
    setFormDataFromProgress,
  };
};
