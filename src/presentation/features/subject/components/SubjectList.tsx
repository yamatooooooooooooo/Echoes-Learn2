import React, { useState, useEffect, useCallback } from 'react';
import { Box, Alert, Collapse, SelectChangeEvent, ToggleButtonGroup, ToggleButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Typography, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Switch, Tooltip, CircularProgress, Grid, Snackbar } from '@mui/material';
import { 
  ViewModule as ViewModuleIcon, 
  ViewList as ViewListIcon, 
  CalendarViewMonth as CalendarViewMonthIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon
} from '@mui/icons-material';
import { Subject, SubjectCreateInput, SubjectUpdateInput } from '../../../../domain/models/SubjectModel';
import { SubjectForm } from './SubjectForm';
import { useServices } from '../../../../hooks/useServices';
import { SubjectListHeader } from './SubjectListHeader';
import { SortOption } from './SubjectListToolbar';
import { SubjectListContent } from './SubjectListContent';
import { SubjectListView } from './SubjectListView';
import { ProgressForm } from './ProgressForm';
import { useFirebase } from '../../../../contexts/FirebaseContext';
import { ProgressRepository } from '../../../../infrastructure/repositories/progressRepository';
import { ProgressFormData } from '../../../../domain/models/ProgressModel';
import { useMaintenanceMessage } from '../../../../hooks/useMaintenanceMessage';
import { SubjectCard } from './SubjectCard';
// import { SubjectCalendarView } from './SubjectCalendarView';

// ビュータイプの型定義
export type ViewType = 'card' | 'list' | 'calendar';

interface SubjectListProps {
  formatDate: (date: Date | string | undefined) => string;
}

// タッチイベント設定用の型
interface TouchPreventOptions {
  passive: boolean;
}

