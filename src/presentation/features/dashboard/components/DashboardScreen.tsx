import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
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
  Button,
  Card,
  CardContent,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Divider
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Refresh as RefreshIcon,
  Update as UpdateIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  Timeline as TimelineIcon,
  CalendarToday as CalendarTodayIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { SimpleDailyQuotaCard } from './SimpleDailyQuotaCard';
import { SimpleWeeklyQuotaCard } from './SimpleWeeklyQuotaCard';
import { SimpleProgressBarCard } from './SimpleProgressBarCard';
import { RecentProgressCard } from './RecentProgressCard';
import { UpcomingExamsCard } from './UpcomingExamsCard';
import { DeadlinesCard } from './DeadlinesCard';
import ProgressRadarChart from './ProgressRadarChart';
import CountdownContainer from './CountdownContainer';
import { useDashboardData } from '../hooks/useDashboardData';
import { useAuth } from '../../../../contexts/AuthContext';
import DataCleanupButton from '../../../components/common/DataCleanupButton';
import { useVisualizationData } from '../hooks/useVisualizationData';
import { format } from 'date-fns';
import { CardHeader } from '../../../components/common/CardHeader';
import { useDashboardSettings } from '../hooks/useDashboardSettings';

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
  const [refreshing, setRefreshing] = useState(false);
  const { settings, toggleCard } = useDashboardSettings();
  
  // カード表示設定メニュー用のステート
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  
  // 表示設定メニューを開く
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  // 表示設定メニューを閉じる
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  // 設定ダイアログを開く
  const handleOpenSettingsDialog = () => {
    setSettingsDialogOpen(true);
    handleCloseMenu();
  };
  
  // 設定ダイアログを閉じる
  const handleCloseSettingsDialog = () => {
    setSettingsDialogOpen(false);
  };
  
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
  const handleRefreshWithLoading = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);
  
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
  
  // 科目数の取得
  const subjectCount = dashboardData?.subjects?.length || 0;
  
  return (
    <Box sx={{ overflowX: 'hidden' }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: isMobile ? 2 : 3, pt: 3, pb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
            <DashboardIcon sx={{ mr: 1 }} />
            ダッシュボード
          </Typography>
          
          <Box>
            <Tooltip title="表示設定">
              <IconButton onClick={handleOpenMenu}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
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
        
        <Grid container direction="column" spacing={isMobile ? 2 : 3} sx={{ mb: 2 }}>
          {/* データ可視化セクション - 最上部に移動 */}
          {settings.visualization && (
            <Grid item>
              <Paper sx={{ /* existing styles */ }}>
                <CardHeader
                  title="データ可視化"
                  subtitle="学習進捗と試験準備の状況を視覚的に確認できます"
                  isVisible={settings.visualization}
                  onToggleVisibility={() => toggleCard('visualization')}
                  action={<IntegratedVisualizationControls />}
                />
                <IntegratedVisualizationSection />
              </Paper>
            </Grid>
          )}
          
          {/* 試験スケジュールカード */}
          {settings.upcomingExams && (
            <Grid item>
              <Paper sx={{ /* existing styles */ }}>
                <CardHeader
                  title="試験スケジュール"
                  isVisible={settings.upcomingExams}
                  onToggleVisibility={() => toggleCard('upcomingExams')}
                />
                <UpcomingExamsCard subjects={dashboardData?.subjects || []} />
              </Paper>
            </Grid>
          )}
          
          {/* レポート締切カード */}
          {settings.deadlines && (
            <Grid item>
              <Paper sx={{ /* existing styles */ }}>
                <CardHeader
                  title="レポート締切"
                  isVisible={settings.deadlines}
                  onToggleVisibility={() => toggleCard('deadlines')}
                />
                <DeadlinesCard subjects={dashboardData?.subjects || []} />
              </Paper>
            </Grid>
          )}
          
          {/* ノルマカードのコンテナ */}
          <Grid item>
            <Grid container spacing={2}>
              {/* 日次ノルマカード */}
              {settings.dailyQuota && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ /* existing styles */ }}>
                    <CardHeader
                      title="日次ノルマ"
                      isVisible={settings.dailyQuota}
                      onToggleVisibility={() => toggleCard('dailyQuota')}
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
                  <Paper sx={{ /* existing styles */ }}>
                    <CardHeader
                      title="週次ノルマ"
                      isVisible={settings.weeklyQuota}
                      onToggleVisibility={() => toggleCard('weeklyQuota')}
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
              <Paper sx={{ /* existing styles */ }}>
                <CardHeader
                  title="進捗状況"
                  isVisible={settings.progressBar}
                  onToggleVisibility={() => toggleCard('progressBar')}
                />
                <SimpleProgressBarCard 
                  subjects={dashboardData?.subjects || []} 
                  isLoading={isLoading}
                />
              </Paper>
            </Grid>
          )}
          
          {/* 最近の進捗 */}
          {settings.recentProgress && dashboardData?.recentProgress && dashboardData.recentProgress.length > 0 && (
            <Grid item>
              <Paper sx={{ /* existing styles */ }}>
                <CardHeader
                  title="最近の進捗"
                  isVisible={settings.recentProgress}
                  onToggleVisibility={() => toggleCard('recentProgress')}
                />
                <RecentProgressCard 
                  recentProgress={dashboardData.recentProgress} 
                  formatDate={formatDate}
                  isLoading={isLoading}
                />
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
    </Box>
  );
};

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
      <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
        最終更新: {formattedUpdateTime}
      </Typography>
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

  // アクティブな科目のみをフィルタリング（試験日が過去でない科目）
  const activeSubjects = useMemo(() => {
    if (!data.subjects) return [];
    const today = new Date();
    return data.subjects.filter(subject => {
      const examDate = new Date(subject.examDate);
      return examDate >= today;
    });
  }, [data.subjects]);

  // レーダーチャートのデータをフィルタリング
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

  // ヘッダー部分
  const Header = useMemo(() => (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      mb: 2
    }}>
      <Typography variant="h5" component="h2">
        学習状況
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton 
          onClick={handleRefresh} 
          disabled={isLoading}
          size="small"
          sx={{ mr: 1 }}
        >
          <RefreshIcon />
        </IconButton>
        <Typography variant="caption" color="text.secondary">
          {formattedLastUpdated}
        </Typography>
      </Box>
    </Box>
  ), [handleRefresh, isLoading, formattedLastUpdated]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        {Header}
      </Grid>

      <Grid item xs={12}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <ProgressRadarChart data={filteredRadarData} />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <CountdownContainer 
              data={data.countdownData} 
              includeReportDeadlines={true}
              subjects={activeSubjects}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
});

export default DashboardScreen; 