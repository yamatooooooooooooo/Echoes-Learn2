import React, { useState, ReactNode, useMemo } from 'react';
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
  Alert
} from '@mui/material';
import { 
  Settings as SettingsIcon,
  Save as SaveIcon,
  ViewModule as ViewModuleIcon,
  Tune as TuneIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { DraggableModuleCard } from '../../../components/common/DraggableModuleCard';
import { DASHBOARD_MODULES } from '../../../../config/dashboardModules';
import { DashboardData } from '../hooks/useDashboardData';
import { ModuleSettings } from '../hooks/useDashboardSettings';
import { useDashboardSettings } from '../hooks/useDashboardSettings';

// 各モジュールコンポーネントのインポート
import { StatsOverviewCard } from './StatsOverviewCard';
// import { DailyQuotaCard } from './DailyQuotaCard';
import { UpcomingExamsCard } from './UpcomingExamsCard';
import { RecentProgressCard } from './RecentProgressCard';
import { LearningAnalyticsCard } from './LearningAnalyticsCard';
import { DashboardSettingsDialog } from './DashboardSettingsDialog';
import { NotionStyleCard } from '../../../components/common/NotionStyleCard';

interface ModularDashboardProps {
  formatDate: (date: Date | string | undefined) => string;
  dashboardData: DashboardData;
  isLoading: boolean;
}

/**
 * ドラッグ＆ドロップでカスタマイズ可能なモジュラーダッシュボード
 */
export const ModularDashboard: React.FC<ModularDashboardProps> = ({
  formatDate,
  dashboardData,
  isLoading
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
    resetToDefaults
  } = useDashboardSettings();
  
  // DASHBOARD_MODULESのメモ化インスタンスを作成
  const dashboardModules = useMemo(() => DASHBOARD_MODULES, []);
  
  // アイコンをReactNodeとして安全に変換する関数
  const getModuleIcon = useMemo(() => {
    return (moduleId: string): ReactNode => {
      const module = dashboardModules[moduleId];
      if (!module) return null;
      const IconComponent = module.icon;
      return IconComponent ? <IconComponent /> : null;
    };
  }, [dashboardModules]);
  
  // 設定メニューの状態
  const [settingsMenuAnchorEl, setSettingsMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  
  // 編集モードの状態
  const [editMode, setEditMode] = useState(false);
  
  // 設定メニューを開く
  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsMenuAnchorEl(event.currentTarget);
  };
  
  // 設定メニューを閉じる
  const handleSettingsClose = () => {
    setSettingsMenuAnchorEl(null);
  };
  
  // 設定ダイアログを開く
  const handleOpenSettingsDialog = () => {
    setSettingsDialogOpen(true);
    handleSettingsClose();
  };
  
  // 編集モードを切り替える
  const toggleEditMode = () => {
    setEditMode(!editMode);
    handleSettingsClose();
  };
  
  // 設定を保存する
  const handleSaveSettings = () => {
    saveSettings();
    setEditMode(false);
    handleSettingsClose();
  };

  // モジュールをレンダリングする
  const renderModule = (moduleId: string) => {
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
        // エラー回避のためにQuotaCardを一時的に無効化
        return (
          <NotionStyleCard title="今日のノルマ">
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                現在メンテナンス中です
              </Typography>
            </Box>
          </NotionStyleCard>
        );
      case 'exams':
        return (
          <UpcomingExamsCard
            subjects={dashboardData.subjects || []}
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
          <LearningAnalyticsCard
            studySessions={dashboardData.studySessions}
            subjectPerformances={dashboardData.subjectPerformances}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  // ドラッグ＆ドロップの処理
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    updateModulesOrder(result.source.index, result.destination.index);
  };

  // 有効なモジュールを取得
  const enabledModules = Object.entries(moduleSettings)
    .filter(([_, settings]) => settings.enabled)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([moduleId]) => moduleId);

  return (
    <Box sx={{ 
      width: '100%',
      maxWidth: '1200px',
      mx: 'auto',
      p: { xs: 1, sm: 2 }
    }}>
      {/* 設定アクション */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        mb: 2,
        position: 'relative',
        zIndex: 1
      }}>
        <Tooltip title="ダッシュボード設定">
          <IconButton
            onClick={handleSettingsClick}
            size="small"
            sx={{ 
              backgroundColor: '#f5f5f5',
              '&:hover': { backgroundColor: '#e0e0e0' } 
            }}
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* 編集モード表示 */}
      {editMode && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 2, 
          p: 1, 
          bgcolor: '#e3f2fd', 
          borderRadius: 1,
          alignItems: 'center' 
        }}>
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#0277bd', mr: 1 }}>
            編集モード: モジュールをドラッグして並べ替えできます
          </Typography>
          <Fab 
            size="small" 
            color="primary" 
            onClick={handleSaveSettings} 
            disabled={isSaving}
            sx={{ ml: 1, minWidth: 40, boxShadow: 'none' }}
          >
            <SaveIcon fontSize="small" />
          </Fab>
        </Box>
      )}
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard-modules">
          {(provided) => (
            <Box
              {...provided.droppableProps}
              ref={provided.innerRef}
              sx={{ width: '100%' }}
            >
              <Grid container spacing={3} justifyContent="center">
                {enabledModules.map((moduleId: string, index: number) => (
                  <Grid 
                    item 
                    xs={12} 
                    sm={moduleId === 'learningAnalytics' ? 12 : 6}
                    md={moduleId === 'learningAnalytics' ? 12 : 6}
                    lg={moduleId === 'learningAnalytics' ? 12 : 4}
                    key={moduleId}
                  >
                    <DraggableModuleCard
                      id={moduleId}
                      index={index}
                      title={dashboardModules[moduleId]?.title || ''}
                      icon={getModuleIcon(moduleId)}
                      defaultCollapsed={moduleSettings[moduleId]?.collapsed || false}
                      onToggleCollapse={() => toggleModuleCollapsed(moduleId)}
                      onToggleVisibility={() => toggleModuleEnabled(moduleId)}
                      isDraggingEnabled={editMode}
                    >
                      {renderModule(moduleId)}
                    </DraggableModuleCard>
                  </Grid>
                ))}
                {provided.placeholder}
              </Grid>
            </Box>
          )}
        </Droppable>
      </DragDropContext>
      
      {/* 設定メニュー */}
      <Menu
        anchorEl={settingsMenuAnchorEl}
        open={Boolean(settingsMenuAnchorEl)}
        onClose={handleSettingsClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={toggleEditMode}>
          <ListItemIcon>
            <ViewModuleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={editMode ? "編集モードを終了" : "モジュールを編集"} />
        </MenuItem>
        <MenuItem onClick={handleOpenSettingsDialog}>
          <ListItemIcon>
            <TuneIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="ダッシュボード設定" />
        </MenuItem>
      </Menu>
      
      {/* 設定ダイアログ */}
      <DashboardSettingsDialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
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
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 