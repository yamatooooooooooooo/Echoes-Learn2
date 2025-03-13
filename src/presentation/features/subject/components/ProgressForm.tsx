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
  ToggleButtonGroup,
  ToggleButton,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Subject } from '../../../../domain/models/SubjectModel';
import { Progress } from '../../../../domain/models/ProgressModel';
import { useProgressForm } from '../hooks/useProgressForm';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ja } from 'date-fns/locale';
import InfoIcon from '@mui/icons-material/Info';
import { calculateProgress } from '../utils/subjectUtils';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';

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
    <Box sx={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: 1,
      my: 2
    }}>
      <Typography variant="body2" color="text.secondary" sx={{ width: '100%', mb: 0.5 }}>
        クイック入力:
      </Typography>
      {[1, 5, 10, 20, 50].map(pages => (
        <Button 
          key={pages} 
          variant="outlined" 
          size="small"
          onClick={() => handleQuickIncrement(pages)}
          disabled={isSubmitting}
          sx={{ 
            minWidth: { xs: '60px', sm: '48px' },
            minHeight: { xs: '48px', sm: '36px' },
            borderRadius: 2,
            fontWeight: 'bold'
          }}
        >
          +{pages}
        </Button>
      ))}
    </Box>
  );

  // 日付入力値の安全な変換
  const getSafeDate = (dateValue: string | Date | undefined): Date => {
    if (!dateValue) return new Date();
    
    try {
      // 文字列の場合は日付オブジェクトに変換
      if (typeof dateValue === 'string') {
        const parsedDate = new Date(dateValue);
        // 不正な日付の場合は今日の日付を返す
        return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
      }
      // 日付オブジェクトの場合はそのまま返す
      return dateValue;
    } catch (e) {
      // 変換エラーの場合は今日の日付を返す
      return new Date();
    }
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
            
            <Grid item xs={12}>
              <TextField
                label="学習メモ"
                name="memo"
                multiline
                rows={2}
                fullWidth
                variant="outlined"
                value={formData.memo || ''}
                onChange={handleChange}
                error={!!fieldErrors.memo}
                helperText={fieldErrors.memo}
                disabled={isSubmitting}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="レポート進捗"
                name="reportProgress"
                multiline
                rows={2}
                fullWidth
                variant="outlined"
                value={formData.reportProgress || ''}
                onChange={handleChange}
                error={!!fieldErrors.reportProgress}
                helperText={fieldErrors.reportProgress || 'どこまで進めたかなどのメモを残せます'}
                disabled={isSubmitting}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="学習時間 (分)"
                name="studyDuration"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.studyDuration || ''}
                onChange={handleChange}
                error={!!fieldErrors.studyDuration}
                helperText={fieldErrors.studyDuration || '学習効率の分析に活用されます'}
                InputProps={{
                  endAdornment: <InputAdornment position="end">分</InputAdornment>,
                  inputProps: { min: 0, max: 1440 }
                }}
                disabled={isSubmitting}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                mb: 1,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                p: 2
              }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  学習の満足度 (学習効率の分析に活用されます)
                </Typography>
                
                <ToggleButtonGroup
                  value={String(formData.satisfactionLevel || 2)}
                  exclusive
                  onChange={(e, newValue) => {
                    if (newValue !== null) {
                      handleChange({
                        target: {
                          name: 'satisfactionLevel',
                          value: newValue,
                          type: 'number'
                        }
                      } as React.ChangeEvent<HTMLInputElement>);
                    }
                  }}
                  aria-label="満足度"
                  sx={{ mt: 1, justifyContent: 'center' }}
                  disabled={isSubmitting}
                >
                  <ToggleButton value="1" aria-label="不満">
                    <Tooltip title="不満">
                      <SentimentDissatisfiedIcon 
                        fontSize="large"
                        sx={{ 
                          color: (theme) => 
                            String(formData.satisfactionLevel) === "1" 
                              ? theme.palette.error.main 
                              : 'inherit' 
                        }}
                      />
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value="2" aria-label="普通">
                    <Tooltip title="普通">
                      <SentimentSatisfiedIcon 
                        fontSize="large"
                        sx={{ 
                          color: (theme) => 
                            String(formData.satisfactionLevel) === "2" 
                              ? theme.palette.warning.main 
                              : 'inherit' 
                        }}
                      />
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value="3" aria-label="満足">
                    <Tooltip title="満足">
                      <SentimentVerySatisfiedIcon 
                        fontSize="large"
                        sx={{ 
                          color: (theme) => 
                            String(formData.satisfactionLevel) === "3" 
                              ? theme.palette.success.main 
                              : 'inherit' 
                        }}
                      />
                    </Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>
                
                {fieldErrors.satisfactionLevel && (
                  <Typography variant="caption" color="error.main" sx={{ mt: 1 }}>
                    {fieldErrors.satisfactionLevel}
                  </Typography>
                )}
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