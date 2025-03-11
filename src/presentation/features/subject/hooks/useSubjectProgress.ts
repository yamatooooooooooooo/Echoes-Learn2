import { useState, useEffect } from 'react';
import { useServices } from '../../../../hooks/useServices';
import { Subject } from '../../../../domain/models/SubjectModel';
import { Progress, ProgressCreateInput, ProgressUpdateInput } from '../../../../domain/models/ProgressModel';
import { useFirebase } from '../../../../contexts/FirebaseContext';
import { ProgressService } from '../../../../domain/services/ProgressService';

// 進捗フォームのデータ型
interface ProgressFormData {
  startPage: number | string;
  endPage: number | string;
  pagesRead: number | string;
  recordDate: string;
}

// 初期フォーム値
const initialProgressForm: ProgressFormData = {
  startPage: 0,
  endPage: 0,
  pagesRead: 0,
  recordDate: new Date().toISOString().split('T')[0]
};

export const useSubjectProgress = (
  subject: Subject,
  onProgressAdded?: () => void,
  onSubjectUpdated?: (subject: Subject) => void,
  onProgressUpdated?: () => void,
  onProgressDeleted?: () => void
) => {
  const [progressForm, setProgressForm] = useState<ProgressFormData>(initialProgressForm);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProgressId, setCurrentProgressId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [progressToDelete, setProgressToDelete] = useState<string | null>(null);
  const { progressRepository, subjectRepository } = useServices();
  const { auth } = useFirebase();
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [error, setError] = useState('');
  
  // 進捗記録データを保持するための状態を追加
  const [progressRecords, setProgressRecords] = useState<Progress[]>([]);
  const [loadingProgressRecords, setLoadingProgressRecords] = useState(false);
  const [progressRecordsError, setProgressRecordsError] = useState<Error | null>(null);

  // 科目IDに基づいて進捗記録を取得
  useEffect(() => {
    const fetchProgressRecords = async () => {
      if (!subject.id || !auth.currentUser) return;
      
      setLoadingProgressRecords(true);
      setProgressRecordsError(null);
      
      try {
        const records = await progressRepository.getSubjectProgress(
          auth.currentUser.uid,
          subject.id
        );
        setProgressRecords(records);
      } catch (error) {
        console.error('進捗記録の取得に失敗しました:', error);
        setProgressRecordsError(error instanceof Error ? error : new Error('進捗記録の取得に失敗しました'));
      } finally {
        setLoadingProgressRecords(false);
      }
    };
    
    fetchProgressRecords();
  }, [subject.id, auth.currentUser, progressRepository]);

  const toggleProgressForm = () => {
    setIsAdding(!isAdding);
    setIsEditing(false);
    setCurrentProgressId(null);
    if (!isAdding) {
      setProgressForm({
        ...progressForm,
        startPage: subject.currentPage || 0
      });
    }
  };

  // 編集モードを開始
  const startEditing = (progress: Progress) => {
    setIsEditing(true);
    setIsAdding(true);
    setCurrentProgressId(progress.id || null);
    setProgressForm({
      startPage: progress.startPage,
      endPage: progress.endPage,
      pagesRead: progress.pagesRead,
      recordDate: typeof progress.recordDate === 'string' 
        ? progress.recordDate 
        : progress.recordDate.toISOString().split('T')[0]
    });
  };

  // 削除ダイアログを開く
  const openDeleteDialog = (progressId: string) => {
    setProgressToDelete(progressId);
    setIsDeleteDialogOpen(true);
  };

  // 削除ダイアログを閉じる
  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setProgressToDelete(null);
  };

  // 進捗記録を削除
  const deleteProgress = async () => {
    if (!progressToDelete) return;
    
    try {
      const progressService = new ProgressService(progressRepository, subjectRepository);
      await progressService.deleteProgress(progressToDelete);
      
      closeDeleteDialog();
      setMessage('進捗記録を削除しました');
      setShowMessage(true);
      
      // 削除完了後のコールバック実行
      if (onProgressDeleted) {
        onProgressDeleted();
      }
      
      // メッセージを3秒後に消す
      setTimeout(() => {
        setShowMessage(false);
      }, 3000);
    } catch (error) {
      console.error('進捗の削除に失敗しました:', error);
      setError('進捗の削除に失敗しました');
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newProgressForm = {
      ...progressForm,
      [name]: value
    };
    
    if (name === 'startPage' || name === 'endPage') {
      const startPage = name === 'startPage' ? parseInt(value) || 0 : parseInt(progressForm.startPage.toString()) || 0;
      const endPage = name === 'endPage' ? parseInt(value) || 0 : parseInt(progressForm.endPage.toString()) || 0;
      
      if (startPage >= 0 && endPage >= startPage) {
        newProgressForm.pagesRead = endPage - startPage + 1;
      } else {
        newProgressForm.pagesRead = 0;
      }
    }
    
    setProgressForm(newProgressForm);
  };

  const handleQuickProgress = async (pages: number) => {
    try {
      // 進捗データを作成
      const progressData: ProgressCreateInput = {
        subjectId: subject.id,
        recordDate: new Date().toISOString().split('T')[0],
        startPage: subject.currentPage || 0,
        endPage: (subject.currentPage || 0) + pages,
        pagesRead: pages
      };
      
      await progressRepository.addProgress(auth.currentUser?.uid || '', progressData);
      
      // 科目のcurrentPageも更新
      if (onSubjectUpdated) {
        const updatedSubject = {
          ...subject,
          currentPage: (subject.currentPage || 0) + pages
        };
        onSubjectUpdated(updatedSubject);
      }
      
      setMessage(`${pages}ページの進捗を記録しました`);
      setShowMessage(true);
      
      // メッセージを3秒後に消す
      setTimeout(() => {
        setShowMessage(false);
      }, 3000);
    } catch (error) {
      console.error('進捗の追加に失敗しました:', error);
      setError('進捗の追加に失敗しました');
    }
  };

  const handleSaveProgress = async () => {
    if (!progressForm.startPage || !progressForm.endPage) {
      setError('開始ページと終了ページを入力してください');
      return;
    }
    
    try {
      // 進捗データを作成
      const progressData: ProgressCreateInput | ProgressUpdateInput = {
        subjectId: subject.id,
        recordDate: progressForm.recordDate,
        startPage: Number(progressForm.startPage),
        endPage: Number(progressForm.endPage),
        pagesRead: Number(progressForm.pagesRead)
      };
      
      const progressService = new ProgressService(progressRepository, subjectRepository);
      
      if (isEditing && currentProgressId) {
        // 進捗を更新
        await progressService.updateProgress(currentProgressId, progressData);
        
        // 科目のcurrentPageを更新（必要な場合）
        if (Number(progressForm.endPage) > (subject.currentPage || 0)) {
          const updatedSubject = {
            ...subject,
            currentPage: Number(progressForm.endPage)
          };
          if (onSubjectUpdated) {
            onSubjectUpdated(updatedSubject);
          }
        }
        
        setMessage('進捗を更新しました');
        
        // 更新完了後のコールバック実行
        if (onProgressUpdated) {
          onProgressUpdated();
        }
      } else {
        // 新規進捗を追加
        await progressRepository.addProgress(auth.currentUser?.uid || '', progressData as ProgressCreateInput);
        
        // 科目のcurrentPageも更新
        if (Number(progressForm.endPage) > (subject.currentPage || 0)) {
          const updatedSubject = {
            ...subject,
            currentPage: Number(progressForm.endPage)
          };
          if (onSubjectUpdated) {
            onSubjectUpdated(updatedSubject);
          }
        }
        
        setMessage('進捗を記録しました');
        
        // 追加完了後のコールバック実行
        if (onProgressAdded) {
          onProgressAdded();
        }
      }
      
      setProgressForm(initialProgressForm);
      setIsAdding(false);
      setIsEditing(false);
      setCurrentProgressId(null);
      setShowMessage(true);
      
      // メッセージを3秒後に消す
      setTimeout(() => {
        setShowMessage(false);
      }, 3000);
    } catch (error) {
      console.error('進捗の保存に失敗しました:', error);
      setError('進捗の保存に失敗しました');
    }
  };

  return {
    progressForm,
    isAdding,
    isEditing,
    toggleProgressForm,
    startEditing,
    openDeleteDialog,
    closeDeleteDialog,
    deleteProgress,
    isDeleteDialogOpen,
    progressToDelete,
    handleProgressChange,
    handleQuickProgress,
    handleSaveProgress,
    message,
    showMessage,
    error,
    // 進捗記録データ関連のプロパティを追加
    progressRecords,
    loadingProgressRecords,
    progressRecordsError
  };
}; 