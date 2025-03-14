import React, { useState, ReactNode, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Grid,
  Fab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  ViewModule as ViewModuleIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { DraggableModuleCard } from '../../../components/common/DraggableModuleCard';
import { DASHBOARD_MODULES } from '../../../../config/dashboardModules';
import { DashboardData } from '../../../../domain/entities/Dashboard';
import { ModuleSettings } from '../hooks/useDashboardSettings';
import { useDashboardSettings } from '../hooks/useDashboardSettings';

// 各モジュールコンポーネントのインポート
import { StatsOverviewCard } from './StatsOverviewCard';
import { SimpleDailyQuotaCard } from './SimpleDailyQuotaCard';
import { UpcomingExamsCard } from './UpcomingExamsCard';
import { RecentProgressCard } from './RecentProgressCard';
import { LearningAnalyticsCard } from './LearningAnalyticsCard';
import { DashboardSettingsDialog } from './DashboardSettingsDialog';
import { NotionStyleCard } from '../../../components/common/NotionStyleCard';
import CountdownContainer from './CountdownContainer';
import LearningAnalysis from '../../../../components/LearningAnalysis';
import NormaDisplay from '../../../../components/NormaDisplay';

interface ModularDashboardProps {
  formatDate: (date: Date | string | undefined) => string;
  dashboardData: {
    totalSubjects: number;
    completedSubjects: number;
    totalPages: number;
    completedPages: number;
    inProgressSubjects: number;
    notStartedSubjects: number;
    weeklyProgressData: any[];
    subjects: any[];
    recentProgress: any[];
    studySessions: any[];
    subjectPerformances: any[];
    exams?: any[];
    reports?: any[];
  };
  isLoading: boolean;
  error: string | null;
  refreshData: () => void;
}

// 設定メニューをメモ化されたコンポーネントとして分離
const SettingsMenu = React.memo(
  ({
    anchorEl,
    onClose,
    onToggleEditMode,
    onOpenSettingsDialog,
    editMode,
  }: {
    anchorEl: HTMLElement | null;
    onClose: () => void;
    onToggleEditMode: () => void;
    onOpenSettingsDialog: () => void;
    editMode: boolean;
  }) => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      PaperProps={{
        elevation: 3,
        sx: {
          borderRadius: 2,
          minWidth: 200,
        },
      }}
    >
      <MenuItem onClick={onToggleEditMode} sx={{ py: 1.5 }}>
        <ListItemIcon>
          <ViewModuleIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary={editMode ? '編集モードを終了' : 'モジュールを編集'}
          primaryTypographyProps={{ fontSize: '0.95rem' }}
        />
      </MenuItem>
      <MenuItem onClick={onOpenSettingsDialog} sx={{ py: 1.5 }}>
        <ListItemIcon>
          <TuneIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary="ダッシュボード設定"
          primaryTypographyProps={{ fontSize: '0.95rem' }}
        />
      </MenuItem>
    </Menu>
  )
);

SettingsMenu.displayName = 'SettingsMenu';

// 編集モードバナーをメモ化されたコンポーネントとして分離
const EditModeBanner = React.memo(
  ({ onSave, isSaving }: { onSave: () => void; isSaving: boolean }) => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        mb: { xs: 2, sm: 3 },
        p: { xs: 1, sm: 2 },
        bgcolor: '#e3f2fd',
        borderRadius: 2,
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          color: '#0277bd',
          mr: 1,
          fontSize: { xs: '0.8rem', sm: '0.875rem' },
        }}
      >
        編集モード: モジュールをドラッグして並べ替えできます
      </Typography>
      <Fab
        size="small"
        color="primary"
        onClick={onSave}
        disabled={isSaving}
        sx={{ ml: 1, minWidth: 40, boxShadow: 'none' }}
      >
        <SaveIcon fontSize="small" />
      </Fab>
    </Box>
  )
);

EditModeBanner.displayName = 'EditModeBanner';

/**
 * パフォーマンス最適化されたモジュラーダッシュボード
 * - メモ化による再レンダリングの最小化
 * - 小さなコンポーネントへの分割
 * - useCallbackの活用
 */
