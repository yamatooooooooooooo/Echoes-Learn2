import { useState } from 'react';
import { useServices } from '../../../../hooks/useServices';
import { Subject } from '../../../../domain/models/SubjectModel';
import { Progress, ProgressCreateInput } from '../../../../domain/models/ProgressModel';
import { useFirebase } from '../../../../contexts/FirebaseContext';

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
  onSubjectUpdated?: (subject: Subject) => void
) => {
  const [progressForm, setProgressForm] = useState<ProgressFormData>(initialProgressForm);
  const [isAdding, setIsAdding] = useState(false);
  const { progressRepository } = useServices();
  const { auth } = useFirebase();
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [error, setError] = useState('');

  const toggleProgressForm = () => {
    setIsAdding(!isAdding);
    if (!isAdding) {
      setProgressForm({
        ...progressForm,
        startPage: subject.currentPage || 0
      });
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
      const progressData: ProgressCreateInput = {
        subjectId: subject.id,
        recordDate: progressForm.recordDate,
        startPage: Number(progressForm.startPage),
        endPage: Number(progressForm.endPage),
        pagesRead: Number(progressForm.pagesRead)
      };
      
      await progressRepository.addProgress(auth.currentUser?.uid || '', progressData);
      
      // 科目のcurrentPageも更新
      if (onSubjectUpdated && Number(progressForm.endPage) > (subject.currentPage || 0)) {
        const updatedSubject = {
          ...subject,
          currentPage: Number(progressForm.endPage)
        };
        onSubjectUpdated(updatedSubject);
      }
      
      setProgressForm(initialProgressForm);
      setIsAdding(false);
      setMessage('進捗を記録しました');
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

  return {
    progressForm,
    isAdding,
    toggleProgressForm,
    handleProgressChange,
    handleQuickProgress,
    handleSaveProgress,
    message,
    showMessage,
    error
  };
}; 