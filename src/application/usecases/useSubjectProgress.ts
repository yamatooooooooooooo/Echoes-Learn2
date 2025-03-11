import { useState, useEffect } from 'react';
import { Subject } from '../../domain/models/SubjectModel';
import { IProgressRepository } from '../../domain/interfaces/repositories/IProgressRepository';
import { ISubjectRepository } from '../../domain/interfaces/repositories/ISubjectRepository';
import { Progress, ProgressCreateInput } from '../../domain/models/ProgressModel';
import { useFirebase } from '../../contexts/FirebaseContext';

// ProgressFormDataの型定義
interface ProgressFormData {
  recordDate: string;
  startPage: number;
  endPage: number;
  pagesRead: number;
}

/**
 * 科目の進捗に関するロジックを提供するカスタムフック
 * プレゼンテーション層とデータ層の分離を実現
 */
export const useSubjectProgress = (
  subject: Subject,
  onProgressAdded?: () => void,
  onSubjectUpdated?: (updatedSubject: Subject) => void,
  progressRepo?: IProgressRepository,
  subjectRepo?: ISubjectRepository
) => {
  const { auth } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isAddingProgress, setIsAddingProgress] = useState(false);
  const [progressRecords, setProgressRecords] = useState<Progress[]>([]);
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [currentEditingProgress, setCurrentEditingProgress] = useState<Progress | null>(null);

  // 科目の進捗記録を取得
  useEffect(() => {
    if (subject && subject.id) {
      loadProgressRecords();
    }
  }, [subject]);

  // 進捗記録を読み込む
  const loadProgressRecords = async () => {
    if (!subject || !subject.id || !progressRepo) return;
    
    setLoading(true);
    try {
      const records = await progressRepo.getSubjectProgress(
        auth?.currentUser?.uid || '',
        subject.id
      );
      setProgressRecords(records);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('進捗記録の取得に失敗しました'));
    } finally {
      setLoading(false);
    }
  };

  // 進捗を追加
  const addProgress = async (formData: ProgressFormData) => {
    if (!subject || !subject.id || !progressRepo || !subjectRepo || !auth?.currentUser?.uid) return;
    
    setIsAddingProgress(true);
    try {
      // 現在のページ数を計算
      const newCurrentPage = Math.min(
        subject.currentPage + formData.pagesRead,
        subject.totalPages
      );
      
      // 進捗データを作成
      const progressData: ProgressCreateInput = {
        subjectId: subject.id,
        startPage: subject.currentPage,
        endPage: newCurrentPage,
        pagesRead: formData.pagesRead,
        recordDate: formData.recordDate
      };
      
      // 進捗を保存
      await progressRepo.addProgress(auth.currentUser.uid, progressData);
      
      // 科目の現在のページ数を更新
      await subjectRepo.updateSubject(subject.id, { currentPage: newCurrentPage });
      
      // 科目データを更新
      const updatedSubject = { ...subject, currentPage: newCurrentPage };
      
      // 進捗記録を再読み込み
      await loadProgressRecords();
      
      // コールバックを実行
      if (onProgressAdded) onProgressAdded();
      if (onSubjectUpdated) onSubjectUpdated(updatedSubject);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('進捗の追加に失敗しました'));
    } finally {
      setIsAddingProgress(false);
    }
  };

  // 進捗編集モードを開始
  const startEditingProgress = (progress: Progress) => {
    setCurrentEditingProgress(progress);
    setIsEditingProgress(true);
  };

  // 進捗編集モードをキャンセル
  const cancelEditingProgress = () => {
    setCurrentEditingProgress(null);
    setIsEditingProgress(false);
  };

  // 進捗を更新
  const updateProgress = async (progressId: string, formData: ProgressFormData) => {
    if (!subject || !subject.id || !progressId || !progressRepo || !subjectRepo) return;
    
    setLoading(true);
    try {
      // 現在の進捗を取得
      const currentProgress = progressRecords.find(p => p.id === progressId);
      if (!currentProgress) throw new Error('進捗データが見つかりません');
      
      // 読了ページ数の差分を計算
      const pagesDiff = formData.pagesRead - currentProgress.pagesRead;
      
      // 科目の現在のページ数を再計算
      const newCurrentPage = Math.min(
        subject.currentPage + pagesDiff,
        subject.totalPages
      );
      
      // 科目の現在のページ数を更新
      await subjectRepo.updateSubject(subject.id, { currentPage: newCurrentPage });
      
      // 科目データを更新
      const updatedSubject = { ...subject, currentPage: newCurrentPage };
      
      // 進捗記録を再読み込み
      await loadProgressRecords();
      
      // 編集モードを終了
      cancelEditingProgress();
      
      // コールバックを実行
      if (onSubjectUpdated) onSubjectUpdated(updatedSubject);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('進捗の更新に失敗しました'));
    } finally {
      setLoading(false);
    }
  };

  // 進捗を削除
  const deleteProgress = async (progressId: string) => {
    if (!subject || !subject.id || !progressId || !progressRepo || !subjectRepo) return;
    
    setLoading(true);
    try {
      // 現在の進捗を取得
      const currentProgress = progressRecords.find(p => p.id === progressId);
      if (!currentProgress) throw new Error('進捗データが見つかりません');
      
      // 読了ページ数を計算
      const pagesRead = currentProgress.pagesRead;
      
      // 科目の現在のページ数を再計算
      const newCurrentPage = Math.max(subject.currentPage - pagesRead, 0);
      
      // 進捗を削除
      await progressRepo.deleteProgress(progressId);
      
      // 科目の現在のページ数を更新
      await subjectRepo.updateSubject(subject.id, { currentPage: newCurrentPage });
      
      // 科目データを更新
      const updatedSubject = { ...subject, currentPage: newCurrentPage };
      
      // 進捗記録を再読み込み
      await loadProgressRecords();
      
      // コールバックを実行
      if (onSubjectUpdated) onSubjectUpdated(updatedSubject);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('進捗の削除に失敗しました'));
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    isAddingProgress,
    progressRecords,
    isEditingProgress,
    currentEditingProgress,
    addProgress,
    startEditingProgress,
    cancelEditingProgress,
    updateProgress,
    deleteProgress
  };
}; 