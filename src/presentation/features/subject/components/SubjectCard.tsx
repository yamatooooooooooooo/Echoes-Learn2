import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  Divider,
  Box,
  IconButton,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Timeline as TimelineIcon,
  Info as InfoIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { Subject } from '../../../../domain/models/SubjectModel';
import { Progress } from '../../../../domain/models/ProgressModel';
import { calculateDaysRemaining, calculateProgress } from '../utils/subjectUtils';
import { SubjectHeader } from './SubjectHeader';
import { SubjectInfo } from './SubjectInfo';
import { ProgressForm } from './ProgressForm';
import { ProgressList } from './ProgressList';
import { ProgressHistory } from './ProgressHistory';
import { ProgressDeleteDialog } from './ProgressDeleteDialog';
import { useSubjectProgress } from '../hooks/useSubjectProgress';

// タブの種類
type TabType = 'details' | 'history';

interface SubjectCardProps {
  subject: Subject;
  onProgressAdded?: () => void;
  onSubjectUpdated?: (updatedSubject: Subject) => void;
  onEdit?: (subject: Subject) => void;
  onDelete?: (subjectId: string) => void;
  formatDate: (date: Date | string | undefined) => string;
}

/**
 * 科目の詳細情報と進捗記録機能を提供するカードコンポーネント
 */
export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  onProgressAdded,
  onSubjectUpdated,
  onEdit,
  onDelete,
  formatDate
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [selectedProgress, setSelectedProgress] = useState<Progress | undefined>(undefined);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // 計算値
  const daysRemaining = calculateDaysRemaining(subject?.examDate);
  const progress = calculateProgress(subject?.currentPage || 0, subject?.totalPages || 0);
  
  // 進捗操作のためのカスタムフックを使用
  const { 
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
    error
  } = useSubjectProgress(
    subject, 
    onProgressAdded, 
    onSubjectUpdated,
    // 進捗更新後のコールバック
    () => {
      // 進捗履歴を更新するためのコールバック
      if (onProgressAdded) {
        onProgressAdded();
      }
    },
    // 進捗削除後のコールバック
    () => {
      // 進捗履歴を更新するためのコールバック
      if (onProgressAdded) {
        onProgressAdded();
      }
    }
  );

  // タッチイベントの調整
  useEffect(() => {
    const currentCard = cardRef.current;
    if (!currentCard) return;

    // カード内のタッチズームを防止
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    currentCard.addEventListener('touchstart', preventZoom, { passive: false });
    
    return () => {
      currentCard.removeEventListener('touchstart', preventZoom);
    };
  }, []);

  // 展開の切り替え
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // タブの切り替え
  const handleTabChange = (_event: React.SyntheticEvent, newValue: TabType) => {
    setActiveTab(newValue);
  };

  // 編集ボタンクリック
  const handleEditClick = () => {
    if (onEdit) {
      onEdit(subject);
    }
  };
  
  // 削除ボタンクリック
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };
  
  // 削除確認
  const confirmDelete = () => {
    if (onDelete && subject.id) {
      onDelete(subject.id);
    }
    setShowDeleteConfirm(false);
  };
  
  // 削除キャンセル
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // 進捗フォーム開閉時にselectedProgressをリセット
  const handleToggleProgressForm = () => {
    if (!isAdding) {
      setSelectedProgress(undefined);
    }
    toggleProgressForm();
  };

  // 進捗編集ハンドラー
  const handleEditProgress = (progress: Progress) => {
    setSelectedProgress(progress);
    startEditing(progress);
  };

  // 進捗削除ハンドラー
  const handleDeleteProgress = (progressId: string) => {
    openDeleteDialog(progressId);
  };

  // 進捗フォーム成功ハンドラー
  const handleProgressSuccess = (progressId: string) => {
    // 進捗履歴を更新するためのコールバック
    if (onProgressAdded) {
      onProgressAdded();
    }
  };

  // ProgressHistoryコンポーネントに渡すデータ
  const progressRecords: Progress[] = [];

  return (
    <Card 
      ref={cardRef}
      sx={{ 
        mb: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }
      }}
    >
      {/* カードヘッダー */}
      <CardContent sx={{ p: 2, pb: 2, '&:last-child': { pb: 2 } }}>
        <SubjectHeader 
          subject={subject}
          progress={progress}
          daysRemaining={daysRemaining}
          expanded={expanded}
          onExpandClick={toggleExpanded}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          formatDate={formatDate}
        />
      </CardContent>
      
      {/* 展開時のコンテンツ */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0, pb: 2, px: 2, '&:last-child': { pb: 2 } }}>
          {/* 進捗更新中、または追加中以外の場合にタブを表示 */}
          {!isEditing && !isAdding && (
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                variant="fullWidth"
              >
                <Tab 
                  label="詳細" 
                  value="details" 
                  icon={<InfoIcon fontSize="small" />} 
                  iconPosition="start"
                />
                <Tab 
                  label="進捗履歴" 
                  value="history"
                  icon={<HistoryIcon fontSize="small" />}
                  iconPosition="start"
                />
              </Tabs>
            </Box>
          )}
          
          {/* 進捗フォーム */}
          {isAdding && (
            <ProgressForm 
              subject={subject}
              progress={selectedProgress}
              open={isAdding}
              onClose={handleToggleProgressForm}
              onSuccess={handleProgressSuccess}
              isEditMode={isEditing}
            />
          )}
          
          {/* 通常表示モード */}
          {!isAdding && (
            <>
              {/* 「詳細」タブの内容 */}
              {activeTab === 'details' && (
                <>
                  <SubjectInfo 
                    subject={subject} 
                    formatDate={formatDate}
                    progress={progress}
                  />
                  
                  {/* 進捗記録ボタン */}
                  <Box sx={{ mt: 2, mb: 2, display: 'flex', justifyContent: 'center' }}>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      size="small" 
                      onClick={handleToggleProgressForm}
                      startIcon={<TimelineIcon />}
                    >
                      進捗を記録
                    </Button>
                  </Box>
                </>
              )}
              
              {/* 「進捗履歴」タブの内容 */}
              {activeTab === 'history' && (
                <>
                  {/* 進捗記録ボタン */}
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      size="small" 
                      onClick={handleToggleProgressForm}
                      startIcon={<TimelineIcon />}
                    >
                      進捗を記録
                    </Button>
                  </Box>
                  
                  {/* 進捗履歴表示 */}
                  <ProgressHistory
                    progressRecords={progressRecords}
                    loading={false}
                    error={null}
                    onEdit={handleEditProgress}
                    onDelete={handleDeleteProgress}
                    formatDate={formatDate}
                  />
                </>
              )}
            </>
          )}
        </CardContent>
      </Collapse>
      
      {/* 削除確認ダイアログ */}
      <Dialog
        open={showDeleteConfirm}
        onClose={cancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          科目の削除の確認
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" id="delete-dialog-description">
            「{subject.name}」を削除してもよろしいですか？この操作は元に戻せません。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            キャンセル
          </Button>
          <Button onClick={confirmDelete} color="error">
            削除する
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 進捗削除確認ダイアログ */}
      <ProgressDeleteDialog
        open={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={deleteProgress}
        isDeleting={false}
      />
    </Card>
  );
}; 