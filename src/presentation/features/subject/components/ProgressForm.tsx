import React, { useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControl,
  LinearProgress,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  FormHelperText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Subject } from '../../../../domain/models/SubjectModel';
import { Progress, ProgressFormData } from '../../../../domain/models/ProgressModel';
import { useProgressForm } from '../hooks/useProgressForm';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ja } from 'date-fns/locale';
import InfoIcon from '@mui/icons-material/Info';
import { calculateProgress } from '../utils/subjectUtils';

// クイック入力ボタンをメモ化されたコンポーネントとして分離
const QuickInputButtons = React.memo(({ handleQuickIncrement, isSubmitting }: { 
  handleQuickIncrement: (pages: number) => void,
  isSubmitting: boolean
}) => (
  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
    <Typography variant="body2" sx={{ color: 'text.secondary', width: '100%', mb: 0.5 }}>
      クイック入力:
    </Typography>
    <Button 
      size="small"
      variant="outlined"
      onClick={() => handleQuickIncrement(1)}
      disabled={isSubmitting}
      sx={{ minWidth: '4rem' }}
    >
      +1ページ
    </Button>
    <Button 
      size="small"
      variant="outlined"
      onClick={() => handleQuickIncrement(5)}
      disabled={isSubmitting}
      sx={{ minWidth: '4rem' }}
    >
      +5ページ
    </Button>
    <Button 
      size="small"
      variant="outlined"
      onClick={() => handleQuickIncrement(10)}
      disabled={isSubmitting}
      sx={{ minWidth: '4rem' }}
    >
      +10ページ
    </Button>
  </Box>
));

// 満足度選択コンポーネントをメモ化
const SatisfactionSelector = React.memo(({ 
  value, 
  onChange, 
  disabled 
}: { 
  value: 'good' | 'neutral' | 'bad' | undefined; 
  onChange: (value: 'good' | 'neutral' | 'bad') => void; 
  disabled: boolean;
}) => (
  <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(_, newValue) => newValue && onChange(newValue)}
      aria-label="学習満足度"
      sx={{ width: '100%', justifyContent: 'center' }}
      disabled={disabled}
    >
      <ToggleButton value="good" aria-label="満足" sx={{ flex: 1 }}>
        <Tooltip title="良い">
          <Box sx={{ textAlign: 'center' }}>
            <SentimentSatisfiedAltIcon color="success" sx={{ fontSize: 32 }} />
            <Typography variant="caption" display="block">良い</Typography>
          </Box>
        </Tooltip>
      </ToggleButton>
      <ToggleButton value="neutral" aria-label="普通" sx={{ flex: 1 }}>
        <Tooltip title="普通">
          <Box sx={{ textAlign: 'center' }}>
            <SentimentNeutralIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="caption" display="block">普通</Typography>
          </Box>
        </Tooltip>
      </ToggleButton>
      <ToggleButton value="bad" aria-label="不満" sx={{ flex: 1 }}>
        <Tooltip title="悪い">
          <Box sx={{ textAlign: 'center' }}>
            <SentimentVeryDissatisfiedIcon color="error" sx={{ fontSize: 32 }} />
            <Typography variant="caption" display="block">悪い</Typography>
          </Box>
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  </Stack>
));

// 科目進捗表示コンポーネントをメモ化
const SubjectProgressDisplay = React.memo(({ subject }: { subject: Subject }) => (
  <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper', mb: 2 }}>
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          {subject.name || '科目名'}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={calculateProgress(subject.currentPage || 0, subject.totalPages || 0)} 
          sx={{ mb: 1, borderRadius: 1 }}
        />
        <Typography variant="caption" color="text.secondary">
          {subject.currentPage || 0}/{subject.totalPages || '?'} ページ
          （{Math.round(calculateProgress(subject.currentPage || 0, subject.totalPages || 0))}%）
        </Typography>
      </Grid>
    </Grid>
  </Paper>
));

interface ProgressFormProps {
  subject?: Subject;
  progress?: Progress;
  open?: boolean;
  onClose?: () => void;
  onSuccess?: (progressId: string) => void;
  isEditMode?: boolean;
  onSubmit?: (data: ProgressFormData) => Promise<void>;
}

/**
 * 進捗記録フォームコンポーネント
 */
