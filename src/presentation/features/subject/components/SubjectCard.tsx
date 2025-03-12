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
  Tab,
  Paper,
  Chip,
  LinearProgress,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Timeline as TimelineIcon,
  Info as InfoIcon,
  History as HistoryIcon,
  BarChart as BarChartIcon,
  MenuBook as MenuBookIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon
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
import { ProgressCharts } from './ProgressCharts';
import { useSubjectProgress } from '../hooks/useSubjectProgress';
import { useFirebase } from '../../../../contexts/FirebaseContext';
import { useServices } from '../../../../hooks/useServices';

// タブの種類
type TabType = 'details' | 'history' | 'charts';

interface SubjectCardProps {
  subject: Subject;
  onProgressAdded?: () => void;
  onSubjectUpdated?: (updatedSubject: Subject) => void;
  onEdit?: (subject: Subject) => void;
  onDelete?: (subject: Subject) => void;
  formatDate: (date: Date | string | undefined) => string;
  onRecordProgress?: (subject: Subject) => void;
}

// カードのスタイリング
const cardStyles = {
  root: {
    height: '100%',
    width: '100%',
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: (theme: any) => theme.palette.mode === 'dark' 
        ? '0 8px 24px rgba(0, 0, 0, 0.3)' 
        : '0 8px 24px rgba(0, 0, 0, 0.1)'
    },
    overflow: 'hidden',
    borderRadius: 3,
    border: '1px solid',
    borderColor: (theme: any) => theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.08)',
    backgroundColor: (theme: any) => theme.palette.mode === 'dark' 
      ? 'rgba(30, 30, 30, 0.7)' 
      : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    boxShadow: (theme: any) => theme.palette.mode === 'dark'
      ? '0 4px 12px rgba(0, 0, 0, 0.2)'
      : '0 4px 12px rgba(0, 0, 0, 0.05)',
  },
  contentArea: {
    p: { xs: 2, sm: 2.5 },
    pt: { xs: 3, sm: 3.5 },
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  title: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    mb: 2
  },
  priorityBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    zIndex: 1
  },
  actionArea: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    p: { xs: 1.5, sm: 2 },
    pt: { xs: 1, sm: 1.5 },
    pb: { xs: 1, sm: 1.5 },
    borderTop: '1px solid',
    borderColor: (theme: any) => theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.08)' 
      : 'rgba(0, 0, 0, 0.05)',
    backgroundColor: (theme: any) => theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.03)' 
      : 'rgba(0, 0, 0, 0.01)'
  },
  progressSection: {
    mt: 2,
    mb: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    my: 1,
    backgroundColor: (theme: any) => theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.05)',
  },
  recordProgressButton: {
    width: 'auto',
    borderRadius: '20px',
    py: { xs: 0.5, sm: 0.75 },
    px: { xs: 1.5, sm: 2 },
    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
    fontWeight: 500,
    boxShadow: 'none',
    '&:hover': {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
    }
  },
  tabPanel: {
    p: 2,
    pt: 3
  },
  expandButton: {
    transform: 'rotate(0deg)',
    transition: 'transform 0.2s',
    '&.expanded': {
      transform: 'rotate(180deg)'
    },
    backgroundColor: (theme: any) => theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(0, 0, 0, 0.04)',
    '&:hover': {
      backgroundColor: (theme: any) => theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(0, 0, 0, 0.08)',
    }
  }
};

/**
 * Notion風の科目カードコンポーネント
 * 科目の詳細情報と進捗記録機能を提供する
 */
