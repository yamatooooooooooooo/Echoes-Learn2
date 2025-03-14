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
import { useDashboardSettings } from '../hooks/useDashboardSettings';

/**
 * ダッシュボード画面コンポーネント
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

  // 読み込み中の場合はローディングインジケータを表示
  if (isLoading) {
    return (
      <Box sx={{ 
        p: { xs: 2, sm: 3, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh'
      }}>
        <CircularProgress size={isMobile ? 40 : 60} thickness={4} sx={{ mb: 3 }} />
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          sx={{ 
            mb: 2,
            fontWeight: 500,
            textAlign: 'center',
            color: theme.palette.text.primary
          }}
        >
          ダッシュボードを読み込み中...
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ textAlign: 'center', maxWidth: '500px', mx: 'auto' }}
        >
          学習データを集計しています。しばらくお待ちください。
        </Typography>
      </Box>
    );
  }

  // エラーがある場合はエラーメッセージを表示
  if (error) {
    return (
      <Box sx={{ 
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: '800px',
        mx: 'auto'
      }}>
        <Alert 
          severity="error" 
          variant="filled"
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            boxShadow: theme.shadows[3] 
          }}
        >
          <AlertTitle>エラーが発生しました</AlertTitle>
          データの読み込み中に問題が発生しました。
        </Alert>
        
        <Paper 
          elevation={1} 
          sx={{ 
            p: 3, 
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2,
              color: theme.palette.error.main,
              fontWeight: 500
            }}
          >
            エラーの詳細:
          </Typography>
          <Typography 
            variant="body2" 
            component="div" 
            sx={{ 
              p: 2, 
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              borderRadius: 1,
              fontFamily: 'monospace',
              overflowX: 'auto'
            }}
          >
            {error}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mt: 3 }}
          >
            ページを再読み込みするか、しばらくしてからアクセスしてください。問題が解決しない場合は管理者にお問い合わせください。
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      overflowX: 'hidden',
      minHeight: '100vh',
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(18, 18, 18, 1)' : 'rgba(245, 245, 245, 1)',
      pb: 4
    }}>
      <Box sx={{ 
        maxWidth: 1200, 
        mx: 'auto', 
        px: isMobile ? 2 : 3, 
        pt: 3, 
        pb: 6,
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          px: 1
        }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              fontSize: { xs: '1.75rem', sm: '2.25rem' },
              fontWeight: 600,
              color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.87)'
            }}
          >
            <DashboardIcon sx={{ mr: 1 }} />
            ダッシュボード
          </Typography>
          
          <Box>
            <Tooltip title="表示設定">
              <IconButton 
                onClick={handleOpenMenu}
                sx={{
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                  }
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  mt: 1,
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0 4px 20px rgba(0, 0, 0, 0.5)' 
                    : '0 2px 10px rgba(0, 0, 0, 0.1)',
                  border: '1px solid',
                  borderColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.05)',
                }
              }}
            >
              <MenuItem onClick={handleOpenSettingsDialog}>
                <ListItemIcon>
                  <VisibilityIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>カード表示設定</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        
        {/* モジュラーダッシュボード */}
        <ModularDashboard
          dashboardData={dashboardData || {
            totalSubjects: 0,
            completedSubjects: 0,
            totalPages: 0,
            completedPages: 0,
            inProgressSubjects: 0,
            notStartedSubjects: 0,
            weeklyProgressData: [],
            subjects: [],
            recentProgress: [],
            studySessions: [],
            subjectPerformances: []
          }}
          formatDate={formatDate}
          refreshData={refreshData}
          isLoading={isLoading}
          error={error}
        />
      </Box>
    </Box>
  );
};

export default DashboardScreen;