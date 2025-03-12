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
  Badge
} from '@mui/material';
import { 
  Timer as TimerIcon, 
  MenuBook as BookIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { Subject } from '../../../../domain/models/SubjectModel';
import { DailyQuota } from '../../../../domain/models/QuotaModel';
import { calculateDailyQuota } from '../../../../domain/utils/quotaCalculator';
import { useMaintenanceMessage } from '../../../../hooks/useMaintenanceMessage';
import { useUserSettings } from '../../../../hooks/useUserSettings';

// 仮の実装を削除
// const userSettings = {
//   maxConcurrentSubjects: 3,
//   examBufferDays: 7,
//   averagePageReadingTime: 2
// };

interface SimpleDailyQuotaCardProps {
  subjects: Subject[];
  isLoading?: boolean;
}

/**
 * シンプルな日次ノルマ表示カード
 */
const SimpleDailyQuotaCard: React.FC<SimpleDailyQuotaCardProps> = ({ 
  subjects,
  isLoading = false
}) => {
  const [dailyQuota, setDailyQuota] = useState<DailyQuota | null>(null);
  // ユーザー設定を取得
  const { userSettings, isLoading: isSettingsLoading } = useUserSettings();
  
  // メンテナンスメッセージフックを使用
  const { wrapWithMaintenanceMessage, MaintenanceMessageComponent } = useMaintenanceMessage({
    message: '日次ノルマの再計算機能は現在メンテナンス中です。近日中に実装予定です。'
  });
  
  // 科目リストが変更されたらノルマを再計算
  useEffect(() => {
    // 関数をuseEffect内部で定義して依存関係の問題を解決
    const calculateQuota = () => {
      const quota = calculateDailyQuota(subjects, userSettings);
      setDailyQuota(quota);
    };
    
    if (subjects.length > 0 && !isSettingsLoading) {
      calculateQuota();
    } else {
      setDailyQuota(null);
    }
  }, [subjects, userSettings, isSettingsLoading]);
  
  // 手動更新用関数
  const handleRefresh = () => {
    const quota = calculateDailyQuota(subjects, userSettings);
    setDailyQuota(quota);
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
  
  // 本日の進捗状況を取得（仮実装）
  const getCompletionStatus = (item: any) => {
    return {
      hasProgressToday: Math.random() > 0.5,  // 実際にはユーザーの進捗データから計算
      metQuotaToday: Math.random() > 0.7      // 実際にはユーザーの進捗データから計算
    };
  };
  
  // ローディング中
  if (isLoading || isSettingsLoading) {
    return (
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardHeader 
          title="今日のノルマ" 
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
  
  if (!dailyQuota || dailyQuota.quotaItems.length === 0) {
    return (
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardHeader 
          title="今日のノルマ" 
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
            今日のノルマはありません
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            科目を登録してください
          </Typography>
        </CardContent>
        <MaintenanceMessageComponent />
      </Card>
    );
  }
  
  return (
    <Card elevation={2} sx={{ mb: 3, maxWidth: '100%', width: '100%' }}>
      <CardHeader 
        title="今日のノルマ" 
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
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BookIcon sx={{ mr: 0.5, fontSize: 18 }} />
              <Typography variant="body2">合計: {isNaN(dailyQuota.totalPages) ? 0 : dailyQuota.totalPages} ページ</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TimerIcon sx={{ mr: 0.5, fontSize: 18 }} />
              <Typography variant="body2">推定時間: {isNaN(dailyQuota.totalMinutes) ? 0 : Math.round(dailyQuota.totalMinutes / 60 * 10) / 10} 時間</Typography>
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {/* 同時進行科目 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            同時進行科目: {dailyQuota.activeSubjectsCount || dailyQuota.quotaItems.length} 科目
            (最大: {userSettings.maxConcurrentSubjects}科目)
          </Typography>
        </Box>
        
        <List disablePadding>
          {dailyQuota.quotaItems.map((item) => {
            const { hasProgressToday, metQuotaToday } = getCompletionStatus(item);
            return (
            <Paper 
              key={item.subjectId} 
              elevation={1} 
              sx={{ 
                mb: 1,
                p: 1,
                borderLeft: `4px solid ${getPriorityColor(item.priority)}`,
                background: metQuotaToday ? 'rgba(76, 175, 80, 0.1)' : 'inherit',
              }}
            >
              <ListItem disablePadding sx={{ py: 0.5 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1">{item.subjectName}</Typography>
                        {metQuotaToday && (
                          <Tooltip title="今日のノルマ達成">
                            <CheckCircleIcon 
                              color="success" 
                              fontSize="small" 
                              sx={{ ml: 1 }} 
                            />
                          </Tooltip>
                        )}
                        {hasProgressToday && !metQuotaToday && (
                          <Tooltip title="進行中">
                            <Badge 
                              color="warning" 
                              variant="dot" 
                              sx={{ ml: 1 }}
                            >
                              <Typography variant="caption">進行中</Typography>
                            </Badge>
                          </Tooltip>
                        )}
                        {!hasProgressToday && (
                          <Tooltip title="未着手">
                            <Badge 
                              color="error" 
                              variant="dot" 
                              sx={{ ml: 1 }}
                            >
                              <Typography variant="caption">未着手</Typography>
                            </Badge>
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
                          {item.daysRemaining && ` (残り${item.daysRemaining}日)`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.estimatedMinutes} 分
                        </Typography>
                      </Box>
                      
                      {item.daysUntilTarget && (
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            学習完了目標: あと{item.daysUntilTarget}日 (バッファ含む)
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            </Paper>
          )})}
        </List>
        <MaintenanceMessageComponent />
      </CardContent>
    </Card>
  );
};

export default SimpleDailyQuotaCard; 