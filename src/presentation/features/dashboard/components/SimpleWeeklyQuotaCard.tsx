import React, { useState, useEffect } from 'react';
import { 
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper,
  IconButton,
  Tooltip,
  Grid
} from '@mui/material';
import { 
  Timer as TimerIcon, 
  MenuBook as BookIcon,
  Refresh as RefreshIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { Subject } from '../../../../domain/models/SubjectModel';
import { WeeklyQuota } from '../../../../domain/models/QuotaModel';
import { calculateWeeklyQuota } from '../../../../domain/utils/quotaCalculator';
import { useMaintenanceMessage } from '../../../../hooks/useMaintenanceMessage';

interface SimpleWeeklyQuotaCardProps {
  subjects: Subject[];
  isLoading?: boolean;
}

/**
 * シンプルな週次ノルマ表示カード
 */
const SimpleWeeklyQuotaCard: React.FC<SimpleWeeklyQuotaCardProps> = ({ 
  subjects,
  isLoading = false
}) => {
  const [weeklyQuota, setWeeklyQuota] = useState<WeeklyQuota | null>(null);
  
  // メンテナンスメッセージフックを使用
  const { wrapWithMaintenanceMessage, MaintenanceMessageComponent } = useMaintenanceMessage({
    message: '週次ノルマの再計算機能は現在メンテナンス中です。近日中に実装予定です。'
  });
  
  // 科目リストが変更されたらノルマを再計算
  useEffect(() => {
    // 関数をuseEffect内部で定義して依存関係の問題を解決
    const calculateQuota = () => {
      const quota = calculateWeeklyQuota(subjects);
      setWeeklyQuota(quota);
    };
    
    if (subjects.length > 0) {
      calculateQuota();
    } else {
      setWeeklyQuota(null);
    }
  }, [subjects]);
  
  // 手動更新用関数
  const handleRefresh = () => {
    const quota = calculateWeeklyQuota(subjects);
    setWeeklyQuota(quota);
  };
  
  // メンテナンスメッセージを表示するラッパー関数
  const handleRefreshWithMaintenance = wrapWithMaintenanceMessage(handleRefresh);
  
  // 優先度に応じた色を返す
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return '#f44336';  // 赤
      case 'medium':
        return '#ff9800';  // オレンジ
      case 'low':
        return '#4caf50';  // 緑
      default:
        return '#9e9e9e';  // グレー
    }
  };
  
  // 日付を「月/日」形式に変換
  const formatDate = (date: Date): string => {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };
  
  // 週の期間を表示用にフォーマット
  const formatWeekPeriod = (startDate: Date, endDate: Date): string => {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };
  
  if (isLoading) {
    return (
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardHeader 
          title="今週のノルマ" 
          titleTypographyProps={{ variant: 'h6' }}
        />
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LinearProgress sx={{ width: '100%', height: 10, borderRadius: 5 }} />
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  if (!weeklyQuota || weeklyQuota.quotaItems.length === 0) {
    return (
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardHeader 
          title="今週のノルマ" 
          titleTypographyProps={{ variant: 'h6' }}
          action={
            <Tooltip title="再計算">
              <IconButton onClick={handleRefreshWithMaintenance} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          }
        />
        <CardContent>
          <Typography variant="body2" color="text.secondary" align="center">
            今週のノルマはありません
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            科目を登録してください
          </Typography>
        </CardContent>
        <MaintenanceMessageComponent />
      </Card>
    );
  }
  
  // 日付の配列を作成
  const dailyDates = Object.keys(weeklyQuota.dailyDistribution).sort();
  
  return (
    <Card elevation={2} sx={{ mb: 3, maxWidth: '100%', width: '100%' }}>
      <CardHeader 
        title="今週のノルマ" 
        titleTypographyProps={{ variant: 'h6' }}
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <CalendarIcon sx={{ mr: 0.5, fontSize: 18 }} />
            <Typography variant="body2">
              {formatWeekPeriod(weeklyQuota.startDate, weeklyQuota.endDate)}
            </Typography>
          </Box>
        }
        action={
          <Tooltip title="再計算">
            <IconButton onClick={handleRefreshWithMaintenance} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
      />
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BookIcon sx={{ mr: 0.5, fontSize: 18 }} />
              <Typography variant="body2">合計: {weeklyQuota.totalPages} ページ</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TimerIcon sx={{ mr: 0.5, fontSize: 18 }} />
              <Typography variant="body2">推定時間: {Math.round(weeklyQuota.totalMinutes / 60 * 10) / 10} 時間</Typography>
            </Box>
          </Box>
        </Box>
        
        <Typography variant="subtitle2" gutterBottom>日ごとの配分</Typography>
        <Grid container spacing={1} sx={{ mb: 2 }}>
          {dailyDates.map((dateStr) => (
            <Grid item xs={4} sm={3} md={2} key={dateStr}>
              <Paper 
                elevation={1}
                sx={{ 
                  p: 1, 
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                }}
              >
                <Typography variant="caption" display="block">
                  {new Date(dateStr).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                </Typography>
                <Chip 
                  label={`${weeklyQuota.dailyDistribution[dateStr]} ページ`}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
        
        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="subtitle2" gutterBottom>科目ごとのノルマ</Typography>
        <List disablePadding>
          {weeklyQuota.quotaItems.map((item) => (
            <Paper 
              key={item.subjectId} 
              elevation={1} 
              sx={{ 
                mb: 1,
                p: 1,
                borderLeft: `4px solid ${getPriorityColor(item.priority)}`,
              }}
            >
              <ListItem disablePadding sx={{ py: 0.5 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">{item.subjectName}</Typography>
                      <Chip 
                        label={`${item.pages} ページ`} 
                        size="small"
                        sx={{ 
                          bgcolor: 'background.paper',
                          borderColor: getPriorityColor(item.priority),
                          borderWidth: 1,
                          borderStyle: 'solid'
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        試験日: {item.examDate ? new Date(item.examDate).toLocaleDateString('ja-JP') : '未設定'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.estimatedMinutes} 分
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      </CardContent>
      <MaintenanceMessageComponent />
    </Card>
  );
};

export default SimpleWeeklyQuotaCard; 