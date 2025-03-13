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
      // グローバルwindowのスクロールをリセット
      window.scrollTo({
        top: 0,
        behavior: 'auto'
      });
      
      // 明示的に0にリセット
      window.scrollY = 0;
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      
      // ダッシュボードのコンテナ要素をトップにスクロール
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
        
        // モバイルデバイスでの追加調整
        const dashboardContainer = document.getElementById('dashboard-root-container');
        if (dashboardContainer) {
          dashboardContainer.scrollTop = 0;
          dashboardContainer.scrollIntoView({ 
            behavior: 'auto', 
            block: 'start',
            inline: 'start'
          });
          
          // iOS Safariに対する特別な調整
          setTimeout(() => {
            window.scrollTo({
              top: 0,
              behavior: 'auto'
            });
            dashboardContainer.scrollTop = 0;
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
            
            // さらに追加の調整を行う
            setTimeout(() => {
              window.scrollTo({
                top: 0,
                behavior: 'auto'
              });
              document.body.scrollTop = 0;
              document.documentElement.scrollTop = 0;
            }, 200);
          }, 300);
        }
      }
    };
    
    // 初回レンダリング時にスクロール
    scrollToTop();
    
    // 複数のタイムアウトで確実にスクロール位置を調整
    const timeoutId = setTimeout(scrollToTop, 150);
    const secondTimeoutId = setTimeout(scrollToTop, 500);
    const thirdTimeoutId = setTimeout(scrollToTop, 1000);
    const finalTimeoutId = setTimeout(scrollToTop, 2000); // より長いタイムアウトも追加
    
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(secondTimeoutId);
      clearTimeout(thirdTimeoutId);
      clearTimeout(finalTimeoutId);
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
        p: { xs: 1, sm: 2, md: 3 },
        pt: { xs: 20, sm: 20, md: 20 }, // 上部のパディングを大幅に増やす
        pb: { xs: 8, sm: 6 }, // 下部にスペースを追加してスクロールを確保
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: 'auto', // 高さを自動に設定し、コンテンツに合わせて伸縮
        minHeight: isMobile ? '100%' : '100vh',
        backgroundColor: 'background.default',
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch', // iOS向けスムーススクロール
        overflowY: 'visible', // 下部が見切れないように修正
        overflowX: 'hidden',
        ...(isMobile && {
          paddingTop: 60, // モバイルでの上部スペースをさらに大幅に確保
          paddingBottom: 200, // モバイルでの下部スペースをさらに増やす
        })
      }}
    >
      {/* ヘッダー部分 - 固定表示 */}
      <Box 
        sx={{ 
          width: '100%',
          mb: { xs: 2, sm: 3 },
          position: 'relative', // sticky から relative に変更してトップ固定を解除
          zIndex: 10,
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(18, 18, 18, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderRadius: 2,
          boxShadow: 1,
          py: 1,
          marginTop: { xs: 4, sm: 4, md: 4 } // 上部にマージンを追加
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