export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  onProgressAdded,
  onSubjectUpdated,
  onEdit,
  onDelete,
  formatDate,
  onRecordProgress
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [progressToDelete, setProgressToDelete] = useState<string | null>(null);
  const [progressRecords, setProgressRecords] = useState<Progress[]>([]);
  const [loadingProgressRecords, setLoadingProgressRecords] = useState(false);
  const [progressRecordsError, setProgressRecordsError] = useState<string | null>(null);
  const [editingProgress, setEditingProgress] = useState<Progress | null>(null);
  
  const { firestore, auth } = useFirebase();
  const { progressRepository } = useServices();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isHovered, setIsHovered] = useState(false);
  
  // 計算値
  const daysRemaining = calculateDaysRemaining(subject?.examDate);
  const progress = calculateProgress(subject?.currentPage || 0, subject?.totalPages || 0);
  
  // 進捗操作のためのカスタムフックを使用
  const { 
    progressForm,
    isAdding: isAddingFromHook,
    isEditing,
    toggleProgressForm,
    startEditing,
    openDeleteDialog,
    closeDeleteDialog,
    deleteProgress,
    isDeleteDialogOpen: isDeleteDialogOpenFromHook,
    progressToDelete: progressToDeleteFromHook,
    handleProgressChange,
    handleQuickProgress,
    handleSaveProgress,
    message,
    showMessage,
    error,
    progressRecords: recordsFromHook,
    loadingProgressRecords: loadingRecordsFromHook,
    progressRecordsError: errorRecordsFromHook
  } = useSubjectProgress(
    subject, 
    onProgressAdded, 
    onSubjectUpdated
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
    if (onDelete) {
      onDelete(subject);
    }
  };

  // 進捗フォーム開閉
  const handleToggleProgressForm = () => {
    if (onRecordProgress) {
      onRecordProgress(subject);
    } else {
      setIsAdding(!isAdding);
    }
  };

  // 優先度に応じた色を取得
  const getPriorityColor = (): string => {
    switch (subject.priority) {
      case 'high': return 'error.main';
      case 'medium': return 'warning.main';
      case 'low': return 'success.main';
      default: return 'text.disabled';
    }
  };

  // 優先度のラベルを取得
  const getPriorityLabel = (): string => {
    switch (subject.priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '未設定';
    }
  };

  // 残り日数やボーダーカラーの計算に使用
  const getDaysRemainingColor = (days: number | null): string => {
    if (days === null) return 'text.disabled';
    if (days <= 7) return 'error.main';
    if (days <= 14) return 'warning.main';
    if (days <= 30) return 'primary.main';
    return 'success.main';
  };

  // 進捗状況の色を取得する関数
  const getProgressColor = (progressValue: number): string => {
    if (progressValue >= 100) return 'success.main';
    if (progressValue >= 70) return 'primary.main';
    if (progressValue >= 40) return 'info.main';
    if (progressValue >= 20) return 'warning.main';
    return 'error.main';
  };

  return (
    <Paper
      elevation={0}
      sx={cardStyles.root}
    >
      {/* 優先度を示すトップバー */}
      <Box
        sx={{
          ...cardStyles.priorityBadge,
          bgcolor: getPriorityColor()
        }}
      />

      <Box sx={cardStyles.contentArea}>
        {/* タイトル部分 */}
        <Box sx={cardStyles.title}>
          <Box sx={{ width: '100%' }}>
            <Typography
              variant="h6"
              sx={{ 
                fontWeight: 600, 
                fontSize: { xs: '1.2rem', sm: '1.3rem' },
                lineHeight: 1.4,
                mb: 1,
                pr: { xs: 5, sm: 4 } // 右側のボタンのスペースを確保
              }}
            >
              {subject.name}
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              flexWrap: 'wrap',
              gap: 1.5 
            }}>
              <Chip
                label={getPriorityLabel()}
                size="small"
                color={getPriorityColor() as any}
                icon={<MenuBookIcon fontSize="small" />}
                variant="outlined"
                sx={{ 
                  height: { xs: 28, sm: 24 },
                  fontSize: { xs: '0.8rem', sm: '0.75rem' },
                  px: 0.5
                }}
              />
              
              {subject.examDate && (
                <Chip
                  icon={<EventIcon fontSize="small" />}
                  label={`試験日: ${formatDate(subject.examDate)}`}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    height: { xs: 28, sm: 24 }, 
                    fontSize: { xs: '0.8rem', sm: '0.75rem' },
                    borderColor: getDaysRemainingColor(daysRemaining),
                    px: 0.5
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* 残り日数表示 */}
        {subject.examDate && daysRemaining !== null && (
          <Box sx={{ 
            mb: 2.5, 
            display: 'flex', 
            alignItems: 'center',
            mt: 1.5,
            py: 1,
            px: 1.5,
            borderRadius: 1.5,
            bgcolor: 'background.default'
          }}>
            <Tooltip title="試験までの残り日数">
              <AccessTimeIcon 
                fontSize="small" 
                sx={{ 
                  mr: 1, 
                  color: getDaysRemainingColor(daysRemaining)
                }} 
              />
            </Tooltip>
            <Typography
              variant="body2"
              sx={{
                fontWeight: daysRemaining <= 14 ? 'bold' : 'medium',
                color: getDaysRemainingColor(daysRemaining),
                fontSize: { xs: '0.9rem', sm: '0.875rem' }
              }}
            >
              {daysRemaining <= 0
                ? '試験日を過ぎています'
                : daysRemaining === 1
                ? '明日が試験日です！'
                : `試験まであと ${daysRemaining} 日`}
            </Typography>
          </Box>
        )}

        {/* 進捗状況 */}
        <Box sx={cardStyles.progressSection}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 1,
            flexWrap: 'wrap'
          }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '0.9rem', sm: '0.875rem' }
              }}
            >
              進捗状況
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'medium',
                color: subject.currentPage >= subject.totalPages ? 'success.main' : 'text.primary',
                fontSize: { xs: '0.9rem', sm: '0.875rem' }
              }}
            >
              {subject.currentPage} / {subject.totalPages} ページ
            </Typography>
          </Box>
          
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: { xs: 10, sm: 8 },
              borderRadius: 2,
              backgroundColor: 'rgba(0,0,0,0.05)',
              my: 1,
              '& .MuiLinearProgress-bar': {
                borderRadius: 2,
                backgroundColor: getProgressColor(progress)
              }
            }}
          />
          
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'right',
              mt: 0.5,
              fontWeight: 'medium',
              color: getProgressColor(progress),
              fontSize: { xs: '0.85rem', sm: '0.75rem' }
            }}
          >
            {progress}% 完了
          </Typography>
        </Box>
      </Box>

      {/* 操作ボタン */}
      <Box sx={cardStyles.actionArea}>
        <Button
          size="medium"
          startIcon={<AssignmentTurnedInIcon />}
          onClick={handleToggleProgressForm}
          variant="contained"
          color="primary"
          sx={{ 
            borderRadius: 4,
            px: { xs: 2.5, sm: 2 },
            py: { xs: 1, sm: 0.75 },
            fontSize: { xs: '0.9rem', sm: '0.875rem' }
          }}
        >
          進捗記録
        </Button>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="編集">
            <IconButton
              size="small"
              onClick={handleEditClick}
              color="default"
              sx={{ 
                width: { xs: 40, sm: 36 }, 
                height: { xs: 40, sm: 36 } 
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="削除">
            <IconButton
              size="small"
              onClick={handleDeleteClick}
              color="default"
              sx={{ 
                width: { xs: 40, sm: 36 }, 
                height: { xs: 40, sm: 36 } 
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* onRecordProgressが提供されていない場合のみ内蔵フォームを表示 */}
      {!onRecordProgress && (
        <>
          {/* 進捗フォーム */}
          <ProgressForm
            subject={subject}
            open={isAdding}
            onClose={handleToggleProgressForm}
            onSuccess={(progressId) => {
              handleToggleProgressForm();
              if (onProgressAdded) onProgressAdded();
            }}
          />
          
          {/* 進捗削除確認ダイアログ */}
          <ProgressDeleteDialog
            open={isDeleteDialogOpen}
            onClose={closeDeleteDialog}
            onConfirm={deleteProgress}
            isDeleting={false}
          />
        </>
      )}
    </Paper>
  );
}; 