import React, { useState, useMemo, useCallback, memo } from 'react';
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
  FilterList as FilterListIcon,
  AccessTime as AccessTimeIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import { Progress } from '../../../../domain/models/ProgressModel';
import { ProgressDetailDialog } from './ProgressDetailDialog';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
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

// 進捗リストアイテムを別コンポーネントとして分離しメモ化
const ProgressListItem = memo(({
  progress,
  onShowDetails,
  onEdit,
  onDelete,
  isLast
}: {
  progress: Progress;
  onShowDetails: (progress: Progress) => void;
  onEdit: (progress: Progress) => void;
  onDelete: (progressId: string) => void;
  isLast: boolean;
}) => {
  // より効率的なレンダリングのためにコンポーネント分離

  // 満足度アイコン選択ヘルパー - 静的関数として定義
  const getSatisfactionIcon = (level?: number) => {
    if (!level) return null;
    
    if (level === 1) {
      return <SentimentDissatisfiedIcon fontSize="small" color="error" />;
    } else if (level === 2) {
      return <SentimentSatisfiedIcon fontSize="small" color="warning" />;
    } else {
      return <SentimentVerySatisfiedIcon fontSize="small" color="success" />;
    }
  };

  // 満足度テキスト選択ヘルパー
  const getSatisfactionText = (level?: number) => {
    if (!level) return "";
    return level === 1 ? "不満" : level === 2 ? "普通" : "満足";
  };

  return (
    <React.Fragment>
      <ListItem
        secondaryAction={
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="詳細">
              <IconButton 
                edge="end" 
                size="small" 
                onClick={() => onShowDetails(progress)}
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
              
              {/* 学習時間があれば表示 */}
              {progress.studyDuration && progress.studyDuration > 0 && (
                <Tooltip title={`学習時間: ${progress.studyDuration}分`}>
                  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', ml: 1 }}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="caption" sx={{ ml: 0.5 }}>
                      {progress.studyDuration}分
                    </Typography>
                  </Box>
                </Tooltip>
              )}
              
              {/* レポート進捗があれば表示 */}
              {progress.reportProgress && (
                <Tooltip title="レポート進捗あり">
                  <AssignmentIcon 
                    fontSize="small" 
                    color="secondary" 
                    sx={{ ml: 1 }} 
                  />
                </Tooltip>
              )}
              
              {/* 満足度があれば表示 */}
              {progress.satisfactionLevel && (
                <Tooltip title={getSatisfactionText(progress.satisfactionLevel)}>
                  <Box component="span" sx={{ ml: 1 }}>
                    {getSatisfactionIcon(progress.satisfactionLevel)}
                  </Box>
                </Tooltip>
              )}
            </Box>
          }
          secondary={
            <Box>
              {progress.memo && (
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
                  学習メモ: {progress.memo}
                </Typography>
              )}
              {progress.reportProgress && (
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    mt: progress.memo ? 0.5 : 0
                  }}
                >
                  レポート: {progress.reportProgress}
                </Typography>
              )}
            </Box>
          }
        />
      </ListItem>
      {!isLast && <Divider component="li" />}
    </React.Fragment>
  );
});

// 日付グループコンポーネントをメモ化
const DateGroup = memo(({
  dateStr,
  records,
  onShowDetails,
  onEdit,
  onDelete,
  isLastGroup,
  formatDateHeading
}: {
  dateStr: string;
  records: Progress[];
  onShowDetails: (progress: Progress) => void;
  onEdit: (progress: Progress) => void;
  onDelete: (progressId: string) => void;
  isLastGroup: boolean;
  formatDateHeading: (dateStr: string) => string;
}) => {
  return (
    <Box>
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
          {formatDateHeading(dateStr)}
        </Typography>
      </Box>
      
      {/* その日の進捗リスト */}
      <List dense disablePadding>
        {records.map((progress, index) => (
          <ProgressListItem
            key={progress.id || index}
            progress={progress}
            onShowDetails={onShowDetails}
            onEdit={onEdit}
            onDelete={onDelete}
            isLast={index === records.length - 1}
          />
        ))}
      </List>
      
      {/* 日付区切り（最後の日付以外） */}
      {!isLastGroup && (
        <Divider />
      )}
    </Box>
  );
});

// 日付フォーマットのヘルパー関数 - メモリ使用を最適化
const formatDateString = (dateStr: string): string => {
  try {
    return format(parseISO(dateStr), 'yyyy年M月d日（EEE）', { locale: ja });
  } catch (e) {
    return dateStr;
  }
};

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
  const handleFilterChange = useCallback((
    _event: React.MouseEvent<HTMLElement>,
    newFilter: FilterType | null
  ) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  }, []);

  // 詳細表示ハンドラー
  const handleShowDetails = useCallback((progress: Progress) => {
    setSelectedProgress(progress);
    setDetailDialogOpen(true);
  }, []);

  // 現在の日付における週と月の範囲を計算 - 日付フィルターで使用
  const dateRanges = useMemo(() => {
    const now = new Date();
    return {
      weekStart: startOfWeek(now, { weekStartsOn: 1 }),
      weekEnd: endOfWeek(now, { weekStartsOn: 1 }),
      monthStart: startOfMonth(now),
      monthEnd: endOfMonth(now)
    };
  }, []);

  // 日付でソートされたフィルター済みの進捗記録
  const filteredAndSortedProgress = useMemo(() => {
    // フィルタリング
    let filtered = [...progressRecords];
    if (filter === 'week') {
      filtered = progressRecords.filter(progress => {
        const recordDate = new Date(progress.recordDate);
        return isWithinInterval(recordDate, { 
          start: dateRanges.weekStart, 
          end: dateRanges.weekEnd 
        });
      });
    } else if (filter === 'month') {
      filtered = progressRecords.filter(progress => {
        const recordDate = new Date(progress.recordDate);
        return isWithinInterval(recordDate, { 
          start: dateRanges.monthStart, 
          end: dateRanges.monthEnd 
        });
      });
    }

    // 日付でソート（新しい順）
    return filtered.sort((a, b) => {
      const dateA = new Date(a.recordDate).getTime();
      const dateB = new Date(b.recordDate).getTime();
      return dateB - dateA;
    });
  }, [progressRecords, filter, dateRanges]);

  // 日付ごとにグループ化（タイムライン表示用）
  const progressByDate = useMemo(() => {
    const grouped: Record<string, Progress[]> = {};
    
    filteredAndSortedProgress.forEach(progress => {
      const dateStr = typeof progress.recordDate === 'string' 
        ? progress.recordDate.split('T')[0] // T以降は時間部分なので除去
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

  // 日付のエントリ配列
  const dateEntries = Object.entries(progressByDate);

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

      {/* タイムライン表示 - メモ化されたコンポーネントを使用 */}
      <Paper variant="outlined">
        {/* 件数表示 */}
        <Box sx={{ p: 2, bgcolor: 'background.default', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2">
            {filter === 'all' ? '全期間' : filter === 'week' ? '今週' : '今月'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            合計: {filteredAndSortedProgress.length}件
          </Typography>
        </Box>
        
        {dateEntries.map(([dateStr, records], dateIndex) => (
          <DateGroup
            key={dateStr}
            dateStr={dateStr}
            records={records}
            onShowDetails={handleShowDetails}
            onEdit={onEdit}
            onDelete={onDelete}
            isLastGroup={dateIndex === dateEntries.length - 1}
            formatDateHeading={formatDateString}
          />
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