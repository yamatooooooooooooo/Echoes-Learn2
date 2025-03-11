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
  Tooltip
} from '@mui/material';
import { 
  Timer as TimerIcon, 
  MenuBook as BookIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { Subject } from '../../../../domain/models/SubjectModel';
import { DailyQuota } from '../../../../domain/models/QuotaModel';
import { calculateDailyQuota } from '../../../../domain/utils/quotaCalculator';
import { useMaintenanceMessage } from '../../../../hooks/useMaintenanceMessage';
import { useUserSettings } from '../../../../hooks/useUserSettings';

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
  
  // ユーザー設定をコンテキストから取得
  const { userSettings } = useUserSettings();
  
  // メンテナンスメッセージフックを使用
  const { wrapWithMaintenanceMessage, MaintenanceMessageComponent } = useMaintenanceMessage({
    message: '日次ノルマの再計算機能は現在メンテナンス中です。近日中に実装予定です。'
  });
  
  // 科目リストかユーザー設定が変更されたらノルマを再計算
  useEffect(() => {
    // 関数をuseEffect内部で定義して依存関係の問題を解決
    const calculateQuota = () => {
      const quota = calculateDailyQuota(subjects, userSettings);
      setDailyQuota(quota);
    };
    
    if (subjects.length > 0) {
      calculateQuota();
    } else {
      setDailyQuota(null);
    }
  }, [subjects, userSettings]);
  
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
  
  if (isLoading) {
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
              <Typography variant="body2">合計: {dailyQuota.totalPages} ページ</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TimerIcon sx={{ mr: 0.5, fontSize: 18 }} />
              <Typography variant="body2">推定時間: {Math.round(dailyQuota.totalMinutes / 60 * 10) / 10} 時間</Typography>
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {/* 同時進行科目 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            同時進行科目: {dailyQuota.activeSubjectsCount || dailyQuota.quotaItems.length} 科目
            (最大: {userSettings?.maxConcurrentSubjects || 3}科目)
          </Typography>
        </Box>
        
        <List disablePadding>
          {dailyQuota.quotaItems.map((item) => (
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
          ))}
        </List>
        <MaintenanceMessageComponent />
      </CardContent>
    </Card>
  );
};

export default SimpleDailyQuotaCard; 