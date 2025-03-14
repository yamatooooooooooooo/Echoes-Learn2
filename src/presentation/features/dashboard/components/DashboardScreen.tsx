import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Alert,
  AlertTitle,
  useTheme,
  useMediaQuery,
  Grid,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useDashboardData } from '../hooks/useDashboardData';
import { useAuth } from '../../../../contexts/AuthContext';
import { ModularDashboard } from './ModularDashboard';
import { NotionDashboard } from './NotionDashboard';
import { useDashboardSettings } from '../hooks/useDashboardSettings';

/**
 * ダッシュボード画面コンポーネント
 * Notion風UIに最適化されたレイアウト
 */
const DashboardScreen: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser } = useAuth();
  const { dashboardData, isLoading, error, formatDate, refreshData } = useDashboardData();
  const { settings, toggleCard } = useDashboardSettings();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenSettingsDialog = () => {
    handleCloseMenu();
    setSettingsDialogOpen(true);
  };
  
  const handleCloseSettingsDialog = () => {
    setSettingsDialogOpen(false);
  };

  // エラー表示
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
          <AlertTitle>エラーが発生しました</AlertTitle>
          {error}
        </Alert>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <DashboardIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            ダッシュボードデータの読み込み中にエラーが発生しました。
          </Typography>
        </Box>
      </Box>
    );
  }

  // ローディング表示
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
        }}
      >
        <CircularProgress size={48} thickness={4} sx={{ mb: 3 }} />
        <Typography variant="body1" color="text.secondary">
          ダッシュボードを読み込み中...
        </Typography>
      </Box>
    );
  }

  // ユーザーデータがない場合
  if (!currentUser) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" variant="outlined">
          <AlertTitle>ログインが必要です</AlertTitle>
          ダッシュボードを表示するにはログインしてください。
        </Alert>
      </Box>
    );
  }

  // メインのダッシュボード表示
  return (
    <Box 
      sx={{ 
        width: '100%', 
        minHeight: '100vh',
        backgroundColor: '#f9f9fa' 
      }}
    >
      <NotionDashboard 
        formatDate={formatDate}
        dashboardData={dashboardData}
        isLoading={isLoading}
        error={error}
        refreshData={refreshData}
      />
    </Box>
  );
};

export default DashboardScreen;