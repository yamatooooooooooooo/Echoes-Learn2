import React, { useEffect, useRef, useState } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Grid, 
  Paper,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Button
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Refresh as RefreshIcon,
  Update as UpdateIcon
} from '@mui/icons-material';
import { SimpleDailyQuotaCard } from './SimpleDailyQuotaCard';
import { SimpleWeeklyQuotaCard } from './SimpleWeeklyQuotaCard';
import { SimpleProgressBarCard } from './SimpleProgressBarCard';
import { RecentProgressCard } from './RecentProgressCard';
import { UpcomingExamsCard } from './UpcomingExamsCard';
import { DeadlinesCard } from './DeadlinesCard';
import { useDashboardData } from '../hooks/useDashboardData';
import { useAuth } from '../../../../contexts/AuthContext';
import DataCleanupButton from '../../../components/common/DataCleanupButton';
import { useDashboardState } from '../hooks/useDashboardState';
import { useDashboardSettings } from '../hooks/useDashboardSettings';
import { ModuleVisibility } from '../../../../domain/models/UserSettingsModel';
import { LoadingScreen } from '../../../components/LoadingScreen';
import { ErrorScreen } from '../../../components/ErrorScreen';

/**
 * ダッシュボード画面 - モダンデザイン
 * 学習進捗と予定を視覚的に表示
 */
