import React from 'react';
import { Box, Typography, CircularProgress, Alert, Divider, Grid, LinearProgress } from '@mui/material';
import SimpleDailyQuotaCard from './SimpleDailyQuotaCard';
import SimpleWeeklyQuotaCard from './SimpleWeeklyQuotaCard';
import SimpleProgressBarCard from './SimpleProgressBarCard';
import { RecentProgressCard } from './RecentProgressCard';
import UpcomingExamsCard from './UpcomingExamsCard';
import { useDashboardData } from '../hooks/useDashboardData';
import { useAuth } from '../../../../contexts/AuthContext';

/**
 * ダッシュボード画面
 * Firebaseから実際のデータを取得して表示
 */
const DashboardScreen: React.FC = () => {
  const { dashboardData, isLoading, error, formatDate } = useDashboardData();
  const { currentUser } = useAuth();
  
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
        maxWidth: '1200px', 
        mx: 'auto', 
        p: { xs: 1, sm: 2 },
        pt: { xs: 10, sm: 11, md: 12 }, // ヘッダーの高さを考慮して上部にパディングを追加
        overflowX: 'hidden'
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        ダッシュボード
      </Typography>
      
      {/* 試験スケジュールカード */}
      <Box sx={{ mb: 4 }}>
        <UpcomingExamsCard subjects={dashboardData?.subjects || []} />
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <SimpleDailyQuotaCard 
            subjects={dashboardData?.subjects || []} 
            isLoading={isLoading} 
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SimpleWeeklyQuotaCard 
            subjects={dashboardData?.subjects || []} 
            isLoading={isLoading} 
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3 }}>
        <SimpleProgressBarCard 
          subjects={dashboardData?.subjects || []} 
          isLoading={isLoading} 
        />
      </Box>
      
      {dashboardData && dashboardData.recentProgress && dashboardData.recentProgress.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <RecentProgressCard 
            recentProgress={dashboardData.recentProgress} 
            formatDate={formatDate}
            isLoading={isLoading} 
          />
        </Box>
      )}
    </Box>
  );
};

export default DashboardScreen; 