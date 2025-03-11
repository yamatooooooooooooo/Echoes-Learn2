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
import { calculateDaysRemaining, calculateProgress } from '../utils/subjectUtils';
import { SubjectHeader } from './SubjectHeader';
import { SubjectInfo } from './SubjectInfo';
import { ProgressForm } from './ProgressForm';
import { ProgressFormData } from '../../../../domain/models/ProgressModel';
import { ProgressList } from './ProgressList';
import { ProgressHistory } from './ProgressHistory';
import { useSubjectProgress } from '../../../../application/usecases/useSubjectProgress';

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
  const [isAddingProgress, setIsAddingProgress] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const cardRef = useRef<HTMLDivElement>(null);
  
  // 計算値
  const daysRemaining = calculateDaysRemaining(subject?.examDate);
  const progress = calculateProgress(subject?.currentPage || 0, subject?.totalPages || 0);
  
  // 進捗操作のためのカスタムフックを使用
  const { 
    loading, 
    error, 
    progressRecords,
    isEditingProgress,
    currentEditingProgress,
    addProgress, 
    startEditingProgress,
    cancelEditingProgress,
    updateProgress,
    deleteProgress
  } = useSubjectProgress(subject, onProgressAdded, onSubjectUpdated);

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
          {!isEditingProgress && !isAddingProgress && (
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
          
          {/* 編集モード時のフォーム */}
          {isEditingProgress ? (
            <ProgressForm 
              subject={subject} 
              open={isEditingProgress}
              onClose={cancelEditingProgress}
              onSuccess={(progressId) => {
                // 進捗が更新されたら、編集モードを終了し、必要に応じてコールバックを実行
                cancelEditingProgress();
                if (onSubjectUpdated) {
                  // 科目データを更新（実際の実装では、更新された科目データを取得する必要があります）
                  onSubjectUpdated(subject);
                }
              }}
            />
          ) : isAddingProgress ? (
            <ProgressForm 
              subject={subject} 
              open={isAddingProgress}
              onClose={() => setIsAddingProgress(false)}
              onSuccess={(progressId) => {
                // 進捗が追加されたら、追加モードを終了し、必要に応じてコールバックを実行
                setIsAddingProgress(false);
                if (onProgressAdded) {
                  onProgressAdded();
                }
                if (onSubjectUpdated) {
                  // 科目データを更新（実際の実装では、更新された科目データを取得する必要があります）
                  onSubjectUpdated(subject);
                }
              }}
            />
          ) : (
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
                      onClick={() => setIsAddingProgress(true)}
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
                      onClick={() => setIsAddingProgress(true)}
                      startIcon={<TimelineIcon />}
                    >
                      進捗を記録
                    </Button>
                  </Box>
                  
                  {/* 進捗履歴表示 */}
                  <ProgressHistory
                    progressRecords={progressRecords}
                    loading={loading}
                    error={error}
                    onEdit={startEditingProgress}
                    onDelete={deleteProgress}
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
    </Card>
  );
}; 