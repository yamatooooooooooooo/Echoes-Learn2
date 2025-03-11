import React from 'react';
import { Box, Typography, CircularProgress, Alert, Divider, Grid, LinearProgress } from '@mui/material';
import SimpleDailyQuotaCard from './SimpleDailyQuotaCard';
import SimpleWeeklyQuotaCard from './SimpleWeeklyQuotaCard';
import SimpleProgressBarCard from './SimpleProgressBarCard';
import { RecentProgressCard } from './RecentProgressCard';
import { UpcomingExamsCard } from './UpcomingExamsCard';
import { useDashboardData } from '../hooks/useDashboardData';
import { useAuth } from '../../../../contexts/AuthContext';
import DataCleanupButton from '../../../components/common/DataCleanupButton';

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
        pt: { xs: 2, sm: 2, md: 3 },
        overflowX: 'hidden'
      }}
    >
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
      
      {/* データクリーンアップボタン */}
      <Grid item xs={12}>
        <DashboardFooter />
      </Grid>
    </Box>
  );
};

// ダッシュボードフッター
const DashboardFooter = () => {
  return (
    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
      <DataCleanupButton size="small" />
    </Box>
  );
};

export default DashboardScreen; 