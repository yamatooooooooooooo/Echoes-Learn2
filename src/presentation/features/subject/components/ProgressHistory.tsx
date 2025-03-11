import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Tooltip,
  CircularProgress,
  Paper,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Stack
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { Progress } from '../../../../domain/models/ProgressModel';
import { ProgressDetailDialog } from './ProgressDetailDialog';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ja } from 'date-fns/locale';

// フィルタータイプの定義
type FilterType = 'all' | 'week' | 'month';

interface ProgressHistoryProps {
  progressRecords: Progress[];
  loading: boolean;
  error: Error | null;
  onEdit: (progress: Progress) => void;
  onDelete: (progressId: string) => void;
  formatDate: (date: string | Date) => string;
}

/**
 * 進捗履歴をタイムライン形式で表示し、フィルタリング機能を提供するコンポーネント
 */
export const ProgressHistory: React.FC<ProgressHistoryProps> = ({
  progressRecords,
  loading,
  error,
  onEdit,
  onDelete,
  formatDate
}) => {
  // フィルター状態
  const [filter, setFilter] = useState<FilterType>('all');
  // 詳細表示用の状態
  const [selectedProgress, setSelectedProgress] = useState<Progress | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // フィルター変更ハンドラー
  const handleFilterChange = (
    _event: React.MouseEvent<HTMLElement>,
    newFilter: FilterType | null
  ) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  // 詳細表示ハンドラー
  const handleShowDetails = (progress: Progress) => {
    setSelectedProgress(progress);
    setDetailDialogOpen(true);
  };

  // 日付でソートされたフィルター済みの進捗記録
  const filteredAndSortedProgress = useMemo(() => {
    // 現在の日付を基準に計算
    const now = new Date();
    // 週の開始と終了
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // 月曜始まり
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    // 月の開始と終了
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // フィルタリング
    let filtered = [...progressRecords];
    if (filter === 'week') {
      filtered = progressRecords.filter(progress => {
        const recordDate = new Date(progress.recordDate);
        return isWithinInterval(recordDate, { start: weekStart, end: weekEnd });
      });
    } else if (filter === 'month') {
      filtered = progressRecords.filter(progress => {
        const recordDate = new Date(progress.recordDate);
        return isWithinInterval(recordDate, { start: monthStart, end: monthEnd });
      });
    }

    // 日付でソート（新しい順）
    return filtered.sort((a, b) => {
      const dateA = new Date(a.recordDate).getTime();
      const dateB = new Date(b.recordDate).getTime();
      return dateB - dateA;
    });
  }, [progressRecords, filter]);

  // 日付ごとにグループ化（タイムライン表示用）
  const progressByDate = useMemo(() => {
    const grouped: Record<string, Progress[]> = {};
    
    filteredAndSortedProgress.forEach(progress => {
      const dateStr = typeof progress.recordDate === 'string' 
        ? progress.recordDate 
        : format(progress.recordDate, 'yyyy-MM-dd');
      
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      
      grouped[dateStr].push(progress);
    });
    
    return grouped;
  }, [filteredAndSortedProgress]);

  // 読み込み中表示
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  // エラー表示
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        進捗記録の取得中にエラーが発生しました: {error.message}
      </Alert>
    );
  }

  // 進捗記録なし
  if (!progressRecords || progressRecords.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          まだ進捗記録がありません
        </Typography>
      </Box>
    );
  }

  // フィルター後のデータがない場合
  if (Object.keys(progressByDate).length === 0) {
    return (
      <Box>
        {/* フィルターUI */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={handleFilterChange}
            size="small"
            aria-label="進捗フィルター"
          >
            <ToggleButton value="all" aria-label="全期間">
              全期間
            </ToggleButton>
            <ToggleButton value="week" aria-label="今週">
              今週
            </ToggleButton>
            <ToggleButton value="month" aria-label="今月">
              今月
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            選択した期間の進捗記録はありません
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* フィルターUI */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={handleFilterChange}
          size="small"
          aria-label="進捗フィルター"
        >
          <ToggleButton value="all" aria-label="全期間">
            全期間
          </ToggleButton>
          <ToggleButton value="week" aria-label="今週">
            今週
          </ToggleButton>
          <ToggleButton value="month" aria-label="今月">
            今月
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* タイムライン表示 */}
      <Paper variant="outlined">
        {Object.entries(progressByDate).map(([dateStr, records], dateIndex) => (
          <Box key={dateStr}>
            {/* 日付ヘッダー */}
            <Box 
              sx={{ 
                p: 1.5, 
                bgcolor: 'background.default',
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="subtitle2">
                {format(new Date(dateStr), 'yyyy年M月d日（EEE）', { locale: ja })}
              </Typography>
            </Box>
            
            {/* その日の進捗リスト */}
            <List dense disablePadding>
              {records.map((progress, index) => (
                <React.Fragment key={progress.id || index}>
                  <ListItem
                    secondaryAction={
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="詳細">
                          <IconButton 
                            edge="end" 
                            size="small" 
                            onClick={() => handleShowDetails(progress)}
                          >
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="編集">
                          <IconButton 
                            edge="end" 
                            size="small" 
                            onClick={() => onEdit(progress)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="削除">
                          <IconButton 
                            edge="end" 
                            size="small" 
                            onClick={() => onDelete(progress.id || '')}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    }
                    sx={{ py: 1 }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, mr: 1 }}>
                            {progress.startPage} → {progress.endPage}
                          </Typography>
                          <Chip 
                            label={`${progress.pagesRead}ページ`} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        progress.memo ? (
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {progress.memo}
                          </Typography>
                        ) : null
                      }
                    />
                  </ListItem>
                  {index < records.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
            
            {/* 日付区切り（最後の日付以外） */}
            {dateIndex < Object.keys(progressByDate).length - 1 && (
              <Divider />
            )}
          </Box>
        ))}
      </Paper>
      
      {/* 進捗詳細ダイアログ */}
      <ProgressDetailDialog
        open={detailDialogOpen}
        progress={selectedProgress}
        onClose={() => setDetailDialogOpen(false)}
        formatDate={formatDate}
      />
    </Box>
  );
}; 