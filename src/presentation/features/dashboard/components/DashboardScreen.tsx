import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Alert,
  AlertTitle,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useDashboardData } from '../hooks/useDashboardData';
import { useAuth } from '../../../../contexts/AuthContext';
import { ModularDashboard } from './ModularDashboard';

/**
 * ダッシュボード画面コンポーネント
 */
const DashboardScreen: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser } = useAuth();
  const { dashboardData, isLoading, error, formatDate, refreshData } = useDashboardData();

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
      p: { xs: 0, sm: 1, md: 2 },
      width: '100%',
      maxWidth: '100vw',
      overflow: 'hidden'
    }}>
      {/* 科目が1つ以上ある場合、ダッシュボードを表示 */}
      {dashboardData && dashboardData.subjects && dashboardData.subjects.length > 0 ? (
        <>
          {/* ModularDashboardコンポーネント */}
          <ModularDashboard
            dashboardData={{
              totalSubjects: dashboardData?.totalSubjects || 0,
              completedSubjects: dashboardData?.completedSubjects || 0,
              totalPages: dashboardData?.totalPages || 0,
              completedPages: dashboardData?.completedPages || 0,
              inProgressSubjects: dashboardData?.inProgressSubjects || 0,
              notStartedSubjects: dashboardData?.notStartedSubjects || 0,
              weeklyProgressData: dashboardData?.weeklyProgressData || [],
              subjects: dashboardData?.subjects || [],
              recentProgress: dashboardData?.recentProgress || [],
              studySessions: dashboardData?.studySessions || [],
              subjectPerformances: dashboardData?.subjectPerformances || []
            }}
            isLoading={isLoading}
            error={error}
            refreshData={refreshData}
            formatDate={formatDate}
          />
        </>
      ) : (
        // 科目がない場合、初期メッセージを表示
        <Box sx={{ 
          textAlign: 'center', 
          py: { xs: 6, sm: 8, md: 10 },
          px: { xs: 2, sm: 3 },
          maxWidth: '600px',
          mx: 'auto',
          borderRadius: 4,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
          border: `1px dashed ${theme.palette.divider}`,
          boxShadow: theme.shadows[1]
        }}>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            gutterBottom
            sx={{ 
              fontWeight: 500,
              color: theme.palette.text.primary,
              mb: 2
            }}
          >
            まだ科目が登録されていません
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4,
              color: theme.palette.text.secondary,
              maxWidth: '450px',
              mx: 'auto'
            }}
          >
            ダッシュボードを活用するには、「科目」ページから最初の科目を追加してください。科目を登録すると、学習進捗や試験までのカウントダウンなどの機能が利用できます。
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// 名前付きエクスポートも提供
export const DashboardScreenComponent = DashboardScreen;

export default DashboardScreen; 