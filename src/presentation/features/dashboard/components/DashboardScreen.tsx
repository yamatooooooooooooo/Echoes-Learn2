import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Divider
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { useDashboardData } from '../hooks/useDashboardData';
import { useAuth } from '../../../../contexts/AuthContext';
import { useDashboardSettings } from '../hooks/useDashboardSettings';
import { CardHeader } from '../../../components/common/CardHeader';
import { RecentProgressCard } from './RecentProgressCard';
import ProgressRadarChart from './ProgressRadarChart';
import CountdownContainer from './CountdownContainer';
import { SimpleDailyQuotaCard } from './SimpleDailyQuotaCard';
import { SimpleWeeklyQuotaCard } from './SimpleWeeklyQuotaCard';
import { ModularDashboard } from './ModularDashboard';

/**
 * ダッシュボード画面コンポーネント
 */
export const DashboardScreen: React.FC = () => {
  const { currentUser } = useAuth();
  const { dashboardData, isLoading, error, formatDate, refreshData } = useDashboardData();
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const { moduleSettings, saveSettings, toggleModuleEnabled } = useDashboardSettings();

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
          <Grid container spacing={3}>
            {/* 学習統計 */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <CardHeader
                  title="学習進捗概要"
                  action={
                    <IconButton onClick={() => setSettingsDialogOpen(true)}>
                      <SettingsIcon />
                    </IconButton>
                  }
                />
                <ProgressRadarChart data={dashboardData.radarChartData} />
              </Paper>
            </Grid>

            {/* 日次・週次ノルマ */}
            <Grid item xs={12} md={6}>
              <Grid container spacing={2} sx={{ height: '100%' }}>
                <Grid item xs={12} sm={6}>
                  <SimpleDailyQuotaCard subjects={dashboardData.subjects} isLoading={isLoading} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SimpleWeeklyQuotaCard subjects={dashboardData.subjects} isLoading={isLoading} />
                </Grid>
              </Grid>
            </Grid>
            
            {/* 試験日カウントダウン */}
            <Grid item xs={12} md={6}>
              <CountdownContainer 
                title="試験日カウントダウン"
                subjects={dashboardData.subjects}
              />
            </Grid>
            
            {/* レポート締切カウントダウン */}
            <Grid item xs={12} md={6}>
              <CountdownContainer 
                title="レポート締切カウントダウン"
                subjects={dashboardData.subjects}
                includeReportDeadlines={true}
              />
            </Grid>

            {/* 最近の学習進捗 */}
            <Grid item xs={12}>
              <RecentProgressCard
                recentProgress={dashboardData.recentProgress}
                formatDate={formatDate}
                isLoading={isLoading}
              />
            </Grid>
          </Grid>

          {/* 設定ダイアログ */}
          <Dialog open={settingsDialogOpen} onClose={() => setSettingsDialogOpen(false)}>
            <DialogTitle>ダッシュボード設定</DialogTitle>
            <DialogContent>
              <List>
                <ListItem>
                  <ListItemText
                    primary="試験日カウントダウン"
                    secondary="試験日までの残り日数を表示します"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={moduleSettings.exams?.enabled || false}
                      onChange={() => toggleModuleEnabled('exams')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="レポート締切カウントダウン"
                    secondary="レポート提出締切までの残り日数を表示します"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={moduleSettings.reports?.enabled || false}
                      onChange={() => toggleModuleEnabled('reports')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="学習進捗概要"
                    secondary="科目の全体的な進捗状況をレーダーチャートで表示します"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={moduleSettings.stats?.enabled || false}
                      onChange={() => toggleModuleEnabled('stats')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="最近の学習進捗"
                    secondary="最近の学習記録を表示します"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={moduleSettings.recentProgress?.enabled || false}
                      onChange={() => toggleModuleEnabled('recentProgress')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSettingsDialogOpen(false)}>キャンセル</Button>
              <Button onClick={() => {
                saveSettings();
                setSettingsDialogOpen(false);
              }} variant="contained" color="primary">
                保存
              </Button>
            </DialogActions>
          </Dialog>
          
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