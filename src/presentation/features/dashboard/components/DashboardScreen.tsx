import React from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Grid, 
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import SimpleDailyQuotaCard from './SimpleDailyQuotaCard';
import SimpleWeeklyQuotaCard from './SimpleWeeklyQuotaCard';
import SimpleProgressBarCard from './SimpleProgressBarCard';
import { RecentProgressCard } from './RecentProgressCard';
import { UpcomingExamsCard } from './UpcomingExamsCard';
import { useDashboardData } from '../hooks/useDashboardData';
import { useAuth } from '../../../../contexts/AuthContext';
import DataCleanupButton from '../../../components/common/DataCleanupButton';

/**
 * ダッシュボード画面 - Notion風デザイン
 * Firebaseから実際のデータを取得して表示
 */
const DashboardScreen: React.FC = () => {
  const { dashboardData, isLoading, error, formatDate, refreshData } = useDashboardData();
  const { currentUser } = useAuth();
  
  // 手動更新
  const handleRefresh = () => {
    if (refreshData) {
      refreshData();
    }
  };
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
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
      sx={{ 
        width: '100%', 
        maxWidth: { xs: '100%', sm: '92%', md: '1400px' },
        mx: 'auto', 
        p: { xs: 1, sm: 2, md: 3 },
        pt: { xs: 2, sm: 3, md: 4 },
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      {/* ヘッダー部分 - 固定表示 */}
      <Box sx={{ flexShrink: 0, mb: { xs: 2, sm: 3 } }}>
        {/* ダッシュボードヘッダー */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 1.5, sm: 2 }, 
            borderRadius: 2,
            bgcolor: 'white',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DashboardIcon 
                sx={{ 
                  mr: 1.5, 
                  color: 'primary.main',
                  fontSize: '2rem'
                }} 
              />
              <Box>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: '1.5rem', sm: '1.8rem' }
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
              <IconButton onClick={handleRefresh} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
      </Box>
      
      {/* スクロール可能なコンテンツエリア */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflow: 'auto', 
          pb: 2 
        }}
      >
        {/* 試験スケジュールカード */}
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider' 
            }}
          >
            <UpcomingExamsCard subjects={dashboardData?.subjects || []} />
          </Paper>
        </Box>
        
        {/* ノルマカード */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 2,
                height: '100%',
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider' 
              }}
            >
              <SimpleDailyQuotaCard 
                subjects={dashboardData?.subjects || []} 
                isLoading={isLoading} 
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 2,
                height: '100%',
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider' 
              }}
            >
              <SimpleWeeklyQuotaCard 
                subjects={dashboardData?.subjects || []} 
                isLoading={isLoading} 
              />
            </Paper>
          </Grid>
        </Grid>
        
        {/* 進捗バー */}
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider' 
            }}
          >
            <SimpleProgressBarCard 
              subjects={dashboardData?.subjects || []} 
              isLoading={isLoading} 
            />
          </Paper>
        </Box>
        
        {/* 最近の進捗 */}
        {dashboardData && dashboardData.recentProgress && dashboardData.recentProgress.length > 0 && (
          <Box sx={{ mb: { xs: 2, sm: 3 } }}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider' 
              }}
            >
              <RecentProgressCard 
                recentProgress={dashboardData.recentProgress} 
                formatDate={formatDate}
                isLoading={isLoading} 
              />
            </Paper>
          </Box>
        )}
        
        {/* データクリーンアップボタン */}
        <Grid item xs={12}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            mt: 3,
            mb: 2
          }}>
            <DataCleanupButton size="small" />
          </Box>
        </Grid>
      </Box>
    </Box>
  );
};

export default DashboardScreen; 