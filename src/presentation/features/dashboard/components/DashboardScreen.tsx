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
        
        <Grid container direction="column" spacing={isMobile ? 3 : 4} sx={{ mb: 2 }}>
          {/* データ可視化セクション - 最上部に移動 */}
          {settings.visualization && (
            <Grid item>
              <Paper sx={{ 
                boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: theme.palette.mode === 'dark' ? '0 6px 24px rgba(0, 0, 0, 0.6)' : '0 4px 16px rgba(0, 0, 0, 0.15)',
                }
              }}>
                <CardHeader
                  title="データ可視化"
                  onToggleVisibility={() => toggleCard('visualization')}
                  isVisible={settings.visualization}
                  action={<IntegratedVisualizationControls />}
                  helpText="このカードでは科目ごとの進捗率をレーダーチャートで可視化します。外側に近いほど進捗率が高いことを示します。また、各科目の試験日までの残り日数もカウントダウン表示します。"
                />
                <IntegratedVisualizationSection />
              </Paper>
            </Grid>
          )}
          
          {/* 試験スケジュールカード */}
          {settings.upcomingExams && (
            <Grid item>
              <Paper sx={{ 
                boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(36, 36, 36, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: theme.palette.mode === 'dark' ? '0 6px 24px rgba(0, 0, 0, 0.6)' : '0 4px 16px rgba(0, 0, 0, 0.15)',
                }
              }}>
                <CardHeader
                  title="試験スケジュール"
                  isVisible={settings.upcomingExams}
                  onToggleVisibility={() => toggleCard('upcomingExams')}
                  helpText="今後の試験日程を時系列順に表示します。日付が近い順に並べられ、赤色は7日以内、黄色は14日以内の試験を示します。"
                />
                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                  <UpcomingExamsCard subjects={dashboardData?.subjects || []} />
                </Box>
              </Paper>
            </Grid>
          )}
          
          {/* レポート締切カード */}
          {settings.deadlines && (
            <Grid item>
              <Paper sx={{ 
                boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(36, 36, 36, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: theme.palette.mode === 'dark' ? '0 6px 24px rgba(0, 0, 0, 0.6)' : '0 4px 16px rgba(0, 0, 0, 0.15)',
                }
              }}>
                <CardHeader
                  title="レポート締切"
                  isVisible={settings.deadlines}
                  onToggleVisibility={() => toggleCard('deadlines')}
                  helpText="レポート提出の締切日を時系列順に表示します。日付が近い順に並べられ、赤色は7日以内、黄色は14日以内の締切を示します。"
                />
                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                  <DeadlinesCard subjects={dashboardData?.subjects || []} />
                </Box>
              </Paper>
            </Grid>
          )}
          
          {/* ノルマカードのコンテナ */}
          <Grid item>
            <Grid container spacing={2}>
              {/* 日次ノルマカード */}
              {settings.dailyQuota && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ 
                    boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
                    borderRadius: 3,
                    overflow: 'hidden',
                    height: '100%',
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(36, 36, 36, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: theme.palette.mode === 'dark' ? '0 6px 24px rgba(0, 0, 0, 0.6)' : '0 4px 16px rgba(0, 0, 0, 0.15)',
                    }
                  }}>
                    <CardHeader
                      title="日次ノルマ"
                      isVisible={settings.dailyQuota}
                      onToggleVisibility={() => toggleCard('dailyQuota')}
                      helpText="各科目の1日あたりの学習ページ数目標を表示します。試験日までの残り日数と総ページ数から自動計算されます。設定画面で学習日数を調整できます。"
                    />
                    <SimpleDailyQuotaCard 
                      subjects={dashboardData?.subjects || []} 
                      isLoading={isLoading}
                    />
                  </Paper>
                </Grid>
              )}
              
              {/* 週次ノルマカード */}
              {settings.weeklyQuota && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ 
                    boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
                    borderRadius: 3,
                    overflow: 'hidden',
                    height: '100%',
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(36, 36, 36, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: theme.palette.mode === 'dark' ? '0 6px 24px rgba(0, 0, 0, 0.6)' : '0 4px 16px rgba(0, 0, 0, 0.15)',
                    }
                  }}>
                    <CardHeader
                      title="週次ノルマ"
                      isVisible={settings.weeklyQuota}
                      onToggleVisibility={() => toggleCard('weeklyQuota')}
                      helpText="各科目の1週間あたりの学習ページ数目標を表示します。試験日までの残り週数と総ページ数から自動計算されます。設定画面で週あたりの学習日数を調整できます。"
                    />
                    <SimpleWeeklyQuotaCard 
                      subjects={dashboardData?.subjects || []} 
                      isLoading={isLoading}
                    />
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Grid>
          
          {settings.progressBar && (
            <Grid item>
              <Paper sx={{ 
                boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(36, 36, 36, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: theme.palette.mode === 'dark' ? '0 6px 24px rgba(0, 0, 0, 0.6)' : '0 4px 16px rgba(0, 0, 0, 0.15)',
                }
              }}>
                <CardHeader
                  title="進捗状況"
                  isVisible={settings.progressBar}
                  onToggleVisibility={() => toggleCard('progressBar')}
                  helpText="各科目の全体的な進捗状況をプログレスバーで表示します。現在のページ数と総ページ数の比率を視覚的に確認できます。"
                />
                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                  <SimpleProgressBarCard 
                    subjects={dashboardData?.subjects || []} 
                    isLoading={isLoading}
                  />
                </Box>
              </Paper>
            </Grid>
          )}
          
          {/* 最近の進捗 */}
          {settings.recentProgress && dashboardData?.recentProgress && dashboardData.recentProgress.length > 0 && (
            <Grid item>
              <Paper sx={{ 
                boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(36, 36, 36, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: theme.palette.mode === 'dark' ? '0 6px 24px rgba(0, 0, 0, 0.6)' : '0 4px 16px rgba(0, 0, 0, 0.15)',
                }
              }}>
                <CardHeader
                  title="最近の進捗"
                  isVisible={settings.recentProgress}
                  onToggleVisibility={() => toggleCard('recentProgress')}
                  helpText="最近記録した学習進捗を時系列で表示します。各科目の学習記録を確認でき、いつどの科目をどれだけ学習したかが一目でわかります。"
                />
                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                  <RecentProgressCard 
                    recentProgress={dashboardData.recentProgress} 
                    formatDate={formatDate}
                    isLoading={isLoading}
                  />
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
        
        {/* カード表示設定ダイアログ */}
        <Dialog
          open={settingsDialogOpen}
          onClose={handleCloseSettingsDialog}
          aria-labelledby="card-settings-dialog-title"
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle id="card-settings-dialog-title">
            カード表示設定
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              ダッシュボードに表示するカードを選択してください。
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.visualization}
                  onChange={() => toggleCard('visualization')}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BarChartIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography>データ可視化</Typography>
                </Box>
              }
            />
            <Divider sx={{ my: 1 }} />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.upcomingExams}
                  onChange={() => toggleCard('upcomingExams')}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography>試験スケジュール</Typography>
                </Box>
              }
            />
            <Divider sx={{ my: 1 }} />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.deadlines}
                  onChange={() => toggleCard('deadlines')}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AssignmentIcon sx={{ mr: 1, color: 'secondary.main' }} />
                  <Typography>レポート締切</Typography>
                </Box>
              }
            />
            <Divider sx={{ my: 1 }} />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.dailyQuota}
                  onChange={() => toggleCard('dailyQuota')}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarTodayIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography>日次ノルマ</Typography>
                </Box>
              }
            />
            <Divider sx={{ my: 1 }} />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.weeklyQuota}
                  onChange={() => toggleCard('weeklyQuota')}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TimelineIcon sx={{ mr: 1, color: 'info.main' }} />
                  <Typography>週次ノルマ</Typography>
                </Box>
              }
            />
            <Divider sx={{ my: 1 }} />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.progressBar}
                  onChange={() => toggleCard('progressBar')}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography>進捗状況</Typography>
                </Box>
              }
            />
            <Divider sx={{ my: 1 }} />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.recentProgress}
                  onChange={() => toggleCard('recentProgress')}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AssessmentIcon sx={{ mr: 1, color: 'error.main' }} />
                  <Typography>最近の進捗</Typography>
                </Box>
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseSettingsDialog} color="primary">
              閉じる
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* データクリーンアップボタン */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, mb: 2, width: '100%' }}>
          <DataCleanupButton size="small" />
        </Box>
    </Box>
  );
