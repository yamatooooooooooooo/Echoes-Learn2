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
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Grid
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  FilterList as FilterListIcon,
  WarningAmber as WarningIcon
} from '@mui/icons-material';
import { Progress, ProgressUpdateInput } from '../../../../domain/models/ProgressModel';
import { ProgressDetailDialog } from './ProgressDetailDialog';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ja } from 'date-fns/locale';

// フィルタータイプの定義
type FilterType = 'all' | 'week' | 'month';

interface ProgressHistoryProps {
  progressRecords: Progress[];
  loading: boolean;
  error: Error | null;
  onEdit: (progressId: string, progressData: ProgressUpdateInput) => Promise<void>;
  onDelete: (progressId: string) => Promise<void>;
  formatDate: (date: string | Date) => string;
  subjectTotalPages: number;
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
  formatDate,
  subjectTotalPages
}) => {
  // フィルター状態
  const [filter, setFilter] = useState<FilterType>('all');
  // 詳細表示用の状態
  const [selectedProgress, setSelectedProgress] = useState<Progress | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  // 編集用の状態
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProgress, setEditingProgress] = useState<Progress | null>(null);
  const [editFormData, setEditFormData] = useState({
    startPage: 0,
    endPage: 0,
    pagesRead: 0,
    studyDuration: 0,
    satisfactionLevel: 'neutral' as 'good' | 'neutral' | 'bad',
    memo: ''
  });
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});
  
  // 削除確認ダイアログの状態
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProgressId, setDeletingProgressId] = useState<string | null>(null);
  
  // 操作中の状態
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  
  // 編集ダイアログを開く
  const handleOpenEditDialog = (progress: Progress) => {
    setEditingProgress(progress);
    setEditFormData({
      startPage: progress.startPage,
      endPage: progress.endPage,
      pagesRead: progress.pagesRead,
      studyDuration: progress.studyDuration || 0,
      satisfactionLevel: progress.satisfactionLevel || 'neutral',
      memo: progress.memo || ''
    });
    setEditFormErrors({});
    setEditDialogOpen(true);
  };
  
  // 編集フォームの入力変更
  const handleEditFormChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
    const value = e.target.value;
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // エラーをクリア
    if (editFormErrors[field]) {
      setEditFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  
  // 編集フォームのバリデーション
  const validateEditForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (editFormData.startPage < 0) {
      errors.startPage = '開始ページは0以上である必要があります';
    }
    
    if (editFormData.endPage < editFormData.startPage) {
      errors.endPage = '終了ページは開始ページ以上である必要があります';
    }
    
    if (editFormData.endPage > subjectTotalPages) {
      errors.endPage = `終了ページは科目の総ページ数（${subjectTotalPages}）以下である必要があります`;
    }
    
    if (editFormData.pagesRead <= 0) {
      errors.pagesRead = '読了ページ数は1以上である必要があります';
    }
    
    if (editFormData.studyDuration < 0) {
      errors.studyDuration = '学習時間は0以上である必要があります';
    }
    
    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // 編集を保存
  const handleSaveEdit = async () => {
    if (!editingProgress || !validateEditForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const updateData: ProgressUpdateInput = {
        startPage: editFormData.startPage,
        endPage: editFormData.endPage,
        pagesRead: editFormData.pagesRead,
        studyDuration: editFormData.studyDuration || undefined,
        satisfactionLevel: editFormData.satisfactionLevel,
        memo: editFormData.memo || undefined
      };
      
      await onEdit(editingProgress.id!, updateData);
      setEditDialogOpen(false);
    } catch (error) {
      console.error('進捗の更新に失敗しました:', error);
      setEditFormErrors(prev => ({
        ...prev,
        form: '進捗の更新に失敗しました'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 削除ダイアログを開く
  const handleOpenDeleteDialog = (progressId: string) => {
    setDeletingProgressId(progressId);
    setDeleteDialogOpen(true);
  };
  
  // 進捗記録を削除
  const handleConfirmDelete = async () => {
    if (!deletingProgressId) return;
    
    setIsSubmitting(true);
    
    try {
      await onDelete(deletingProgressId);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('進捗の削除に失敗しました:', error);
    } finally {
      setIsSubmitting(false);
    }
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
                            onClick={() => handleOpenEditDialog(progress)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="削除">
                          <IconButton 
                            edge="end" 
                            size="small"
                            onClick={() => handleOpenDeleteDialog(progress.id!)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    }
                    sx={{ 
                      borderBottom: index < records.length - 1 ? '1px dashed' : 'none',
                      borderColor: 'divider',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <React.Fragment>
                          <Typography variant="body2" component="span">
                            {progress.startPage} → {progress.endPage} ページ
                          </Typography>
                          <Chip 
                            label={`${progress.pagesRead}ページ読了`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                          />
                        </React.Fragment>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            component="span"
                          >
                            {progress.studyDuration 
                              ? `${progress.studyDuration}分の学習 · ` 
                              : ''}
                            {progress.satisfactionLevel && (
                              progress.satisfactionLevel === 'good' ? '😊 充実した学習 · ' :
                              progress.satisfactionLevel === 'bad' ? '😔 難しかった · ' :
                              '😐 普通 · '
                            )}
                            {progress.memo && progress.memo.length > 20 
                              ? progress.memo.substring(0, 20) + '...' 
                              : progress.memo}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Box>
        ))}
      </Paper>
      
      {/* 詳細ダイアログ */}
      {selectedProgress && (
        <ProgressDetailDialog 
          open={detailDialogOpen}
          progress={selectedProgress}
          onClose={() => setDetailDialogOpen(false)}
          formatDate={formatDate}
        />
      )}
      
      {/* 編集ダイアログ */}
      <Dialog
        open={editDialogOpen}
        onClose={() => !isSubmitting && setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>進捗記録の編集</DialogTitle>
        <DialogContent>
          {editFormErrors.form && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editFormErrors.form}
            </Alert>
          )}
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              学習日: {editingProgress && formatDate(editingProgress.recordDate)}
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <TextField
                  label="開始ページ"
                  type="number"
                  fullWidth
                  value={editFormData.startPage}
                  onChange={handleEditFormChange('startPage')}
                  error={!!editFormErrors.startPage}
                  helperText={editFormErrors.startPage}
                  disabled={isSubmitting}
                  size="small"
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="終了ページ"
                  type="number"
                  fullWidth
                  value={editFormData.endPage}
                  onChange={handleEditFormChange('endPage')}
                  error={!!editFormErrors.endPage}
                  helperText={editFormErrors.endPage}
                  disabled={isSubmitting}
                  size="small"
                  InputProps={{ inputProps: { min: 0, max: subjectTotalPages } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="読了ページ数"
                  type="number"
                  fullWidth
                  value={editFormData.pagesRead}
                  onChange={handleEditFormChange('pagesRead')}
                  error={!!editFormErrors.pagesRead}
                  helperText={editFormErrors.pagesRead}
                  disabled={isSubmitting}
                  size="small"
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="学習時間（分）"
                  type="number"
                  fullWidth
                  value={editFormData.studyDuration}
                  onChange={handleEditFormChange('studyDuration')}
                  error={!!editFormErrors.studyDuration}
                  helperText={editFormErrors.studyDuration}
                  disabled={isSubmitting}
                  size="small"
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>満足度</InputLabel>
                  <Select
                    value={editFormData.satisfactionLevel}
                    onChange={handleEditFormChange('satisfactionLevel')}
                    label="満足度"
                    disabled={isSubmitting}
                  >
                    <MenuItem value="good">😊 充実した学習</MenuItem>
                    <MenuItem value="neutral">😐 普通</MenuItem>
                    <MenuItem value="bad">😔 難しかった</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="学習メモ"
                  multiline
                  rows={3}
                  fullWidth
                  value={editFormData.memo}
                  onChange={handleEditFormChange('memo')}
                  disabled={isSubmitting}
                  size="small"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditDialogOpen(false)} 
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
          <Button 
            onClick={handleSaveEdit} 
            variant="contained" 
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : '保存'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 削除確認ダイアログ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isSubmitting && setDeleteDialogOpen(false)}
      >
        <DialogTitle>進捗記録の削除</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <WarningIcon color="warning" sx={{ mr: 1 }} />
            <Typography>
              この進捗記録を削除してもよろしいですか？
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            削除した記録は復元できません。また、科目の進捗状況に影響する可能性があります。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            variant="contained" 
            color="error"
            disabled={isSubmitting}
          >
            {isSubmitting ? '削除中...' : '削除'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 