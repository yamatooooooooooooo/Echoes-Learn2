import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Alert, Collapse, SelectChangeEvent, ToggleButtonGroup, ToggleButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Typography, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Switch, Tooltip, CircularProgress, Grid, Snackbar, Paper, IconButton, List, ListItem, ListItemButton, ListItemText, Chip, LinearProgress, useMediaQuery, useTheme } from '@mui/material';
import { 
  ViewModule as ViewModuleIcon, 
  ViewList as ViewListIcon, 
  CalendarViewMonth as CalendarViewMonthIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Add,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  MenuBook as MenuBookIcon
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
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    // ローカルストレージから並び替え条件を取得
    const savedSortBy = localStorage.getItem('subjectSortBy');
    // 保存されている場合はその値を、なければ試験日が近い順をデフォルトに
    return (savedSortBy as SortOption) || 'exam-date-asc';
  });
  const [autoPriority, setAutoPriority] = useState(true);
  const [priorityUpdating, setPriorityUpdating] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [viewType, setViewType] = useState<ViewType>('card');
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // スナックバー用の状態
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
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
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  /**
   * 科目の優先順位を計算する関数 - メモ化
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
  
  // 科目の優先順位を一括更新 - メモ化
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

  // 科目一覧の取得 - メモ化
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
  
  // 科目の更新処理 - メモ化
  const handleUpdateSubject = useCallback(async (updatedSubject: Subject) => {
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
  }, [auth, autoPriority, calculateSubjectPriority, subjectRepository]);

  // 科目追加ボタンクリック時の処理 - メモ化
  const handleAddSubject = useCallback(() => {
    setEditingSubject(null);
    setIsFormOpen(true);
  }, []);
  
  // 科目編集ボタンクリック時の処理 - メモ化
  const handleEditSubject = useCallback((subject: Subject) => {
    setEditingSubject(subject);
    setIsFormOpen(true);
  }, []);
  
  // 科目削除確認ダイアログを表示する処理 - メモ化
  const handleDeleteConfirm = useCallback((subject: Subject) => {
    setSubjectToDelete(subject);
    setIsDeleteConfirming(true);
  }, []);
  
  // 削除のキャンセル - メモ化
  const handleCancelDelete = useCallback(() => {
    setSubjectToDelete(null);
    setIsDeleteConfirming(false);
  }, []);

  // 削除の確認 - メモ化
  const handleConfirmDelete = useCallback(async () => {
    if (!subjectToDelete) return;
    
    setIsDeleting(true);
    
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('認証されていません');
      }
      
      await subjectRepository.deleteSubject(subjectToDelete.id);
      
      // 成功したら状態を更新
      setSubjects(prev => prev.filter(subject => subject.id !== subjectToDelete.id));
      
      // スナックバーで成功通知
      setSnackbarMessage(`科目「${subjectToDelete.name}」を削除しました`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // 状態をリセット
      setSubjectToDelete(null);
    } catch (error) {
      console.error('科目の削除に失敗しました:', error);
      setSnackbarMessage('科目の削除に失敗しました');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsDeleteConfirming(false);
      setIsDeleting(false);
    }
  }, [auth, subjectRepository, subjectToDelete]);

  // 手動で優先順位を更新する - メモ化
  const handleManualPriorityUpdate = useCallback(async () => {
    await updatePriorities(subjects);
  }, [subjects, updatePriorities]);

  // 自動優先順位設定のトグル - メモ化
  const handleAutoPriorityToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setAutoPriority(event.target.checked);
    
    // オンにした場合、即座に優先順位を更新
    if (event.target.checked && subjects.length > 0) {
      updatePriorities(subjects);
    }
  }, [subjects, updatePriorities]);

  // 並び替え方法の変更 - メモ化
  const handleSortChange = useCallback((event: SelectChangeEvent<SortOption>) => {
    const newSortBy = event.target.value as SortOption;
    setSortBy(newSortBy);
    // ローカルストレージに保存
    localStorage.setItem('subjectSortBy', newSortBy);
  }, []);

  // 新しい科目の登録または更新 - メモ化
  const handleFormSubmit = useCallback(async (formData: SubjectCreateInput | SubjectUpdateInput) => {
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
  }, [auth, autoPriority, calculateSubjectPriority, editingSubject, loadSubjects, subjectRepository]);

  // ビュータイプの変更ハンドラ - メモ化
  const handleViewTypeChange = useCallback((_event: React.MouseEvent<HTMLElement>, newViewType: ViewType | null) => {
    if (newViewType !== null) {
      setViewType(newViewType);
    }
  }, []);

  // 並び替え処理をuseMemoでメモ化して不要な再計算を防止
  const sortedSubjectsList = useMemo(() => {
    if (subjects.length === 0) {
      return [];
    }
    
    return [...subjects].sort((a, b) => {
      const priorityMap = { high: 3, medium: 2, low: 1 };
      
      switch (sortBy) {
        case 'priority-high':
          return (priorityMap[b.priority || 'low'] || 0) - (priorityMap[a.priority || 'low'] || 0);
          
        case 'priority-low':
          return (priorityMap[a.priority || 'low'] || 0) - (priorityMap[b.priority || 'low'] || 0);
          
        case 'exam-date':
        case 'exam-date-asc':
          if (!a.examDate && !b.examDate) return 0;
          if (!a.examDate) return 1;
          if (!b.examDate) return -1;
          return new Date(a.examDate).getTime() - new Date(b.examDate).getTime();
          
        case 'exam-date-desc':
          if (!a.examDate && !b.examDate) return 0;
          if (!a.examDate) return -1;
          if (!b.examDate) return 1;
          return new Date(b.examDate).getTime() - new Date(a.examDate).getTime();
          
        case 'name':
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
          
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
          
        case 'progress':
        case 'progress-asc':
          const progressA = a.totalPages > 0 ? (a.currentPage || 0) / a.totalPages : 0;
          const progressB = b.totalPages > 0 ? (b.currentPage || 0) / b.totalPages : 0;
          return progressA - progressB;
          
        case 'progress-desc':
          const progressADesc = a.totalPages > 0 ? (a.currentPage || 0) / a.totalPages : 0;
          const progressBDesc = b.totalPages > 0 ? (b.currentPage || 0) / b.totalPages : 0;
          return progressBDesc - progressADesc;
          
        default:
          return 0;
      }
    });
  }, [subjects, sortBy]);

  // 以前のeffectを削除し、sortedSubjectsを直接useMemoの結果で更新
  useEffect(() => {
    setSortedSubjects(sortedSubjectsList);
  }, [sortedSubjectsList]);

  // Android用のタッチイベント対策 - メモ化した関数を使用
  const preventDoubleTapZoom = useCallback((e: TouchEvent) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    // イベントリスナーを追加
    document.addEventListener('touchstart', preventDoubleTapZoom, { passive: false });
    
    return () => {
      // コンポーネントのアンマウント時にリスナーを削除
      document.removeEventListener('touchstart', preventDoubleTapZoom);
    };
  }, [preventDoubleTapZoom]);

  // 初回レンダリング時に科目一覧を取得
  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  // 進捗記録モーダルを開く処理を改善 - メモ化
  const handleOpenProgressModal = useCallback((subject: Subject) => {
    setSelectedSubjectForProgress(subject);
    setIsProgressModalOpen(true);
    // スクロールを最上部に
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  // 進捗記録モーダルを閉じる - メモ化
  const handleCloseProgressModal = useCallback(() => {
    setIsProgressModalOpen(false);
    setSelectedSubjectForProgress(null);
    setProgressSubmitError(null);
  }, []);

  // 進捗記録成功時の処理 - メモ化
  const handleProgressSuccess = useCallback((progressId: string) => {
    // 科目一覧を再取得して表示を更新
    loadSubjects();
    // 成功メッセージを表示
    setSnackbarMessage('進捗を記録しました');
    setSnackbarOpen(true);
  }, [loadSubjects]);

  // 初期レンダリング時のスクロール処理 - コールバックの依存関係を修正
  useEffect(() => {
    const scrollTimeout = setTimeout(() => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      
      // モバイル環境では追加のスクロール処理
      if (isMobile) {
        const subjectListContainer = document.getElementById('subject-list-container');
        if (subjectListContainer) {
          subjectListContainer.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
      }
    }, 100);
    
    return () => clearTimeout(scrollTimeout);
  }, [isMobile]);

  // レンダリング
  return (
    <Box 
      id="subject-list-container"
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: isMobile ? 'auto' : '100%',
        width: '100%',
        maxWidth: { xs: '100%', sm: '92%', md: '1400px' },
        mx: 'auto',
        flexGrow: 1,
        // モバイル環境ではoverflow: hiddenを使用しない
        overflow: isMobile ? 'visible' : 'hidden',
        p: { xs: 1, sm: 2 },
        pt: { xs: 2, sm: 3 },
        // モバイル環境での追加設定
        ...(isMobile && {
          minHeight: '100%',
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'none'
        })
      }}
    >
      {/* メンテナンスメッセージ（開発中に表示） */}
      <MaintenanceMessageComponent />
      
      {/* 科目リストヘッダー */}
      <Box sx={{ 
        flexShrink: 0,
        width: '100%',
        mb: 2,
        // モバイル環境でのヘッダー表示を改善
        ...(isMobile && {
          position: 'relative',
          zIndex: 2,
          top: 0,
          left: 0
        })
      }}>
        <SubjectListHeader
          onAddSubject={handleAddSubject}
          totalSubjects={subjects.length}
        />
      </Box>
      
      {/* 科目リストツールバー */}
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 1.5, sm: 2 }, 
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' }, 
              justifyContent: 'space-between',
              gap: 1.5
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                flexWrap: 'wrap',
                gap: { xs: 1, sm: 2 },
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              {/* 自動優先度設定 */}
              <FormControlLabel
                control={
                  <Switch
                    checked={autoPriority}
                    onChange={handleAutoPriorityToggle}
                    size="small"
                    disabled={priorityUpdating}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ mr: 0.5 }}>自動優先度更新</Typography>
                    {priorityUpdating && <CircularProgress size={16} sx={{ ml: 1 }} />}
                  </Box>
                }
              />
              
              {/* 手動更新ボタン */}
              <Tooltip title="優先度を手動で更新">
                <span>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleManualPriorityUpdate}
                    disabled={priorityUpdating || subjects.length === 0}
                    sx={{ height: 32 }}
                  >
                    優先度更新
                  </Button>
                </span>
              </Tooltip>
            </Box>
            
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: { xs: 1, sm: 2 },
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              {/* 表示切替 */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ToggleButtonGroup
                  value={viewType}
                  exclusive
                  onChange={handleViewTypeChange}
                  aria-label="表示形式"
                  size="small"
                >
                  <ToggleButton value="card" aria-label="カード表示">
                    <Tooltip title="カード表示">
                      <ViewModuleIcon fontSize="small" />
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value="list" aria-label="リスト表示">
                    <Tooltip title="リスト表示">
                      <ViewListIcon fontSize="small" />
                    </Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              
              {/* ソート */}
              <FormControl variant="outlined" size="small" sx={{ minWidth: { xs: '100%', sm: 180 } }}>
                <InputLabel id="sort-select-label">並び替え</InputLabel>
                <Select
                  labelId="sort-select-label"
                  value={sortBy}
                  onChange={handleSortChange}
                  label="並び替え"
                >
                  <MenuItem value="priority-high">優先度（高→低）</MenuItem>
                  <MenuItem value="priority-low">優先度（低→高）</MenuItem>
                  <MenuItem value="exam-date-asc">試験日（近い順）</MenuItem>
                  <MenuItem value="exam-date-desc">試験日（遠い順）</MenuItem>
                  <MenuItem value="name-asc">科目名（A→Z）</MenuItem>
                  <MenuItem value="name-desc">科目名（Z→A）</MenuItem>
                  <MenuItem value="progress-asc">進捗（低→高）</MenuItem>
                  <MenuItem value="progress-desc">進捗（高→低）</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Paper>
      </Box>
      
      {/* エラーメッセージ */}
      <Collapse in={!!loadError}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      </Collapse>
      
      {/* 科目リストコンテンツ - スクロール可能な領域 */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          // モバイル環境ではautoからvisibleに変更して全体表示を改善
          overflow: isMobile ? 'visible' : 'auto',
          pb: 2,
          // モバイル環境での追加設定
          ...(isMobile && {
            WebkitOverflowScrolling: 'touch',
            height: 'auto',
            width: '100%'
          })
        }}
      >
        {isLoading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            py: 8,
            height: '100%'
          }}>
            <CircularProgress size={48} thickness={4} />
            <Typography variant="body1" sx={{ mt: 3, color: 'text.secondary' }}>
              科目データを読み込み中...
            </Typography>
          </Box>
        ) : (
          <>
            {viewType === 'card' ? (
              <>
                {/* スマホ向け操作ボタンを追加 - 画面下部に固定表示する浮動ボタン */}
                <Box 
                  sx={{ 
                    position: 'sticky',
                    bottom: 16,
                    right: 16,
                    zIndex: 10,
                    display: { xs: 'block', sm: 'none' }, // モバイルのみ表示
                    textAlign: 'right',
                    pointerEvents: 'none'
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={handleAddSubject}
                    sx={{ 
                      borderRadius: 28,
                      px: 3,
                      py: 1.5,
                      boxShadow: 4,
                      pointerEvents: 'auto',
                      mb: 2
                    }}
                  >
                    新しい科目
                  </Button>
                </Box>
              
                <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ width: '100%', mx: 0 }}>
                  {sortedSubjects.map(subject => (
                    <Grid item xs={12} sm={6} md={6} lg={4} key={subject.id}>
                      <Box sx={{ 
                        position: 'relative',
                        height: '100%',
                        maxWidth: { sm: '100%', md: '550px', lg: '450px' },
                        mx: 'auto',
                        // タッチデバイス向け最適化
                        WebkitTapHighlightColor: 'transparent',
                        transition: 'transform 0.2s ease-in-out',
                        '&:active': {
                          transform: isMobile ? 'scale(0.98)' : 'none'
                        }
                      }}>
                        {/* カードコンポーネント */}
                        <SubjectCard
                          subject={subject}
                          onProgressAdded={loadSubjects}
                          onSubjectUpdated={handleUpdateSubject}
                          onEdit={handleEditSubject}
                          onDelete={handleDeleteConfirm}
                          formatDate={formatDate}
                          onRecordProgress={() => handleOpenProgressModal(subject)}
                        />
                      </Box>
                    </Grid>
                  ))}
                  
                  {sortedSubjects.length === 0 && (
                    <Grid item xs={12}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: { xs: 4, sm: 6 }, 
                          textAlign: 'center',
                          border: '1px dashed',
                          borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                          borderRadius: 2,
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.7)' : 'white',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: 250
                        }}
                      >
                        <Box 
                          sx={{ 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(66, 66, 66, 0.5)' : 'background.default',
                            borderRadius: '50%',
                            p: 2,
                            mb: 3,
                            display: 'inline-flex'
                          }}
                        >
                          <MenuBookIcon color="primary" sx={{ fontSize: 48, opacity: 0.8 }} />
                        </Box>
                        
                        <Typography variant="h6" gutterBottom>
                          科目がまだ登録されていません
                        </Typography>
                        <Typography variant="body2" color="textSecondary" paragraph>
                          「新しい科目」ボタンから科目を追加してください
                        </Typography>
                        <Button 
                          variant="contained" 
                          color="primary" 
                          onClick={handleAddSubject}
                          startIcon={<Add />}
                          size="large"
                          sx={{
                            borderRadius: 28,
                            px: 3,
                            py: 1.5,
                            mt: 2
                          }}
                        >
                          新しい科目を追加
                        </Button>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </>
            ) : (
              <Paper 
                elevation={0} 
                sx={{ 
                  borderRadius: 2, 
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.7)' : 'transparent'
                }}
              >
                <SubjectListView
                  subjects={sortedSubjects}
                  loading={isLoading}
                  formatDate={formatDate}
                  onSubjectUpdated={handleUpdateSubject}
                  onSubjectEdit={handleEditSubject}
                  onSubjectDelete={handleDeleteConfirm}
                  onRecordProgress={handleOpenProgressModal}
                />
              </Paper>
            )}
          </>
        )}
      </Box>

      {/* 科目追加/編集フォーム */}
      <Dialog 
        open={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        fullWidth 
        maxWidth="md"
        fullScreen={window.innerWidth < 600} // モバイルではフルスクリーン表示
        PaperProps={{
          elevation: 1,
          sx: { borderRadius: { xs: 0, sm: 2 } }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">{editingSubject ? '科目を編集' : '新しい科目を追加'}</Typography>
            <IconButton 
              edge="end" 
              color="inherit" 
              onClick={() => setIsFormOpen(false)} 
              aria-label="close"
              sx={{ display: { xs: 'flex', sm: 'none' } }} // モバイルのみ表示
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <SubjectForm
            subject={editingSubject}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isLoading={isSubmitting}
            error={submitError}
          />
        </DialogContent>
      </Dialog>
      
      {/* 科目削除確認ダイアログ */}
      <Dialog 
        open={isDeleteConfirming} 
        onClose={handleCancelDelete}
        PaperProps={{
          elevation: 1,
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>科目の削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {subjectToDelete ? (
              <>
                科目「<strong>{subjectToDelete.name}</strong>」を削除します。<br />
                この操作は取り消せません。よろしいですか？
              </>
            ) : '科目を削除します。この操作は取り消せません。'}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCancelDelete} 
            disabled={isDeleting}
            sx={{ borderRadius: 2 }}
          >
            キャンセル
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} /> : <DeleteIcon />}
            sx={{ borderRadius: 2 }}
          >
            削除
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 進捗記録モーダル */}
      <Dialog 
        open={isProgressModalOpen} 
        onClose={handleCloseProgressModal}
        fullWidth
        maxWidth="sm"
        fullScreen={window.innerWidth < 600} // モバイルではフルスクリーン表示
        PaperProps={{
          elevation: 1,
          sx: { borderRadius: { xs: 0, sm: 2 } }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              進捗を記録 {selectedSubjectForProgress && `- ${selectedSubjectForProgress.name}`}
            </Typography>
            <IconButton 
              edge="end" 
              color="inherit" 
              onClick={handleCloseProgressModal} 
              aria-label="close"
              sx={{ display: { xs: 'flex', sm: 'none' } }} // モバイルのみ表示
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {progressSubmitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {progressSubmitError}
            </Alert>
          )}
          
          {selectedSubjectForProgress && (
            <ProgressForm
              subject={selectedSubjectForProgress}
              onSuccess={handleProgressSuccess}
              onClose={handleCloseProgressModal}
              open={isProgressModalOpen}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* スナックバー通知 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ 
          mb: { xs: 7, sm: 2 }, // モバイルではフローティングボタンの上に表示
          mx: 2 
        }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          elevation={6}
          variant="filled"
          sx={{ width: '100%', maxWidth: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 