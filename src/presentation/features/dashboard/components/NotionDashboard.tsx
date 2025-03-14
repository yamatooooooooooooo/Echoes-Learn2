import React, { useState, ReactNode, useMemo, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Tooltip, 
  Grid,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  Divider,
  useTheme,
  useMediaQuery,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import { 
  Settings as SettingsIcon,
  Add as AddIcon,
  ViewModule as ViewModuleIcon,
  Tune as TuneIcon,
  Check as CheckIcon,
  MoreHoriz as MoreHorizIcon,
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  ListAlt as ListAltIcon,
  CalendarToday as CalendarTodayIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { NotionModuleCard } from '../../../components/common/NotionModuleCard';
import { DASHBOARD_MODULES } from '../../../../config/dashboardModules';
import { useDashboardSettings } from '../hooks/useDashboardSettings';
import { DashboardData } from '../../../../domain/entities/Dashboard';
import { NotionModuleFactory, NotionModuleType } from './modules/NotionModuleFactory';

// 各モジュールコンポーネントのインポート
import { StatsOverviewCard } from './StatsOverviewCard';
import { SimpleDailyQuotaCard } from './SimpleDailyQuotaCard';
import { RecentProgressCard } from './RecentProgressCard';
import { LearningAnalyticsCard } from './LearningAnalyticsCard';
import { DashboardSettingsDialog } from './DashboardSettingsDialog';
import { NotionStyleCard } from '../../../components/common/NotionStyleCard';
import CountdownContainer from './CountdownContainer';
import LearningAnalysis from '../../../../components/LearningAnalysis';
import NormaDisplay from '../../../../components/NormaDisplay';

interface NotionDashboardProps {
  formatDate: (date: Date | string | undefined) => string;
  dashboardData: DashboardData;
  isLoading: boolean;
  error: string | null;
  refreshData: () => void;
}

// Notionスタイルのヘッダーコンポーネント
const NotionHeader: React.FC<{
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}> = ({ title, subtitle, actions }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 600, 
            fontSize: { xs: '1.5rem', sm: '2rem' },
            color: 'rgba(55, 53, 47, 1)'
          }}
        >
          {title}
        </Typography>
        {actions}
      </Box>
      {subtitle && (
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: 'rgba(55, 53, 47, 0.65)',
            fontSize: '1rem'
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

// ダッシュボードコントロールバー
const ControlBar: React.FC<{
  onToggleEditMode: () => void;
  onOpenModuleDialog: () => void;
  editMode: boolean;
}> = ({ onToggleEditMode, onOpenModuleDialog, editMode }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3,
        backgroundColor: editMode ? 'rgba(245, 247, 249, 1)' : 'transparent',
        borderRadius: 2,
        p: editMode ? 2 : 0
      }}
    >
      {editMode ? (
        <>
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 500, 
              color: 'rgba(55, 53, 47, 0.8)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ViewModuleIcon sx={{ mr: 1, fontSize: '1.1rem' }} />
            編集モード
          </Typography>
          <Box>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={onToggleEditMode}
              sx={{ 
                mr: 1,
                borderColor: 'rgba(55, 53, 47, 0.3)',
                color: 'rgba(55, 53, 47, 0.8)',
                '&:hover': {
                  borderColor: 'rgba(55, 53, 47, 0.5)',
                  backgroundColor: 'rgba(55, 53, 47, 0.05)'
                }
              }}
            >
              キャンセル
            </Button>
            <Button 
              variant="contained" 
              size="small" 
              onClick={onToggleEditMode}
              startIcon={<CheckIcon />}
              sx={{ 
                backgroundColor: 'rgba(55, 53, 47, 0.9)',
                '&:hover': {
                  backgroundColor: 'rgba(55, 53, 47, 1)'
                }
              }}
            >
              完了
            </Button>
          </Box>
        </>
      ) : (
        <>
          <Box />
          <Box>
            <Button
              variant="outlined"
              size="small"
              onClick={onOpenModuleDialog}
              startIcon={<AddIcon />}
              sx={{ 
                mr: 1.5,
                borderColor: 'rgba(55, 53, 47, 0.3)',
                color: 'rgba(55, 53, 47, 0.8)',
                '&:hover': {
                  borderColor: 'rgba(55, 53, 47, 0.5)',
                  backgroundColor: 'rgba(55, 53, 47, 0.05)'
                }
              }}
            >
              モジュール追加
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={onToggleEditMode}
              startIcon={<ViewModuleIcon />}
              sx={{ 
                borderColor: 'rgba(55, 53, 47, 0.3)',
                color: 'rgba(55, 53, 47, 0.8)',
                '&:hover': {
                  borderColor: 'rgba(55, 53, 47, 0.5)',
                  backgroundColor: 'rgba(55, 53, 47, 0.05)'
                }
              }}
            >
              レイアウト編集
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

// 利用可能なモジュールの定義
const AVAILABLE_MODULES = [
  {
    id: NotionModuleType.TOTAL_SUBJECTS,
    title: '教材数',
    description: '登録されている教材の総数を表示',
    icon: <SchoolIcon />
  },
  {
    id: NotionModuleType.COMPLETED_SUBJECTS,
    title: '完了した教材',
    description: '学習を完了した教材の数を表示',
    icon: <MenuBookIcon />
  },
  {
    id: NotionModuleType.STUDY_PROGRESS,
    title: '教材進捗状況',
    description: '教材の完了進捗を表示',
    icon: <BarChartIcon />
  },
  {
    id: NotionModuleType.TOTAL_PAGES,
    title: '総ページ数',
    description: 'すべての教材の総ページ数を表示',
    icon: <MenuBookIcon />
  },
  {
    id: NotionModuleType.COMPLETED_PAGES,
    title: '学習済みページ',
    description: '学習済みのページ数を表示',
    icon: <MenuBookIcon />
  },
  {
    id: NotionModuleType.PAGE_PROGRESS,
    title: 'ページ進捗状況',
    description: 'ページ学習の進捗状況を表示',
    icon: <TimelineIcon />
  },
  {
    id: NotionModuleType.WEEKLY_TREND,
    title: '週間トレンド',
    description: '週ごとの学習進捗を表示',
    icon: <TrendingUpIcon />
  },
  {
    id: NotionModuleType.SUBJECT_BREAKDOWN,
    title: '教材内訳',
    description: '教材の内訳を表示',
    icon: <ListAltIcon />
  },
  {
    id: NotionModuleType.RECENT_ACTIVITY,
    title: '最近の活動',
    description: '最近の学習活動を表示',
    icon: <CalendarTodayIcon />
  }
];

// モジュール選択ダイアログ
const ModuleSelectDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  availableModules: Array<{ id: string; title: string; description: string; icon: React.ReactNode }>;
  onAddModule: (moduleId: string) => void;
}> = ({ open, onClose, availableModules, onAddModule }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid rgba(230, 230, 230, 1)', pb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>モジュールを追加</Typography>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {availableModules.map((module) => (
            <Grid item xs={12} sm={6} key={module.id}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  border: '1px solid rgba(230, 230, 230, 1)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(245, 247, 249, 0.5)'
                  }
                }}
                onClick={() => {
                  onAddModule(module.id);
                  onClose();
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Box sx={{ mr: 1.5, color: 'text.secondary' }}>{module.icon}</Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {module.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {module.description}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ color: 'text.secondary' }}>キャンセル</Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * Notion風のダッシュボード
 * - シームレスなドラッグ＆ドロップ
 * - クリーンでミニマルなデザイン
 * - 直感的な操作感
 */
export const NotionDashboard: React.FC<NotionDashboardProps> = ({
  formatDate,
  dashboardData,
  isLoading,
  error,
  refreshData
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // デフォルトのモジュール設定
  const defaultModules = useMemo(() => [
    NotionModuleType.TOTAL_SUBJECTS,
    NotionModuleType.COMPLETED_SUBJECTS,
    NotionModuleType.STUDY_PROGRESS,
    NotionModuleType.TOTAL_PAGES,
    NotionModuleType.COMPLETED_PAGES,
    NotionModuleType.PAGE_PROGRESS
  ], []);
  
  // モジュールの状態
  const [modules, setModules] = useState<string[]>(defaultModules);
  const [editMode, setEditMode] = useState(false);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // アイコンをReactNodeとして安全に変換する関数
  const getModuleIcon = useCallback((moduleId: string): ReactNode => {
    const module = AVAILABLE_MODULES.find(m => m.id === moduleId);
    return module?.icon || null;
  }, []);
  
  // 編集モードを切り替える
  const toggleEditMode = useCallback(() => {
    if (editMode) {
      setSnackbarMessage('レイアウトが保存されました');
      setSnackbarOpen(true);
    }
    setEditMode(prevMode => !prevMode);
  }, [editMode]);
  
  // モジュール選択ダイアログを開く
  const handleOpenModuleDialog = useCallback(() => {
    setModuleDialogOpen(true);
  }, []);
  
  // モジュール選択ダイアログを閉じる
  const handleCloseModuleDialog = useCallback(() => {
    setModuleDialogOpen(false);
  }, []);
  
  // モジュールを追加する
  const handleAddModule = useCallback((moduleId: string) => {
    setModules(prev => [...prev, moduleId]);
    setSnackbarMessage(`${AVAILABLE_MODULES.find(m => m.id === moduleId)?.title || 'モジュール'}が追加されました`);
    setSnackbarOpen(true);
  }, []);
  
  // モジュールの表示/非表示を切り替える
  const handleToggleVisibility = useCallback((id: string) => {
    setModules(prev => prev.filter(moduleId => moduleId !== id));
    setSnackbarMessage(`モジュールが非表示になりました`);
    setSnackbarOpen(true);
  }, []);
  
  // モジュールの折りたたみを切り替える
  const handleToggleCollapse = useCallback((id: string, isCollapsed: boolean) => {
    // 将来的に保存する場合はここで処理
  }, []);
  
  // モジュールを上に移動
  const handleMoveUp = useCallback((id: string) => {
    setModules(prev => {
      const index = prev.indexOf(id);
      if (index <= 0) return prev;
      
      const newModules = [...prev];
      const temp = newModules[index - 1];
      newModules[index - 1] = newModules[index];
      newModules[index] = temp;
      
      return newModules;
    });
  }, []);
  
  // モジュールを下に移動
  const handleMoveDown = useCallback((id: string) => {
    setModules(prev => {
      const index = prev.indexOf(id);
      if (index === -1 || index === prev.length - 1) return prev;
      
      const newModules = [...prev];
      const temp = newModules[index + 1];
      newModules[index + 1] = newModules[index];
      newModules[index] = temp;
      
      return newModules;
    });
  }, []);
  
  // ドラッグ＆ドロップの処理
  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    const newModules = Array.from(modules);
    const [removed] = newModules.splice(source.index, 1);
    newModules.splice(destination.index, 0, removed);
    
    setModules(newModules);
  }, [modules]);

  // スナックバーを閉じる
  const handleCloseSnackbar = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  // 利用可能なモジュールを取得
  const availableModules = useMemo(() => 
    AVAILABLE_MODULES.filter(module => !modules.includes(module.id)),
    [modules]
  );

  return (
    <Box 
      sx={{ 
        maxWidth: '1200px', 
        mx: 'auto', 
        px: { xs: 2, sm: 3, md: 4 }, 
        py: { xs: 3, sm: 4, md: 5 } 
      }}
    >
      {/* ダッシュボードヘッダー */}
      <NotionHeader
        title="ダッシュボード"
        subtitle={`${dashboardData.totalSubjects} 科目 | ${dashboardData.completedSubjects} 完了 | ${dashboardData.inProgressSubjects} 進行中`}
      />
      
      {/* コントロールバー */}
      <ControlBar 
        onToggleEditMode={toggleEditMode} 
        onOpenModuleDialog={handleOpenModuleDialog}
        editMode={editMode}
      />
      
      {/* ドラッグ＆ドロップ可能なモジュールコンテナ */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard-modules">
          {(provided) => (
            <Box
              {...provided.droppableProps}
              ref={provided.innerRef}
              sx={{ width: '100%' }}
            >
              {modules.map((moduleId, index) => {
                const moduleType = moduleId as NotionModuleType;
                return (
                  <Box 
                    key={moduleId}
                    sx={{ 
                      width: '100%', 
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <NotionModuleFactory
                      type={moduleType}
                      dashboardData={dashboardData}
                      id={moduleId}
                      index={index}
                      onToggleVisibility={handleToggleVisibility}
                      onToggleCollapse={handleToggleCollapse}
                      onMoveUp={handleMoveUp}
                      onMoveDown={handleMoveDown}
                      isDraggingEnabled={editMode}
                      canHide={true}
                      isFirst={index === 0}
                      isLast={index === modules.length - 1}
                    />
                  </Box>
                );
              })}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
      
      {/* モジュール選択ダイアログ */}
      <ModuleSelectDialog 
        open={moduleDialogOpen}
        onClose={handleCloseModuleDialog}
        availableModules={availableModules}
        onAddModule={handleAddModule}
      />
      
      {/* 通知スナックバー */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          onClose={handleCloseSnackbar}
          sx={{ 
            width: '100%', 
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)', 
            borderRadius: 2,
            backgroundColor: 'rgba(55, 53, 47, 0.8)',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 