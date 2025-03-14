import React, { useEffect } from 'react';
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
import { Progress } from '../../../../domain/models/ProgressModel';
import { useProgressForm } from '../hooks/useProgressForm';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ja } from 'date-fns/locale';
import InfoIcon from '@mui/icons-material/Info';
import { calculateProgress } from '../utils/subjectUtils';

interface ProgressFormProps {
  subject?: Subject;
  progress?: Progress;
  open: boolean;
  onClose: () => void;
  onSuccess: (progressId: string) => void;
  isEditMode?: boolean;
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
  isEditMode = false
}) => {
  const {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    handleChange,
    handleDateChange,
    handleSatisfactionChange,
    handleSubmit,
    resetForm,
    setFormDataFromProgress
  } = useProgressForm({
    subject,
    progress,
    isEditMode,
    onSuccess: (progressId) => {
      onSuccess(progressId);
      onClose();
    }
  });

  // 編集モードの場合、フォームデータを設定
  useEffect(() => {
    if (progress && open) {
      setFormDataFromProgress(progress);
    }
  }, [progress, open, setFormDataFromProgress]);

  // ダイアログを閉じるときにフォームをリセット
  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  // クイック入力用の関数
  const handleQuickIncrement = (pages: number) => {
    const newEndPage = Math.min(
      (formData.endPage || 0) + pages,
      subject?.totalPages || Number.MAX_SAFE_INTEGER
    );
    
    handleChange({
      target: {
        name: 'endPage',
        value: newEndPage.toString(),
        type: 'number'
      }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  // クイック入力ボタンを追加します
  const QuickInputButtons = ({ handleQuickIncrement, isSubmitting }: { 
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
  );

  // 日付型の安全な変換のためのヘルパー関数
  const getSafeDate = (dateValue: string | Date | undefined): Date | null => {
    if (!dateValue) return null;
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    return !isNaN(date.getTime()) ? date : null;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="progress-form-dialog-title"
    >
      <DialogTitle id="progress-form-dialog-title" sx={{ m: 0, p: 2 }}>
        {isEditMode ? '進捗記録の編集' : '進捗記録'}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
          disabled={isSubmitting}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {subject && (
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper', mb: 2 }}>
              <Typography variant="body2">
                科目名: {subject.name}
              </Typography>
              <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    現在の進捗:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {subject.currentPage || 0} / {subject.totalPages} ページ
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={calculateProgress(subject.currentPage || 0, subject.totalPages)} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4
                      }
                    }} 
                  />
                </Box>
              </Box>
            </Paper>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
                  <DatePicker
                    label="記録日"
                    value={getSafeDate(formData.recordDate)}
                    onChange={(newDate) => handleDateChange(newDate)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'outlined',
                        error: !!fieldErrors.recordDate,
                        helperText: fieldErrors.recordDate
                      }
                    }}
                  />
                </LocalizationProvider>
              </FormControl>
            </Grid>
            
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
                  inputProps: { min: 0, max: formData.endPage }
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
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                <ToggleButtonGroup
                  value={formData.satisfactionLevel}
                  exclusive
                  onChange={(_, value) => value && handleSatisfactionChange(value)}
                  aria-label="学習満足度"
                  sx={{ width: '100%', justifyContent: 'center' }}
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
              <FormHelperText>学習の質や効率を振り返り、満足度を選択してください</FormHelperText>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="学習メモ"
                name="memo"
                multiline
                rows={3}
                fullWidth
                variant="outlined"
                value={formData.memo || ''}
                onChange={handleChange}
                placeholder="学習内容のメモや、レポートの進捗状況などを記録できます"
                disabled={isSubmitting}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ borderRadius: 1, p: 1, bgcolor: 'background.default', mb: 1 }}>
                読んだページ数: {formData.pagesRead} ページ
              </Box>
            </Grid>
          </Grid>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button
          onClick={handleClose}
          disabled={isSubmitting}
        >
          キャンセル
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          startIcon={isSubmitting && <CircularProgress size={20} color="inherit" />}
        >
          {isEditMode ? '更新する' : '記録する'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 