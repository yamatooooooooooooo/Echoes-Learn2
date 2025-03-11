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
  LinearProgress
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
  Event as EventIcon
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

// タブの種類
type TabType = 'details' | 'history' | 'charts';

interface SubjectCardProps {
  subject: Subject;
  onProgressAdded?: () => void;
  onSubjectUpdated?: (updatedSubject: Subject) => void;
  onEdit?: (subject: Subject) => void;
  onDelete?: (subject: Subject) => void;
  formatDate: (date: Date | string | undefined) => string;
}

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
  formatDate
}) => {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('details');
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
    error,
    progressRecords,
    loadingProgressRecords,
    progressRecordsError
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
    toggleProgressForm();
  };

  // 優先度に応じた色を取得
  const getPriorityColor = (): string => {
    switch (subject.priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
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

  return (
    <Card 
      ref={cardRef}
      sx={{ 
        mb: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
          borderColor: 'primary.light'
        }
      }}
    >
      {/* カードヘッダー */}
      <CardContent sx={{ 
        p: 2, 
        pb: 2, 
        '&:last-child': { pb: 2 },
        borderBottom: expanded ? '1px solid' : 'none',
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            width: 'calc(100% - 90px)'
          }}>
            <MenuBookIcon sx={{ 
              mt: 0.5, 
              mr: 1, 
              color: getPriorityColor(),
              fontSize: '1.5rem'
            }} />
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  mb: 0.5,
                  lineHeight: 1.3
                }}
              >
                {subject.name}
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                flexWrap: 'wrap',
                gap: 1,
                mb: 1
              }}>
                <Chip 
                  label={getPriorityLabel()} 
                  size="small" 
                  sx={{ 
                    bgcolor: `${getPriorityColor()}20`,
                    color: getPriorityColor(),
                    fontWeight: 500,
                    height: 20,
                    fontSize: '0.7rem'
                  }} 
                />
                
                {subject.examDate && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    color: daysRemaining && daysRemaining <= 7 ? 'error.main' : 'text.secondary'
                  }}>
                    <EventIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
                    {daysRemaining !== null ? `あと${daysRemaining}日` : formatDate(subject.examDate)}
                  </Box>
                )}
              </Box>
              
              <Box sx={{ width: '100%', mt: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 0.5
                }}>
                  <Typography variant="body2" color="text.secondary">
                    進捗: {subject.currentPage || 0}/{subject.totalPages} ページ
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      color: progress >= 70 ? 'success.main' : progress >= 30 ? 'primary.main' : 'warning.main'
                    }}
                  >
                    {progress}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    bgcolor: 'rgba(0,0,0,0.05)',
                    '.MuiLinearProgress-bar': {
                      bgcolor: progress >= 70 ? 'success.main' : progress >= 30 ? 'primary.main' : 'warning.main'
                    }
                  }} 
                />
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Box sx={{ display: 'flex' }}>
              <IconButton 
                size="small" 
                onClick={handleEditClick}
                sx={{ p: 0.5 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={handleDeleteClick}
                sx={{ p: 0.5 }}
              >
                <DeleteIcon fontSize="small" color="error" />
              </IconButton>
            </Box>
            <IconButton 
              onClick={toggleExpanded} 
              size="small"
              sx={{ mt: 'auto', p: 0.5 }}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>
      </CardContent>
      
      {/* 展開時のコンテンツ */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 2, pb: 2, px: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 40,
                  fontSize: '0.8rem'
                }
              }}
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
              <Tab 
                label="グラフ" 
                value="charts"
                icon={<BarChartIcon fontSize="small" />}
                iconPosition="start"
              />
            </Tabs>
          </Box>
          
          {/* タブコンテンツ */}
          {activeTab === 'details' && (
            <>
              <SubjectInfo 
                subject={subject} 
                formatDate={formatDate}
                progress={progress}
              />
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="small" 
                  startIcon={<AddIcon />}
                  onClick={handleToggleProgressForm}
                  sx={{ borderRadius: 2 }}
                >
                  進捗を記録
                </Button>
              </Box>
            </>
          )}
          
          {activeTab === 'history' && (
            <ProgressHistory 
              progressRecords={progressRecords}
              loading={loadingProgressRecords}
              error={progressRecordsError}
              onEdit={startEditing}
              onDelete={openDeleteDialog}
              formatDate={formatDate}
            />
          )}
          
          {activeTab === 'charts' && (
            <ProgressCharts 
              progressRecords={progressRecords}
              subject={subject}
              loading={loadingProgressRecords}
              error={progressRecordsError}
            />
          )}
        </CardContent>
      </Collapse>
      
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
    </Card>
  );
}; 