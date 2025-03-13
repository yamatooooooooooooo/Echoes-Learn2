import React, { useState, useMemo, useCallback } from 'react';
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
import { NavigationCard } from './NavigationCard';
import ProgressRadarChart from './ProgressRadarChart';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
// import { UpcomingExamsCard } from './UpcomingExamsCard';

/**
 * ダッシュボードスクリーンコンポーネント
 */
const DashboardScreen: React.FC = () => {
  const { dashboardData, isLoading, error } = useDashboardData();
  const { currentUser } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settings, toggleCard } = useDashboardSettings();

  // 日付フォーマット関数
  const formatDate = useCallback((date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'yyyy年M月d日（E）', { locale: ja });
  }, []);

  // 設定ダイアログを開く
  const handleOpenSettings = () => {
    setSettingsOpen(true);
  };

  // 設定ダイアログを閉じる
  const handleCloseSettings = () => {
    setSettingsOpen(false);
  };

  // ヘッダー部分
  const Header = useMemo(() => (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      mb: 3
    }}>
      <Typography variant="h5" component="h1">
        ダッシュボード
      </Typography>
      <IconButton onClick={handleOpenSettings} size="large">
        <SettingsIcon />
      </IconButton>
    </Box>
  ), []);

  // エラー表示
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {Header}

      <Grid container spacing={3}>
        {/* レーダーチャート */}
        {settings.progressRadar && (
          <Grid item xs={12}>
            <Paper>
              <CardHeader
                title="学習進捗レーダーチャート"
                isVisible={settings.progressRadar}
                onToggleVisibility={() => toggleCard('progressRadar')}
                helpText="試験日が設定されており、かつ完了していない科目の進捗状況をレーダーチャートで表示します。同時並行で学習している科目の進捗バランスを確認できます。"
              />
              <Box sx={{ p: 2 }}>
                <ProgressRadarChart data={dashboardData?.radarChartData || []} />
              </Box>
            </Paper>
          </Grid>
        )}

        {/* ナビゲーションカード */}
        {settings.navigation && (
          <Grid item xs={12} md={6}>
            <Paper>
              <CardHeader
                title="クイックナビゲーション"
                isVisible={settings.navigation}
                onToggleVisibility={() => toggleCard('navigation')}
                helpText="よく使う機能へのクイックアクセスを提供します。科目の追加や進捗の記録など、主要な操作をすぐに実行できます。"
              />
              <NavigationCard onNavigate={() => {}} />
            </Paper>
          </Grid>
        )}

        {/* 最近の進捗 */}
        {settings.recentProgress && dashboardData?.recentProgress && dashboardData.recentProgress.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper>
              <CardHeader
                title="最近の進捗"
                isVisible={settings.recentProgress}
                onToggleVisibility={() => toggleCard('recentProgress')}
                helpText="最近記録した学習進捗を時系列で表示します。各科目の学習記録を確認でき、いつどの科目をどれだけ学習したかが一目でわかります。"
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
        open={settingsOpen}
        onClose={handleCloseSettings}
        aria-labelledby="dashboard-settings-dialog"
      >
        <DialogTitle id="dashboard-settings-dialog">
          ダッシュボード設定
        </DialogTitle>
        <DialogContent>
          <List>
            <ListItem>
              <ListItemText 
                primary="レーダーチャート"
                secondary="学習進捗のバランスを可視化"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={settings.progressRadar}
                  onChange={() => toggleCard('progressRadar')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText 
                primary="クイックナビゲーション"
                secondary="よく使う機能へのショートカット"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={settings.navigation}
                  onChange={() => toggleCard('navigation')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText 
                primary="最近の進捗"
                secondary="最近の学習記録を表示"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={settings.recentProgress}
                  onChange={() => toggleCard('recentProgress')}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSettings} color="primary">
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardScreen; 