const DashboardScreen: React.FC = () => {
  const { dashboardData, isLoading, error, formatDate, refreshData } = useDashboardData();
  const { currentUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const containerRef = useRef<HTMLDivElement>(null);
  const { dashboardState, isLoading: dashboardStateLoading, error: dashboardStateError, handleRefresh } = useDashboardState();
  const { settings, isVisibleModule } = useDashboardSettings();
  const [refreshing, setRefreshing] = useState(false);
  
  // マウント時に最上部にスクロール
  useEffect(() => {
    const scrollToTop = () => {
      try {
        // シンプルなスクロールリセット - 一つだけの方法を使用
        window.scrollTo(0, 0);
        
        // モバイルの場合のみ、遅延して再度スクロール位置を確認
        if (isMobile) {
          setTimeout(() => {
            window.scrollTo(0, 0);
          }, 300);
        }
      } catch (error) {
        console.error('スクロール処理中にエラーが発生しました:', error);
      }
    };
    
    // 初回レンダリング時に実行
    scrollToTop();
    
    // 一度だけ遅延実行
    const timeoutId = setTimeout(scrollToTop, 300);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isMobile]);
  
  // 手動更新
  const handleRefreshWithLoading = async () => {
    setRefreshing(true);
    await handleRefresh();
    setRefreshing(false);
  };
  
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={40} thickness={4} />
        <Typography variant="body2" color="text.secondary">
          学習データを読み込み中...
        </Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!currentUser) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">
          ログインしてください。
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box 
      id="dashboard-root-container"
      ref={containerRef}
      sx={{ 
        width: '100%', 
        maxWidth: { xs: '100%', sm: '95%', md: '1400px' },
        mx: 'auto', 
        p: { xs: 2, sm: 3, md: 4 },
        pt: { xs: 2, sm: 3, md: 4 }, // パディングを適正化
        pb: { xs: 6, sm: 6, md: 6 }, // パディングを適正化
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: 'auto',
        backgroundColor: 'background.default',
        overflow: 'visible', // スクロールを無効化
        WebkitOverflowScrolling: 'touch',
        marginTop: { xs: 2, sm: 3, md: 4 }, // マージンを適正化
        ...(isMobile && {
          paddingTop: 3, // モバイルでのパディングを調整
          paddingBottom: 20,
          marginTop: 2 // モバイルでのマージンを調整
        })
      }}
    >
      {/* ヘッダー部分 */}
      <Box 
        sx={{ 
          width: '100%',
          mb: { xs: 3, sm: 3, md: 3 }, // マージンを統一
          position: 'relative',
          zIndex: 10,
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(18, 18, 18, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderRadius: 2,
          boxShadow: 1,
          py: 1.5, // パディングを調整
          px: { xs: 2, sm: 2, md: 2 }, // パディングを統一
          marginTop: { xs: 2, sm: 2, md: 2 }, // マージンを適正化
          border: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* ダッシュボードヘッダー */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, sm: 2.5 }, 
            borderRadius: 3,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.7)' : 'rgba(255, 255, 255, 0.8)',
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
            backdropFilter: 'blur(10px)',
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 4px 20px rgba(0, 0, 0, 0.25)' 
              : '0 4px 20px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DashboardIcon 
                sx={{ 
                  mr: 1.5, 
                  color: 'primary.main',
                  fontSize: { xs: '1.8rem', sm: '2rem' }
                }} 
              />
              <Box>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: '1.5rem', sm: '1.8rem' },
                    background: theme.palette.mode === 'dark' 
                      ? 'linear-gradient(to right, #9c27b0, #3f51b5)'
                      : 'linear-gradient(to right, #2E77EE, #1a237e)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textFillColor: 'transparent'
                  }}
                >
                  ダッシュボード
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {dashboardData && dashboardData.subjects && dashboardData.subjects.length > 0 
                    ? `${dashboardData.subjects.length}科目の進捗状況と学習計画を確認できます` 
                    : '科目を追加して学習を始めましょう'}
                </Typography>
              </Box>
            </Box>
            
            <Tooltip title="データを更新">
              <IconButton 
                onClick={handleRefreshWithLoading} 
                size="small"
                sx={{
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                  }
                }}
              >
                {refreshing ? <CircularProgress size={24} color="inherit" /> : <UpdateIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
      </Box>
      
      {/* メインコンテンツエリア */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          width: '100%',
          pb: 4,
          mt: 2,
        }}
      >
        {/* カードコンテナ - 縦に並ぶように並び替え */}
        <Grid container direction="column" spacing={isMobile ? 2 : 3} sx={{ mb: 2 }}>
          {/* 試験スケジュールカード - 必ず縦に配置されるように修正 */}
          <Grid item>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backdropFilter: 'blur(10px)',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.7)' : 'rgba(255, 255, 255, 0.8)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0 8px 24px rgba(0, 0, 0, 0.3)' 
                    : '0 8px 24px rgba(0, 0, 0, 0.08)'
                }
              }}
            >
              <UpcomingExamsCard subjects={dashboardData?.subjects || []} />
            </Paper>
          </Grid>
          
          {/* レポート締切カード - 必ず縦に配置されるように修正 */}
          <Grid item>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backdropFilter: 'blur(10px)',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.7)' : 'rgba(255, 255, 255, 0.8)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0 8px 24px rgba(0, 0, 0, 0.3)' 
                    : '0 8px 24px rgba(0, 0, 0, 0.08)'
                }
              }}
            >
              <DeadlinesCard subjects={dashboardData?.subjects || []} />
            </Paper>
          </Grid>
          
          {/* ノルマカードのコンテナ */}
          <Grid item>
            <Grid container spacing={isMobile ? 2 : 3}>
              {/* 今日のノルマ */}
              <Grid item xs={12} md={6}>
                <SimpleDailyQuotaCard 
                  subjects={dashboardData?.subjects || []} 
                  isLoading={isLoading}
                />
              </Grid>
              
              {/* 今週のノルマ */}
              <Grid item xs={12} md={6}>
                <SimpleWeeklyQuotaCard 
                  subjects={dashboardData?.subjects || []} 
                  isLoading={isLoading}
                />
              </Grid>
            </Grid>
          </Grid>
          
          {/* 進捗バー */}
          <Grid item>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                backdropFilter: 'blur(10px)',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.7)' : 'rgba(255, 255, 255, 0.8)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0 8px 24px rgba(0, 0, 0, 0.3)' 
                    : '0 8px 24px rgba(0, 0, 0, 0.08)'
                }
              }}
            >
              <SimpleProgressBarCard 
                subjects={dashboardData?.subjects || []} 
                isLoading={isLoading}
              />
            </Paper>
          </Grid>
          
          {/* 最近の進捗 */}
          {dashboardData && dashboardData.recentProgress && dashboardData.recentProgress.length > 0 && (
            <Grid item>
              <Paper 
                elevation={0} 
                sx={{ 
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backdropFilter: 'blur(10px)',
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.7)' : 'rgba(255, 255, 255, 0.8)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.palette.mode === 'dark' 
                      ? '0 8px 24px rgba(0, 0, 0, 0.3)' 
                      : '0 8px 24px rgba(0, 0, 0, 0.08)'
                  }
                }}
              >
                <RecentProgressCard 
                  recentProgress={dashboardData.recentProgress} 
                  formatDate={formatDate}
                  isLoading={isLoading}
                />
              </Paper>
            </Grid>
          )}
        </Grid>
        
        {/* データクリーンアップボタン */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          mt: 3,
          mb: 2,
          width: '100%'
        }}>
          <DataCleanupButton size="small" />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardScreen; 