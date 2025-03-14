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
  Chip,
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
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { NotionModuleCard } from '../../../components/common/NotionModuleCard';
import { DASHBOARD_MODULES } from '../../../../config/dashboardModules';
import { useDashboardSettings } from '../hooks/useDashboardSettings';
import { DashboardData } from '../../../../domain/entities/Dashboard';
import { NotionModuleFactory, NotionModuleType } from './modules/NotionModuleFactory';
import ProgressRadarChart from './ProgressRadarChart';
import NotionLearningAnalysis from './NotionLearningAnalysis';
import NotionNormaDisplay from './NotionNormaDisplay';
import NotionSettingsDialog from './NotionSettingsDialog';

// 各モジュールコンポーネントのインポート
import { StatsOverviewCard } from './StatsOverviewCard';
import { SimpleDailyQuotaCard } from './SimpleDailyQuotaCard';
import { RecentProgressCard } from './RecentProgressCard';
import { LearningAnalyticsCard } from './LearningAnalyticsCard';
import { DashboardSettingsDialog } from './DashboardSettingsDialog';
import { NotionStyleCard } from '../../../components/common/NotionStyleCard';
import { default as ExternalCountdownContainer } from './CountdownContainer';

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
            color: 'rgba(55, 53, 47, 1)',
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
            fontSize: '1rem',
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
        p: editMode ? 2 : 0,
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
              alignItems: 'center',
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
                  backgroundColor: 'rgba(55, 53, 47, 0.05)',
                },
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
                  backgroundColor: 'rgba(55, 53, 47, 1)',
                },
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
                  backgroundColor: 'rgba(55, 53, 47, 0.05)',
                },
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
                  backgroundColor: 'rgba(55, 53, 47, 0.05)',
                },
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
    icon: <SchoolIcon />,
  },
  {
    id: NotionModuleType.COMPLETED_SUBJECTS,
    title: '完了した教材',
    description: '学習を完了した教材の数を表示',
    icon: <MenuBookIcon />,
  },
  {
    id: NotionModuleType.STUDY_PROGRESS,
    title: '教材進捗状況',
    description: '教材の完了進捗を表示',
    icon: <BarChartIcon />,
  },
  {
    id: NotionModuleType.TOTAL_PAGES,
    title: '総ページ数',
    description: 'すべての教材の総ページ数を表示',
    icon: <MenuBookIcon />,
  },
  {
    id: NotionModuleType.COMPLETED_PAGES,
    title: '学習済みページ',
    description: '学習済みのページ数を表示',
    icon: <MenuBookIcon />,
  },
  {
    id: NotionModuleType.PAGE_PROGRESS,
    title: 'ページ進捗状況',
    description: 'ページ学習の進捗状況を表示',
    icon: <TimelineIcon />,
  },
  {
    id: NotionModuleType.LEARNING_ANALYSIS,
    title: '学習効率分析',
    description: '学習パターンと効率性の分析を表示',
    icon: <TrendingUpIcon />,
  },
  {
    id: NotionModuleType.EXAM_COUNTDOWN,
    title: '試験カウントダウン',
    description: '試験日までの残り日数とノルマ達成状況',
    icon: <CalendarTodayIcon />,
  },
  {
    id: NotionModuleType.REPORT_DEADLINE,
    title: 'レポート締切',
    description: 'レポート提出までの残り日数',
    icon: <AssessmentIcon />,
  },
  {
    id: NotionModuleType.DAILY_QUOTA,
    title: '今日のノルマ',
    description: '今日の学習ノルマと進捗状況',
    icon: <ListAltIcon />,
  },
  {
    id: NotionModuleType.WEEKLY_QUOTA,
    title: '週間ノルマ',
    description: '今週の学習ノルマと進捗状況',
    icon: <ListAltIcon />,
  },
  {
    id: NotionModuleType.SUBJECT_PERFORMANCE,
    title: '科目別成績',
    description: '科目ごとの学習効率と成績分析',
    icon: <BarChartIcon />,
  },
];