export const ProgressForm: React.FC<ProgressFormProps> = ({
  subject,
  progress,
  open,
  onClose,
  onSuccess,
  isEditMode = false,
  onSubmit
}) => {
  // インラインモードかモーダルモードかを判定
  const isInlineMode = onSubmit !== undefined;
  const isModalMode = open !== undefined;

  // カスタムフックを使用
  const {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    handleChange,
    handleDateChange,
    handleSatisfactionChange,
    handleSubmit: formSubmitHandler,
    resetForm,
    setFormDataFromProgress
  } = useProgressForm({
    subject,
    progress,
    isEditMode,
    onSuccess: isModalMode ? (progressId) => {
      if (onSuccess) onSuccess(progressId);
      if (onClose) onClose();
    } : undefined
  });

  // 編集モードの場合、フォームデータを設定
  useEffect(() => {
    if (progress && open) {
      setFormDataFromProgress(progress);
    }
  }, [progress, open, setFormDataFromProgress]);

  // ダイアログを閉じるときにフォームをリセット
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      resetForm();
      onClose?.();
    }
  }, [isSubmitting, resetForm, onClose]);

  // クイック入力ボタンの処理
  const handleQuickIncrement = useCallback((pages: number) => {
    const nextPage = Math.min(
      (subject?.totalPages || 999999),
      (formData.startPage || 0) + pages - 1
    );
    
    // 通常のhandleChangeは使用せず、直接formDataを更新
    // フォームデータを直接更新する関数がカスタムフックから提供されていないため、
    // 代わりにhandleSatisfactionChange関数を参考に実装
    const newPagesRead = (nextPage - (formData.startPage || 0)) + 1;
    
    // ページ数の更新
    handleChange({
      target: {
        name: 'endPage',
        value: nextPage.toString(),
        type: 'text'
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>);
    
    // 読了ページ数の更新
    handleChange({
      target: {
        name: 'pagesRead',
        value: newPagesRead.toString(),
        type: 'text'
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  }, [formData, subject, handleChange]);

  // 日付型の安全な変換のためのヘルパー関数
  const getSafeDate = useCallback((dateValue: string | Date | undefined): Date | null => {
    if (!dateValue) return null;
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    return !isNaN(date.getTime()) ? date : null;
  }, []);

  // フォームの提出処理
  const handleSubmitForm = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isInlineMode && onSubmit) {
      // インラインモードの場合、親コンポーネントのonSubmit関数を呼び出す
      await onSubmit(formData as unknown as ProgressFormData);
      resetForm();
    } else {
      // モーダルモードの場合、フックのhandleSubmitを呼び出す
      await formSubmitHandler(e);
    }
  }, [isInlineMode, onSubmit, formData, resetForm, formSubmitHandler]);

  // フォーム送信のトリガー
  const triggerFormSubmit = useCallback(() => {
    const formElement = document.querySelector('form');
    if (formElement) {
      formElement.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  }, []);

  // フォームコンテンツのメモ化
  const renderFormContent = useMemo(() => (
    <Box component="form" onSubmit={handleSubmitForm} sx={{ mt: 1 }} id="progress-form">
      {subject && <SubjectProgressDisplay subject={subject} />}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={2}>
        {/* 日付選択 */}
        <Grid item xs={12}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
            <DatePicker
              label="記録日"
              value={getSafeDate(formData.recordDate)}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: "outlined",
                  error: !!fieldErrors.recordDate,
                  helperText: fieldErrors.recordDate,
                  disabled: isSubmitting,
                  InputProps: {
                    sx: { fontSize: { xs: '1.1rem', sm: '1rem' } }
                  }
                }
              }}
            />
          </LocalizationProvider>
        </Grid>
        
        {/* ページ入力フィールド */}
        <Grid item xs={6}>
          <TextField
            label="開始ページ"
            name="startPage"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.startPage}
            onChange={handleChange}
            error={!!fieldErrors.startPage}
            helperText={fieldErrors.startPage}
            disabled={isSubmitting}
            InputProps={{
              inputProps: { min: 0 }
            }}
            sx={{ '& input': { fontSize: { xs: '1.1rem', sm: '1rem' } } }}
          />
        </Grid>
        
        <Grid item xs={6}>
          <TextField
            label="終了ページ"
            name="endPage"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.endPage}
            onChange={handleChange}
            error={!!fieldErrors.endPage}
            helperText={fieldErrors.endPage}
            disabled={isSubmitting}
            InputProps={{
              inputProps: { min: formData.startPage }
            }}
            sx={{ '& input': { fontSize: { xs: '1.1rem', sm: '1rem' } } }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <QuickInputButtons 
            handleQuickIncrement={handleQuickIncrement}
            isSubmitting={isSubmitting}
          />
        </Grid>

        {/* 学習時間入力フィールド */}
        <Grid item xs={12}>
          <TextField
            label="学習時間（分）"
            name="studyDuration"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.studyDuration || ''}
            onChange={handleChange}
            error={!!fieldErrors.studyDuration}
            helperText={fieldErrors.studyDuration || '学習時間を分単位で入力してください'}
            disabled={isSubmitting}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccessTimeIcon />
                </InputAdornment>
              ),
              inputProps: { min: 0, max: 1440 }
            }}
          />
        </Grid>
        
        {/* 満足度選択 */}
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            今回の学習の満足度:
          </Typography>
          <SatisfactionSelector 
            value={formData.satisfactionLevel}
            onChange={handleSatisfactionChange}
            disabled={isSubmitting}
          />
        </Grid>
        
        {/* メモ入力フィールド */}
        <Grid item xs={12}>
          <TextField
            label="学習メモ"
            name="memo"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={formData.memo || ''}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="今日の学習の振り返りや気づいたことを記録しましょう..."
          />
        </Grid>
        
        {/* インラインモードの場合のみ、ここに送信ボタンを表示 */}
        {isInlineMode && (
          <Grid item xs={12}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              startIcon={isSubmitting && <CircularProgress size={24} />}
            >
              {isSubmitting ? '送信中...' : '進捗を記録'}
            </Button>
          </Grid>
        )}
      </Grid>
    </Box>
  ), [
    subject, 
    error, 
    formData, 
    fieldErrors, 
    handleChange, 
    handleDateChange, 
    handleSatisfactionChange, 
    handleSubmitForm, 
    handleQuickIncrement, 
    getSafeDate, 
    isSubmitting, 
    isInlineMode
  ]);

  // モーダルモードの場合はダイアログとしてレンダリング
  if (isModalMode) {
    return (
      <Dialog 
        open={open === true} 
        onClose={handleClose} 
        fullWidth 
        maxWidth="sm"
        scroll="paper"
      >
        <DialogTitle>
          {isEditMode ? '進捗記録を編集' : '新しい進捗を記録'}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          {renderFormContent}
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={handleClose} 
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            form="progress-form" 
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            startIcon={isSubmitting && <CircularProgress size={24} />}
            onClick={triggerFormSubmit}
          >
            {isSubmitting ? '送信中...' : isEditMode ? '更新する' : '記録する'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
  
  // インラインモードの場合はフォームを直接レンダリング
  return renderFormContent;
}; 