/**
 * 統合されたデータ可視化コントロールコンポーネント
 */
const IntegratedVisualizationControls = React.memo(() => {
  const { lastUpdated, refreshData } = useVisualizationData();
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  // 手動更新処理
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  // 最終更新時刻のフォーマット
  const formattedUpdateTime = useMemo(() => {
    if (!lastUpdated) return '未更新';
    
    // 時刻のフォーマット
    const hours = lastUpdated.getHours().toString().padStart(2, '0');
    const minutes = lastUpdated.getMinutes().toString().padStart(2, '0');
    const seconds = lastUpdated.getSeconds().toString().padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
  }, [lastUpdated]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Tooltip title="データを更新">
        <IconButton 
          onClick={handleRefresh} 
          size="small"
          disabled={refreshing}
          sx={{
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            '&:hover': {
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
            }
          }}
        >
          {refreshing ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
        </IconButton>
      </Tooltip>
    </Box>
  );
});

/**
 * 統合されたデータ可視化セクションコンポーネント
 */
const IntegratedVisualizationSection = React.memo(() => {
  const { data, isLoading, lastUpdated, handleRefresh } = useVisualizationData();
  const theme = useTheme();

  // アクティブな科目のみをフィルタリング
  // 1. 試験日が過去でない科目
  // 2. 進行中の科目（currentPage < totalPages）のみ - ノルマ計算対象
  const activeSubjects = useMemo(() => {
    if (!data.subjects) return [];
    const today = new Date();
    return data.subjects.filter(subject => {
      const examDate = new Date(subject.examDate);
      // 試験日が今日以降かつ、完了していない科目（ノルマ計算対象の科目）
      return examDate >= today && subject.currentPage < subject.totalPages;
    });
  }, [data.subjects]);

  // レーダーチャートのデータをフィルタリング - ノルマ計算対象の科目のみ表示
  const filteredRadarData = useMemo(() => {
    return data.radarChartData.filter(item => {
      // 対応する科目がアクティブかどうかを確認
      return activeSubjects.some(subject => subject.name === item.subject);
    });
  }, [data.radarChartData, activeSubjects]);

  // フォーマットされた最終更新時間
  const formattedLastUpdated = useMemo(() => {
    return lastUpdated ? `最終更新: ${format(new Date(lastUpdated), 'yyyy/MM/dd HH:mm')}` : '';
  }, [lastUpdated]);

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 },
      width: '100%',
      overflow: 'hidden'
    }}>
      <Grid container direction="column" spacing={3}>
        {/* レーダーチャートカード */}
        <Grid item xs={12}>
          <Box sx={{ 
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.6)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2,
                fontWeight: 600,
                color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.85)',
              }}
            >
              科目進捗レーダーチャート
            </Typography>
            <Box sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              minHeight: 250,
              position: 'relative'
            }}>
              <ProgressRadarChart data={filteredRadarData} />
              {formattedLastUpdated && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    opacity: 0.7,
                    fontSize: '0.7rem',
                    px: 1
                  }}
                >
                  {formattedLastUpdated}
                </Typography>
              )}
            </Box>
          </Box>
        </Grid>

        {/* カウントダウンコンテナカード */}
        <Grid item xs={12}>
          <Box sx={{ 
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.6)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2,
                fontWeight: 600,
                color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.85)',
              }}
            >
              締切カウントダウン
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <CountdownContainer 
                data={data.countdownData} 
                includeReportDeadlines={true}
                subjects={activeSubjects}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
});

export default DashboardScreen; 
