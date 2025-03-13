import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography
} from '@mui/material';
import { useDashboardData } from '../hooks/useDashboardData';
import { useAuth } from '../../../../contexts/AuthContext';
import { ModularDashboard } from './ModularDashboard';

/**
 * ダッシュボード画面コンポーネント
 */
export const DashboardScreen: React.FC = () => {
  const { currentUser } = useAuth();
  const { dashboardData, isLoading, error, formatDate, refreshData } = useDashboardData();

  // 読み込み中の場合はローディングインジケータを表示
  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          ダッシュボードを読み込み中...
        </Typography>
        {/* ここにスケルトンローダーなどを追加 */}
      </Box>
    );
  }

  // エラーがある場合はエラーメッセージを表示
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error" sx={{ mb: 2 }}>
          エラーが発生しました
        </Typography>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
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
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom>
            まだ科目が登録されていません
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            「科目」ページから最初の科目を追加してください
          </Typography>
        </Box>
      )}
    </Box>
  );
}; 