export const ModularDashboard: React.FC<ModularDashboardProps> = ({
  formatDate,
  dashboardData,
  isLoading,
  error,
  refreshData,
}) => {
  // ダッシュボード設定フックを使用
  const {
    moduleSettings,
    isSaving,
    snackbarOpen,
    snackbarMessage,
    setSnackbarOpen,
    saveSettings,
    toggleModuleEnabled,
    toggleModuleCollapsed,
    updateModulesOrder,
    resetToDefaults,
  } = useDashboardSettings();

  // DASHBOARD_MODULESのメモ化インスタンスを作成
  const dashboardModules = useMemo(() => DASHBOARD_MODULES, []);

  // アイコンをReactNodeとして安全に変換する関数
  const getModuleIcon = useCallback(
    (moduleId: string): ReactNode => {
      const module = dashboardModules[moduleId];
      if (!module) return null;
      const IconComponent = module.icon;
      return IconComponent ? <IconComponent /> : null;
    },
    [dashboardModules]
  );

  // 設定メニューの状態
  const [settingsMenuAnchorEl, setSettingsMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  // 編集モードの状態
  const [editMode, setEditMode] = useState(false);

  // 設定メニューを開く
  const handleSettingsClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setSettingsMenuAnchorEl(event.currentTarget);
  }, []);

  // 設定メニューを閉じる
  const handleSettingsClose = useCallback(() => {
    setSettingsMenuAnchorEl(null);
  }, []);

  // 設定ダイアログを開く
  const handleOpenSettingsDialog = useCallback(() => {
    setSettingsDialogOpen(true);
    handleSettingsClose();
  }, [handleSettingsClose]);

  // 編集モードを切り替える
  const toggleEditMode = useCallback(() => {
    setEditMode((prevMode) => !prevMode);
    handleSettingsClose();
  }, [handleSettingsClose]);

  // 設定を保存する
  const handleSaveSettings = useCallback(() => {
    saveSettings();
    setEditMode(false);
    handleSettingsClose();
  }, [saveSettings, handleSettingsClose]);

  // モジュールをレンダリングする
  const renderModule = useCallback(
    (moduleId: string) => {
      switch (moduleId) {
        case 'stats':
          return (
            <StatsOverviewCard
              totalSubjects={dashboardData.totalSubjects}
              completedSubjects={dashboardData.completedSubjects}
              totalPages={dashboardData.totalPages}
              completedPages={dashboardData.completedPages}
              inProgressSubjects={dashboardData.inProgressSubjects}
              notStartedSubjects={dashboardData.notStartedSubjects}
              weeklyProgressData={dashboardData.weeklyProgressData}
              isLoading={isLoading}
            />
          );
        case 'dailyQuota':
          return (
            <SimpleDailyQuotaCard subjects={dashboardData.subjects || []} isLoading={isLoading} />
          );
        case 'normaDisplay':
          return <NormaDisplay userId={dashboardData?.subjects?.[0]?.userId || ''} />;
        case 'exams':
          return (
            <CountdownContainer
              title="試験日カウントダウン"
              subjects={dashboardData.subjects}
              includeReportDeadlines={false}
              exams={dashboardData.exams || []}
              reports={[]}
            />
          );
        case 'reports':
          return (
            <CountdownContainer
              title="レポート締切カウントダウン"
              subjects={dashboardData.subjects}
              includeReportDeadlines={true}
              exams={[]}
              reports={dashboardData.reports || []}
            />
          );
        case 'recentProgress':
          return (
            <RecentProgressCard
              recentProgress={dashboardData.recentProgress}
              formatDate={formatDate}
              isLoading={isLoading}
            />
          );
        case 'learningAnalytics':
          return (
            <>
              <LearningAnalysis />
            </>
          );
        default:
          return null;
      }
    },
    [dashboardData, formatDate, isLoading]
  );

  // ドラッグ＆ドロップの処理
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;
      updateModulesOrder(result.source.index, result.destination.index);
    },
    [updateModulesOrder]
  );

  // 有効なモジュールを取得
  const enabledModules = useMemo(
    () =>
      Object.entries(moduleSettings)
        .filter(([_, settings]) => settings.enabled)
        .sort((a, b) => a[1].order - b[1].order)
        .map(([moduleId]) => moduleId),
    [moduleSettings]
  );

  // メインコンテナのスタイルをメモ化
  const containerStyle = useMemo(
    () => ({
      width: '100%',
      maxWidth: '1400px',
      mx: 'auto',
      p: { xs: 1, sm: 2, md: 3 },
    }),
    []
  );

  // 設定アクションのスタイルをメモ化
  const settingsButtonStyle = useMemo(
    () => ({
      display: 'flex',
      justifyContent: 'flex-end',
      mb: { xs: 2, sm: 3 },
      position: 'relative',
      zIndex: 1,
    }),
    []
  );

  // 設定ボタンのスタイルをメモ化
  const iconButtonStyle = useMemo(
    () => ({
      backgroundColor: '#f5f5f5',
      '&:hover': { backgroundColor: '#e0e0e0' },
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    }),
    []
  );

  // スナックバーを閉じる
  const handleCloseSnackbar = useCallback(() => {
    setSnackbarOpen(false);
  }, [setSnackbarOpen]);

  // 設定ダイアログを閉じる
  const handleCloseSettingsDialog = useCallback(() => {
    setSettingsDialogOpen(false);
  }, []);

  return (
    <Box sx={containerStyle}>
      {/* 設定アクション */}
      <Box sx={settingsButtonStyle}>
        <Tooltip title="ダッシュボード設定">
          <IconButton onClick={handleSettingsClick} size="small" sx={iconButtonStyle}>
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 編集モード表示 */}
      {editMode && <EditModeBanner onSave={handleSaveSettings} isSaving={isSaving} />}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard-modules">
          {(provided) => (
            <Box {...provided.droppableProps} ref={provided.innerRef} sx={{ width: '100%' }}>
              <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent="flex-start">
                {enabledModules.map((moduleId: string, index: number) => {
                  // モジュールのサイズを動的に決定
                  let gridSize = {
                    xs: 12,
                    sm: 6,
                    md: 4,
                  };

                  // 学習分析は常にフル幅
                  if (moduleId === 'learningAnalytics') {
                    gridSize = { xs: 12, sm: 12, md: 12 };
                  }

                  // 最近の学習進捗は中サイズのデバイスでも大きく表示
                  if (moduleId === 'recentProgress') {
                    gridSize = { xs: 12, sm: 12, md: 8 };
                  }

                  // 学習統計も少し大きめに
                  if (moduleId === 'stats') {
                    gridSize = { xs: 12, sm: 6, md: 6 };
                  }

                  // ノルマ表示も大きめに
                  if (moduleId === 'normaDisplay') {
                    gridSize = { xs: 12, sm: 12, md: 8 };
                  }

                  return (
                    <Grid item xs={gridSize.xs} sm={gridSize.sm} md={gridSize.md} key={moduleId}>
                      <DraggableModuleCard
                        id={moduleId}
                        index={index}
                        title={dashboardModules[moduleId]?.title || ''}
                        icon={getModuleIcon(moduleId)}
                        defaultCollapsed={moduleSettings[moduleId]?.collapsed || false}
                        onToggleCollapse={(id, isCollapsed) =>
                          toggleModuleCollapsed(id, isCollapsed)
                        }
                        onToggleVisibility={() => toggleModuleEnabled(moduleId)}
                        isDraggingEnabled={editMode}
                        canHide={dashboardModules[moduleId]?.canDisable || false}
                        isFirst={index === 0}
                        isLast={index === enabledModules.length - 1}
                      >
                        {renderModule(moduleId)}
                      </DraggableModuleCard>
                    </Grid>
                  );
                })}
                {provided.placeholder}
              </Grid>
            </Box>
          )}
        </Droppable>
      </DragDropContext>

      {/* 設定メニュー */}
      <SettingsMenu
        anchorEl={settingsMenuAnchorEl}
        onClose={handleSettingsClose}
        onToggleEditMode={toggleEditMode}
        onOpenSettingsDialog={handleOpenSettingsDialog}
        editMode={editMode}
      />

      {/* 設定ダイアログ */}
      <DashboardSettingsDialog
        open={settingsDialogOpen}
        onClose={handleCloseSettingsDialog}
        moduleSettings={moduleSettings}
        toggleModuleEnabled={toggleModuleEnabled}
        resetToDefaults={resetToDefaults}
        saveSettings={saveSettings}
        isSaving={isSaving}
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
          sx={{ width: '100%', boxShadow: 3, borderRadius: 2 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
