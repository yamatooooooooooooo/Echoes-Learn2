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
  Grid,
  Badge
} from '@mui/material';
import { 
  Timer as TimerIcon, 
  MenuBook as BookIcon,
  Refresh as RefreshIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
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
  
  // 週次ノルマの達成状況を判定する関数
  const getWeeklyCompletionStatus = (item: any) => {
    // 科目のIDを使って、対応する科目のデータを取得
    const subjectData = subjects.find(subject => subject.id === item.subjectId);
    
    if (!subjectData) return { progress: 0, isCompleted: false };
    
    // 週の進捗を計算（ここでは単純化のため、当週の進捗ページ数がノルマを超えているか確認）
    // weeklyProgressPagesプロパティは実際のアプリでは実装されている想定
    const weeklyProgressPages = 0; // 仮の実装（実際のアプリではsubjectDataから適切な値を取得）
    const progress = Math.min(100, Math.round((weeklyProgressPages / (item.pages || 1)) * 100));
    
    return {
      progress,
      isCompleted: progress >= 100
    };
  };
  
  // 日付の進捗状況を判定する関数
  const getDailyProgress = (dateStr: string) => {
    // この日付の全科目の進捗状況を確認
    const totalTargetPages = weeklyQuota?.dailyDistribution[dateStr] || 0;
    const date = new Date(dateStr);
    
    // 日付が今日より前か判定
    const isPastDay = date < new Date();
    
    // 仮の進捗率（実際のアプリでは日次の進捗データを確認する必要あり）
    // ここでは例として、過去の日付は80%の確率で達成済みとする
    const isCompleted = isPastDay && Math.random() > 0.2;
    
    return {
      totalTargetPages,
      isCompleted,
      isPastDay
    };
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
              <Typography variant="body2">合計: {isNaN(weeklyQuota.totalPages) ? 0 : weeklyQuota.totalPages} ページ</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TimerIcon sx={{ mr: 0.5, fontSize: 18 }} />
              <Typography variant="body2">推定時間: {isNaN(weeklyQuota.totalMinutes) ? 0 : Math.round(weeklyQuota.totalMinutes / 60 * 10) / 10} 時間</Typography>
            </Box>
          </Box>
        </Box>
        
        <Typography variant="subtitle2" gutterBottom>日ごとの配分</Typography>
        <Grid container spacing={1} sx={{ mb: 2 }}>
          {dailyDates.map((dateStr) => {
            const { totalTargetPages, isCompleted, isPastDay } = getDailyProgress(dateStr);
            const today = new Date().toISOString().split('T')[0];
            const isToday = dateStr === today;
            
            return (
            <Grid item xs={4} sm={3} md={2} key={dateStr}>
              <Paper 
                elevation={1}
                sx={{ 
                  p: 1, 
                  textAlign: 'center',
                  bgcolor: isCompleted ? 'rgba(76, 175, 80, 0.1)' : 
                          isPastDay && !isCompleted ? 'rgba(244, 67, 54, 0.1)' : 
                          isToday ? 'rgba(33, 150, 243, 0.1)' : 'background.paper',
                  border: isToday ? '1px solid rgba(33, 150, 243, 0.5)' : 'none',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="caption" display="block">
                    {new Date(dateStr).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                  </Typography>
                  {isPastDay && (
                    isCompleted ? 
                    <CheckCircleIcon color="success" sx={{ ml: 0.5, fontSize: 14 }} /> : 
                    <ErrorIcon color="error" sx={{ ml: 0.5, fontSize: 14 }} />
                  )}
                </Box>
                <Chip 
                  label={`${weeklyQuota.dailyDistribution[dateStr]} ページ`}
                  size="small"
                  sx={{ 
                    mt: 0.5,
                    bgcolor: isCompleted ? 'rgba(76, 175, 80, 0.2)' : undefined
                  }}
                />
              </Paper>
            </Grid>
          )})}
        </Grid>
        
        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="subtitle2" gutterBottom>科目ごとのノルマ</Typography>
        <List disablePadding>
          {weeklyQuota.quotaItems.map((item) => {
            const { progress, isCompleted } = getWeeklyCompletionStatus(item);
            return (
            <Paper 
              key={item.subjectId} 
              elevation={1} 
              sx={{ 
                mb: 1,
                p: 1,
                borderLeft: `4px solid ${getPriorityColor(item.priority)}`,
                background: isCompleted ? 'rgba(76, 175, 80, 0.1)' : undefined,
              }}
            >
              <ListItem disablePadding sx={{ py: 0.5 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1">{item.subjectName}</Typography>
                        {isCompleted && (
                          <Tooltip title="今週のノルマ達成">
                            <CheckCircleIcon 
                              color="success" 
                              fontSize="small" 
                              sx={{ ml: 1 }} 
                            />
                          </Tooltip>
                        )}
                      </Box>
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          試験日: {item.examDate ? new Date(item.examDate).toLocaleDateString('ja-JP') : '未設定'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.estimatedMinutes} 分
                        </Typography>
                      </Box>
                      <Box sx={{ width: '100%', mt: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={progress} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: isCompleted ? '#4caf50' : getPriorityColor(item.priority),
                            }
                          }}
                        />
                        <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                          {progress}% 完了
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            </Paper>
          )})}
        </List>
      </CardContent>
      <MaintenanceMessageComponent />
    </Card>
  );
};

export default SimpleWeeklyQuotaCard; 