export const SubjectList: React.FC<SubjectListProps> = ({ formatDate }) => {
  // 状態管理
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sortedSubjects, setSortedSubjects] = useState<Subject[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('priority-high');
  const [autoPriority, setAutoPriority] = useState(true);
  const [priorityUpdating, setPriorityUpdating] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [viewType, setViewType] = useState<ViewType>('card');
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  
  // スナックバー用の状態
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // 進捗記録モーダル用の状態
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [selectedSubjectForProgress, setSelectedSubjectForProgress] = useState<Subject | null>(null);
  const [progressSubmitError, setProgressSubmitError] = useState<string | null>(null);
  
  // サービスの取得
  const { subjectRepository } = useServices();
  
  // Firebaseサービスを取得
  const { firestore, auth } = useFirebase();
  
  // メンテナンスメッセージフックを使用
  const { wrapWithMaintenanceMessage, MaintenanceMessageComponent } = useMaintenanceMessage({
    message: '科目の管理機能は現在メンテナンス中です。近日中に実装予定です。'
  });
  
  /**
   * 科目の優先順位を計算する関数
   */
  const calculateSubjectPriority = useCallback((subject: Subject): number => {
    // 優先順位計算ロジック（仮実装）
    const daysRemaining = 30; // 仮の値
    const totalPages = subject.totalPages || 1;
    const completedPages = subject.currentPage || 0;
    const progressPercentage = (completedPages / totalPages) * 100;
    
    if (daysRemaining <= 7 && progressPercentage < 50) {
      return 3; // 高優先度
    } else if (daysRemaining <= 14 || progressPercentage < 30) {
      return 2; // 中優先度
    } else {
      return 1; // 低優先度
    }
  }, []);
  
  // 科目の優先順位を一括更新
  const updatePriorities = useCallback(async (subjectList: Subject[]) => {
    setPriorityUpdating(true);
    
    try {
      // 各科目の優先順位を個別に更新
      const userId = auth.currentUser?.uid || 'current-user';
      const updatePromises = subjectList.map((subject: Subject) => {
        // 優先順位を計算
        const newPriority = calculateSubjectPriority(subject);
        const currentPriority = subject.priority === 'high' ? 3 : subject.priority === 'medium' ? 2 : 1;
        
        if (newPriority !== currentPriority) {
          // 優先順位が変わった場合のみ更新
          const priorityString = newPriority === 3 ? 'high' : newPriority === 2 ? 'medium' : 'low';
          return subjectRepository.updateSubject(subject.id, { priority: priorityString });
        }
        return Promise.resolve(subject);
      });
      
      await Promise.all(updatePromises);
      
      // 更新後に再取得
      const updatedSubjects = await subjectRepository.getAllSubjects(userId);
      setSubjects(updatedSubjects);
      
      // 成功メッセージ
      setSnackbarMessage('優先順位を更新しました');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('優先順位の更新に失敗しました:', err);
      setSnackbarMessage('優先順位の更新に失敗しました');
      setSnackbarOpen(true);
    } finally {
      setPriorityUpdating(false);
    }
  }, [auth, subjectRepository, calculateSubjectPriority]);

  // 科目一覧の取得
  const loadSubjects = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      const userId = auth.currentUser?.uid || 'current-user';
      const subjectsList = await subjectRepository.getAllSubjects(userId);
      setSubjects(subjectsList);
      
      // 自動優先順位が有効なら、取得後に優先順位を更新
      if (autoPriority && subjectsList.length > 0) {
        updatePriorities(subjectsList);
      }
      
      // ローカルストレージから編集対象の科目IDがあるか確認
      const editSubjectId = localStorage.getItem('editSubjectId');
      if (editSubjectId) {
        // IDに一致する科目を見つける
        const subjectToEdit = subjectsList.find((subject: Subject) => subject.id === editSubjectId);
        if (subjectToEdit) {
          // 編集モードを開始
          setEditingSubject(subjectToEdit);
          setIsFormOpen(true);
        }
        // 使用後にクリア
        localStorage.removeItem('editSubjectId');
      }
    } catch (err) {
      console.error('科目の取得に失敗しました:', err);
      setLoadError('科目の取得に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  }, [auth, subjectRepository, autoPriority, updatePriorities]);
  
  // 科目の更新処理
  const handleUpdateSubject = async (updatedSubject: Subject) => {
    try {
      // 優先順位を自動計算する場合は、更新時に再計算
      if (autoPriority) {
        const newPriority = calculateSubjectPriority(updatedSubject);
        const currentPriority = updatedSubject.priority === 'high' ? 3 : updatedSubject.priority === 'medium' ? 2 : 1;
        
        if (newPriority !== currentPriority) {
          const userId = auth.currentUser?.uid || 'current-user';
          const priorityString = newPriority === 3 ? 'high' : newPriority === 2 ? 'medium' : 'low';
          await subjectRepository.updateSubject(updatedSubject.id, { priority: priorityString });
          
          setSubjects(prev => 
            prev.map(s => s.id === updatedSubject.id ? {...updatedSubject, priority: priorityString} : s)
          );
          return;
        }
      }
      
      // 優先順位の変更がない場合は、そのまま状態を更新
      setSubjects(prev => 
        prev.map(s => s.id === updatedSubject.id ? updatedSubject : s)
      );
    } catch (error) {
      console.error('科目の更新に失敗しました:', error);
      setLoadError('科目の更新に失敗しました');
    }
  };

  // 科目追加ボタンクリック時の処理
  const handleAddSubject = () => {
    setEditingSubject(null);
    setIsFormOpen(true);
  };
  
  // 科目編集ボタンクリック時の処理
  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setIsFormOpen(true);
  };
  
  // 科目削除確認ダイアログを表示する処理
  const handleDeleteConfirm = (subject: Subject) => {
    setSubjectToDelete(subject);
    setIsDeleteConfirming(true);
  };
  
  // 削除のキャンセル
  const handleCancelDelete = () => {
    setSubjectToDelete(null);
    setIsDeleteConfirming(false);
  };

  // 削除の確認
  const handleConfirmDelete = async () => {
    if (!subjectToDelete) return;
    
    setIsDeleteConfirming(true);
    
    try {
      await subjectRepository.deleteSubject(subjectToDelete.id);
      setSubjects(prev => prev.filter(subject => subject.id !== subjectToDelete.id));
      setSubjectToDelete(null);
    } catch (error) {
      console.error('科目の削除に失敗しました:', error);
      setLoadError('科目の削除に失敗しました');
    } finally {
      setIsDeleteConfirming(false);
    }
  };

  // 手動で優先順位を更新する
  const handleManualPriorityUpdate = async () => {
    await updatePriorities(subjects);
  };

  // 自動優先順位設定のトグル
  const handleAutoPriorityToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAutoPriority(event.target.checked);
    
    // オンにした場合、即座に優先順位を更新
    if (event.target.checked && subjects.length > 0) {
      updatePriorities(subjects);
    }
  };

  // 並び替え方法の変更
  const handleSortChange = (event: SelectChangeEvent<SortOption>) => {
    setSortBy(event.target.value as SortOption);
  };

  // 新しい科目の登録または更新
  const handleFormSubmit = async (formData: SubjectCreateInput | SubjectUpdateInput) => {
    try {
      const userId = auth.currentUser?.uid || 'current-user';
      
      // フォームデータから科目データを作成
      let finalSubjectData = {
        ...formData,
        userId
      };
      
      // 優先順位の自動計算が有効な場合
      if (autoPriority) {
        // 優先順位計算に必要な一時的なSubjectオブジェクトを作成
        const tempSubject = {
          ...finalSubjectData,
          id: editingSubject?.id || 'temp-id',
          createdAt: editingSubject?.createdAt || new Date(),
          updatedAt: new Date(),
          priority: 'low'
        } as Subject;
        
        const priorityValue = calculateSubjectPriority(tempSubject);
        finalSubjectData.priority = priorityValue === 3 ? 'high' : priorityValue === 2 ? 'medium' : 'low';
      }
      
      if (editingSubject) {
        // 既存の科目を更新
        await subjectRepository.updateSubject(editingSubject.id, finalSubjectData);
      } else {
        // 新しい科目を登録
        await subjectRepository.addSubject(userId, finalSubjectData);
      }
      
      // 科目一覧を再取得
      await loadSubjects();
      
      // フォームを閉じる
      setIsFormOpen(false);
      setEditingSubject(null);
    } catch (error) {
      console.error('科目の保存に失敗しました:', error);
      setSubmitError('科目の保存に失敗しました');
    }
  };

  // ビュータイプの変更ハンドラ
  const handleViewTypeChange = (_event: React.MouseEvent<HTMLElement>, newViewType: ViewType | null) => {
    if (newViewType !== null) {
      setViewType(newViewType);
    }
  };

  // 並び替え処理
  useEffect(() => {
    if (subjects.length === 0) {
      setSortedSubjects([]);
      return;
    }
    
    const sortedList = [...subjects].sort((a, b) => {
      const priorityMap = { high: 3, medium: 2, low: 1 };
      
      switch (sortBy) {
        case 'priority-high':
          return (priorityMap[b.priority || 'low'] || 0) - (priorityMap[a.priority || 'low'] || 0);
          
        case 'priority-low':
          return (priorityMap[a.priority || 'low'] || 0) - (priorityMap[b.priority || 'low'] || 0);
          
        case 'exam-date':
          if (!a.examDate && !b.examDate) return 0;
          if (!a.examDate) return 1;
          if (!b.examDate) return -1;
          return new Date(a.examDate).getTime() - new Date(b.examDate).getTime();
          
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
          
        case 'progress':
          const progressA = a.totalPages > 0 ? (a.currentPage || 0) / a.totalPages : 0;
          const progressB = b.totalPages > 0 ? (b.currentPage || 0) / b.totalPages : 0;
          return progressA - progressB;
          
        default:
          return 0;
      }
    });
    
    setSortedSubjects(sortedList);
  }, [subjects, sortBy]);

  // Android用のタッチイベント対策
  useEffect(() => {
    // ダブルタップによるズームを防止
    const preventDoubleTapZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    // イベントリスナーを追加
    document.addEventListener('touchstart', preventDoubleTapZoom, { passive: false });
    
    return () => {
      // コンポーネントのアンマウント時にリスナーを削除
      document.removeEventListener('touchstart', preventDoubleTapZoom);
    };
  }, []);

  // 初回レンダリング時に科目一覧を取得
  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  // 進捗記録モーダルを開く処理
  const handleOpenProgressModal = (subject: Subject) => {
    setSelectedSubjectForProgress(subject);
    setIsProgressModalOpen(true);
  };
  
  // 進捗記録モーダルを閉じる
  const handleCloseProgressModal = () => {
    setIsProgressModalOpen(false);
    setSelectedSubjectForProgress(null);
    setProgressSubmitError(null);
  };

  // 進捗記録成功時の処理
  const handleProgressSuccess = (progressId: string) => {
    // 科目一覧を再取得して表示を更新
    loadSubjects();
    // 成功メッセージを表示
    setSnackbarMessage('進捗を記録しました');
    setSnackbarOpen(true);
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {/* ヘッダー部分: SubjectListHeaderコンポーネントを使用 */}
      <SubjectListHeader 
        onAddClick={handleAddSubject}
        onUpdatePriority={handleManualPriorityUpdate}
        onRecordProgress={subjects.length > 0 ? () => handleOpenProgressModal(subjects[0]) : undefined}
        isSubmitting={isSubmitting}
        isPriorityUpdating={priorityUpdating}
        autoPriorityEnabled={autoPriority}
      />
      
      {/* エラーメッセージの表示 */}
      <Collapse in={!!loadError}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      </Collapse>
      
      {/* 科目の追加と編集用のモーダル */}
      <Dialog 
        open={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingSubject ? '科目を編集' : '新しい科目を追加'}
        </DialogTitle>
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}
          
          <SubjectForm 
            subject={editingSubject}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isLoading={isSubmitting}
            error={submitError}
          />
        </DialogContent>
      </Dialog>
      
      {/* 科目の削除確認用のダイアログ */}
      <Dialog
        open={isDeleteConfirming}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          本当に削除しますか？
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            「{subjectToDelete?.name}」を削除します。この操作は取り消せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            キャンセル
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            削除する
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* カードビューまたはリストビューの表示 */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : viewType === 'card' ? (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {sortedSubjects.map(subject => (
            <Grid item xs={12} sm={6} md={4} key={subject.id}>
              <SubjectCard 
                subject={subject} 
                formatDate={formatDate}
                onEdit={() => handleEditSubject(subject)}
                onDelete={() => handleDeleteConfirm(subject)}
                onProgressAdded={() => handleOpenProgressModal(subject)}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <SubjectListView
          subjects={sortedSubjects}
          formatDate={formatDate}
          onSubjectUpdated={handleUpdateSubject}
          onSubjectEdit={handleEditSubject}
          onSubjectDelete={(subjectId) => handleDeleteConfirm({ id: subjectId } as Subject)}
          loading={isLoading || priorityUpdating}
        />
      )}
      
      {/* スナックバー通知 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
      
      {/* 進捗記録フォーム */}
      {selectedSubjectForProgress && (
        <ProgressForm
          subject={selectedSubjectForProgress}
          open={isProgressModalOpen}
          onClose={handleCloseProgressModal}
          onSuccess={handleProgressSuccess}
        />
      )}
      
      {/* メンテナンスメッセージコンポーネント */}
      <MaintenanceMessageComponent />
    </Box>
  );
}; 