// モジュール選択ダイアログ
const ModuleSelectDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  availableModules: Array<{
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
  }>;
  onAddModule: (moduleId: string) => void;
}> = ({ open, onClose, availableModules, onAddModule }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid rgba(230, 230, 230, 1)', pb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          モジュールを追加
        </Typography>
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
                    backgroundColor: 'rgba(245, 247, 249, 0.5)',
                  },
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
        <Button onClick={onClose} sx={{ color: 'text.secondary' }}>
          キャンセル
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ダッシュボードセクションコンポーネントを追加
const DashboardSection: React.FC<{
  title: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}> = ({ title, children, collapsible = true, defaultCollapsed = false }) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const theme = useTheme();

  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          cursor: collapsible ? 'pointer' : 'default',
          '&:hover': collapsible ? { color: theme.palette.primary.main } : {},
        }}
        onClick={() => collapsible && setCollapsed(!collapsed)}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: 'rgba(55, 53, 47, 0.85)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {collapsible && (
            <ExpandMoreIcon
              sx={{
                mr: 1,
                transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
          )}
          {title}
        </Typography>
      </Box>
      <Box
        sx={{
          display: collapsed ? 'none' : 'block',
          transition: 'all 0.3s ease',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

// クイック統計カードコンポーネント
const QuickStatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color: string;
}> = ({ title, value, subtitle, icon, color }) => {
  return (
    <Paper
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${color}15`,
            color: color,
            mr: 1.5,
          }}
        >
          {icon}
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'rgba(55, 53, 47, 0.85)' }}>
          {title}
        </Typography>
      </Box>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, mt: 1, color: color, fontSize: { xs: '1.5rem', sm: '2rem' } }}
      >
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ mt: 1, color: 'rgba(55, 53, 47, 0.6)' }}>
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
};

// カウントダウンコンポーネント（簡易実装）
const CountdownContainer: React.FC<{ exams?: any[]; reports?: any[] }> = ({ exams = [], reports = [] }) => {
  return (
    <Box>
      <Typography variant="body1" color="text.secondary">
        {exams.length > 0 || reports.length > 0 
          ? `${exams.length}件の試験と${reports.length}件のレポート締切があります`
          : '締切情報はありません'}
      </Typography>
    </Box>
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
  refreshData,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // デフォルトのモジュール設定
  const defaultModules = useMemo(
    () => [
      NotionModuleType.TOTAL_SUBJECTS,
      NotionModuleType.COMPLETED_SUBJECTS,
      NotionModuleType.STUDY_PROGRESS,
      NotionModuleType.TOTAL_PAGES,
      NotionModuleType.COMPLETED_PAGES,
      NotionModuleType.PAGE_PROGRESS,
    ],
    []
  );

  // モジュールの状態
  const [modules, setModules] = useState<string[]>(defaultModules);
  const [editMode, setEditMode] = useState(false);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [moduleSettings, setModuleSettings] = useState<Record<string, any>>({});
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  // アイコンをReactNodeとして安全に変換する関数
  const getModuleIcon = useCallback((moduleId: string): ReactNode => {
    const module = AVAILABLE_MODULES.find((m) => m.id === moduleId);
    return module?.icon || null;
  }, []);

  // 編集モードを切り替える
  const toggleEditMode = useCallback(() => {
    if (editMode) {
      setSnackbarMessage('レイアウトが保存されました');
    }
    setEditMode((prevMode) => !prevMode);
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
    // モジュールリストに追加
    setModules((prev) => [...prev, moduleId]);
    
    // モジュール設定にもデフォルト設定を追加
    setModuleSettings((prev) => ({
      ...prev,
      [moduleId]: { enabled: true, collapsed: false }
    }));
    
    setSnackbarMessage(
      `${AVAILABLE_MODULES.find((m) => m.id === moduleId)?.title || 'モジュール'}が追加されました`
    );
  }, []);

  // モジュールの表示/非表示を切り替える
  const handleToggleVisibility = useCallback((id: string) => {
    setModules((prev) => prev.filter((moduleId) => moduleId !== id));
    setSnackbarMessage(`モジュールが非表示になりました`);
  }, []);

  // モジュールの折りたたみを切り替える
  const handleToggleCollapse = useCallback((id: string, isCollapsed: boolean) => {
    // 将来的に保存する場合はここで処理
  }, []);

  // モジュールを上に移動
  const handleMoveUp = useCallback((id: string) => {
    setModules((prev) => {
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
    setModules((prev) => {
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
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const { source, destination } = result;
      const newModules = Array.from(modules);
      const [removed] = newModules.splice(source.index, 1);
      newModules.splice(destination.index, 0, removed);

      setModules(newModules);
    },
    [modules]
  );

  // スナックバーを閉じる
  const handleCloseSnackbar = useCallback(() => {
    setSnackbarMessage(null);
  }, []);

  // 利用可能なモジュールを取得
  const availableModules = useMemo(
    () => AVAILABLE_MODULES.filter((module) => !modules.includes(module.id)),
    [modules]
  );

  // 統合ダッシュボードヘッダー
  const IntegratedDashboardHeader = useMemo(() => {
    if (!dashboardData) return null;
    
    return (
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <QuickStatCard
              title="学習総進捗"
              value={`${Math.round((dashboardData.completedPages / (dashboardData.totalPages || 1)) * 100)}%`}
              subtitle={`${dashboardData.completedPages} / ${dashboardData.totalPages} ページ完了`}
              icon={<TimelineIcon />}
              color="#4caf50"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <QuickStatCard
              title="残り試験日数"
              value={dashboardData.exams && dashboardData.exams.length > 0 ? dashboardData.exams[0].remainingDays : '-'}
              subtitle={dashboardData.exams && dashboardData.exams.length > 0 ? `${formatDate(dashboardData.exams[0].date)}` : '試験情報なし'}
              icon={<CalendarTodayIcon />}
              color="#f44336"
            />
          </Grid>
        </Grid>
      </Box>
    );
  }, [dashboardData, formatDate]);
  
  // モジュールコンテンツをレンダリングする関数
  const renderModuleContent = useCallback((id: string) => {
    // NotionModuleTypeの場合は適切なコンテンツを返す
    const notionModuleType = mapModuleIdToNotionType(id);
    
    if (notionModuleType) {
      switch (notionModuleType) {
        case NotionModuleType.TOTAL_SUBJECTS:
          return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5">{dashboardData?.totalSubjects || 0}</Typography>
              <Typography variant="body2">教材数</Typography>
            </Box>
          );
        case NotionModuleType.COMPLETED_SUBJECTS:
          return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5">{dashboardData?.completedSubjects || 0}</Typography>
              <Typography variant="body2">完了した教材</Typography>
            </Box>
          );
        case NotionModuleType.STUDY_PROGRESS:
          return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5">
                {`${Math.round(((dashboardData?.completedSubjects || 0) / (dashboardData?.totalSubjects || 1)) * 100)}%`}
              </Typography>
              <Typography variant="body2">学習進捗</Typography>
            </Box>
          );
        // 他のケースも必要に応じて追加
        default:
          return (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2">{id}モジュールのコンテンツ</Typography>
            </Box>
          );
      }
    }
    
    // 従来のダッシュボードモジュール用のレンダリング処理
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2">{id}モジュールのコンテンツ</Typography>
      </Box>
    );
  }, [dashboardData]);

  // ダッシュボード設定ダイアログを開く
  const handleOpenSettingsDialog = useCallback(() => {
    setSettingsDialogOpen(true);
  }, []);

  // ダッシュボード設定ダイアログを閉じる
  const handleCloseSettingsDialog = useCallback(() => {
    setSettingsDialogOpen(false);
  }, []);

  // 設定を保存する
  const handleSaveSettings = useCallback((settings: any) => {
    setModuleSettings(settings);
    setSettingsDialogOpen(false);
  }, []);

  // 主要セクションの定義
  return (
    <Box
      sx={{
        width: '100%',
        padding: { xs: 2, sm: 3 },
        backgroundColor: '#f9f9fa',
      }}
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
          <NotionHeader
            title="学習ダッシュボード"
            subtitle="Notionスタイルの学習進捗ダッシュボード"
            actions={
              <Tooltip title="更新" placement="top">
                <IconButton
                  onClick={refreshData}
                  sx={{ color: 'rgba(55, 53, 47, 0.65)' }}
                >
                  <MoreHorizIcon />
                </IconButton>
              </Tooltip>
            }
          />

          <ControlBar
            onToggleEditMode={toggleEditMode}
            onOpenModuleDialog={handleOpenModuleDialog}
            editMode={editMode}
          />

          {/* 統合ダッシュボードヘッダー */}
          {IntegratedDashboardHeader}

          {/* 学習分析セクション */}
          <DashboardSection title="学習進捗分析">
            <Grid container spacing={3}>
              <Grid item xs={12} md={dashboardData?.radarChartData?.length > 0 ? 7 : 12}>
                <NotionStyleCard title="科目別進捗状況">
                  <Box sx={{ height: 300, mt: 2 }}>
                    {dashboardData && <NotionLearningAnalysis userId={dashboardData.userId} />}
                  </Box>
                </NotionStyleCard>
              </Grid>
              {dashboardData?.radarChartData?.length > 0 && (
                <Grid item xs={12} md={5}>
                  <NotionStyleCard title="レーダーチャート分析">
                    <ProgressRadarChart data={dashboardData.radarChartData} />
                  </NotionStyleCard>
                </Grid>
              )}
            </Grid>
          </DashboardSection>

          {/* ノルマと締切セクション */}
          <DashboardSection title="ノルマと締切">
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <NotionStyleCard title="学習ノルマ状況">
                  {dashboardData && <NotionNormaDisplay userId={dashboardData.userId} />}
                </NotionStyleCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <NotionStyleCard title="試験・レポート締切">
                  <ExternalCountdownContainer
                    exams={dashboardData?.exams || []}
                    reports={dashboardData?.reports || []}
                  />
                </NotionStyleCard>
              </Grid>
            </Grid>
          </DashboardSection>

          {/* モジュールのドラッグ&ドロップセクション */}
          <Droppable droppableId="modules">
            {(provided) => (
              <Box
                {...provided.droppableProps}
                ref={provided.innerRef}
                sx={{ minHeight: 200 }}
              >
                <DashboardSection title="カスタムモジュール" collapsible={true} defaultCollapsed={true}>
                  <Grid container spacing={3}>
                    {modules.map((id, index) => {
                      const moduleConfig = moduleSettings[id] || { enabled: true, collapsed: false };

                      // Notionモジュールタイプへのマッピングがあればそれをレンダリング
                      const notionModuleType = mapModuleIdToNotionType(id);
                      if (notionModuleType) {
                        return (
                          <Grid item xs={12} sm={6} md={4} key={id}>
                            <NotionModuleFactory
                              id={id}
                              type={notionModuleType}
                              dashboardData={dashboardData}
                              index={index}
                              onToggleVisibility={handleToggleVisibility}
                              onToggleCollapse={handleToggleCollapse}
                              isDraggingEnabled={editMode}
                              isFirst={index === 0}
                              isLast={index === modules.length - 1}
                            />
                          </Grid>
                        );
                      }

                      // マッピングがなければ通常のモジュールカードをレンダリング
                      const icon = DASHBOARD_MODULES[id]?.icon;
                      return (
                        <Grid item xs={12} sm={6} md={4} key={id}>
                          <NotionModuleCard
                            id={id}
                            index={index}
                            title={DASHBOARD_MODULES[id]?.title || '不明なモジュール'}
                            icon={icon ? React.createElement(icon) : null}
                            defaultCollapsed={moduleConfig?.collapsed}
                            onToggleCollapse={handleToggleCollapse}
                            onToggleVisibility={handleToggleVisibility}
                            isDraggingEnabled={editMode}
                            isFirst={index === 0}
                            isLast={index === modules.length - 1}
                          >
                            {renderModuleContent(id)}
                          </NotionModuleCard>
                        </Grid>
                      );
                    })}
                    {provided.placeholder}
                  </Grid>
                </DashboardSection>
              </Box>
            )}
          </Droppable>
        </Box>
      </DragDropContext>

      {/* 既存のダイアログコンポーネント */}
      <ModuleSelectDialog
        open={moduleDialogOpen}
        onClose={handleCloseModuleDialog}
        availableModules={availableModules}
        onAddModule={handleAddModule}
      />

      <NotionSettingsDialog
        open={settingsDialogOpen}
        onClose={handleCloseSettingsDialog}
        moduleSettings={moduleSettings}
        saveSettings={handleSaveSettings}
      />

      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Box>
  );
};

// モジュールIDからNotionモジュールタイプへのマッピング関数
const mapModuleIdToNotionType = (id: string): NotionModuleType | null => {
  // NotionModuleTypeの列挙値そのものであれば直接返す
  if (Object.values(NotionModuleType).includes(id as NotionModuleType)) {
    return id as NotionModuleType;
  }
  
  // 従来のDASHBOARD_MODULESからのIDをマッピング
  const moduleTypeMap: Record<string, NotionModuleType> = {
    'stats': NotionModuleType.STUDY_PROGRESS,
    'dailyQuota': NotionModuleType.DAILY_QUOTA,
    'exams': NotionModuleType.EXAM_COUNTDOWN,
    'reports': NotionModuleType.REPORT_DEADLINE,
    'learningAnalytics': NotionModuleType.LEARNING_ANALYSIS,
    'normaDisplay': NotionModuleType.WEEKLY_QUOTA,
  };
  
  return moduleTypeMap[id] || null;
};
