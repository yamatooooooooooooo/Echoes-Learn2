import React from 'react';
import { Box, Typography, CircularProgress, Alert, Divider, Grid, LinearProgress } from '@mui/material';
import SimpleDailyQuotaCard from './SimpleDailyQuotaCard';
import SimpleWeeklyQuotaCard from './SimpleWeeklyQuotaCard';
import SimpleProgressBarCard from './SimpleProgressBarCard';
import { RecentProgressCard } from './RecentProgressCard';
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
      
      <Box sx={{ mb: 4 }}>
        {dashboardData && dashboardData.upcomingExams && dashboardData.upcomingExams.length > 0 ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              今後の試験
            </Typography>
            {dashboardData.upcomingExams.slice(0, 3).map((exam, index) => (
              <Box 
                key={index} 
                sx={{ 
                  mb: 1,
                  p: 2, 
                  borderRadius: 1, 
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography variant="subtitle1">{exam.subjectName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  試験日: {formatDate(exam.examDate)} (残り{exam.remainingDays}日)
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={exam.completion} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 1,
                        backgroundColor: 'rgba(0,0,0,0.05)'
                      }} 
                    />
                  </Box>
                  <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">{`${exam.completion}%`}</Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        ) : null}
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