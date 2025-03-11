import React from 'react';
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
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Subject } from '../../../../domain/models/SubjectModel';
import { useProgressForm } from '../hooks/useProgressForm';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ja } from 'date-fns/locale';

interface ProgressFormProps {
  subject: Subject;
  open: boolean;
  onClose: () => void;
  onSuccess: (progressId: string) => void;
}

/**
 * 進捗記録フォームコンポーネント
 */
export const ProgressForm: React.FC<ProgressFormProps> = ({
  subject,
  open,
  onClose,
  onSuccess
}) => {
  const {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    handleChange,
    handleDateChange,
    handleSubmit,
    resetForm
  } = useProgressForm({
    subject,
    onSuccess: (progressId) => {
      onSuccess(progressId);
      onClose();
    }
  });

  // ダイアログを閉じるときにフォームをリセット
  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
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
        進捗記録
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
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper', mb: 2 }}>
            <Typography variant="body2">
              科目名: {subject.name}
            </Typography>
            <Typography variant="body2">
              現在のページ: {subject.currentPage || 0} / {subject.totalPages} ページ
            </Typography>
          </Paper>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
                <DatePicker
                  label="記録日"
                  value={formData.recordDate ? new Date(formData.recordDate) : null}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: "dense",
                      size: "small",
                      error: !!fieldErrors.recordDate,
                      helperText: fieldErrors.recordDate
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                label="開始ページ"
                type="number"
                name="startPage"
                value={formData.startPage}
                onChange={handleChange}
                fullWidth
                margin="dense"
                size="small"
                error={!!fieldErrors.startPage}
                helperText={fieldErrors.startPage}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                label="終了ページ"
                type="number"
                name="endPage"
                value={formData.endPage}
                onChange={handleChange}
                fullWidth
                margin="dense"
                size="small"
                error={!!fieldErrors.endPage}
                helperText={fieldErrors.endPage}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="学習時間（分）"
                type="number"
                name="studyDuration"
                value={formData.studyDuration}
                onChange={handleChange}
                fullWidth
                margin="dense"
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">分</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="メモ"
                name="memo"
                value={formData.memo || ''}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                margin="dense"
                size="small"
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
          記録する
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 