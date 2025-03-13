import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Box,
  Divider,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Progress } from '../../../../domain/models/ProgressModel';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';

interface ProgressDetailDialogProps {
  open: boolean;
  progress: Progress | null;
  onClose: () => void;
  formatDate: (date: string | Date) => string;
}

/**
 * 進捗記録の詳細を表示するダイアログコンポーネント
 */
export const ProgressDetailDialog: React.FC<ProgressDetailDialogProps> = ({
  open,
  progress,
  onClose,
  formatDate
}) => {
  if (!progress) {
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        進捗詳細
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              記録日
            </Typography>
            <Typography variant="body1">
              {formatDate(progress.recordDate)}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Divider />
          </Grid>
          
          <Grid item xs={4}>
            <Typography variant="subtitle2" color="text.secondary">
              開始ページ
            </Typography>
            <Typography variant="body1">
              {progress.startPage}
            </Typography>
          </Grid>
          
          <Grid item xs={4}>
            <Typography variant="subtitle2" color="text.secondary">
              終了ページ
            </Typography>
            <Typography variant="body1">
              {progress.endPage}
            </Typography>
          </Grid>
          
          <Grid item xs={4}>
            <Typography variant="subtitle2" color="text.secondary">
              読了ページ数
            </Typography>
            <Typography variant="body1">
              {progress.pagesRead} ページ
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Divider />
          </Grid>
          
          {progress.studyDuration && progress.studyDuration > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                学習時間
              </Typography>
              <Typography variant="body1">
                {progress.studyDuration} 分
              </Typography>
            </Grid>
          )}
          
          {progress.memo && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                学習メモ
              </Typography>
              <Box sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {progress.memo}
                </Typography>
              </Box>
            </Grid>
          )}
          
          {progress.reportProgress && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                レポート進捗
              </Typography>
              <Box sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {progress.reportProgress}
                </Typography>
              </Box>
            </Grid>
          )}
          
          {progress.satisfactionLevel && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                満足度
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                {progress.satisfactionLevel === 1 && (
                  <>
                    <SentimentDissatisfiedIcon color="error" sx={{ mr: 1 }} />
                    <Typography>不満</Typography>
                  </>
                )}
                {progress.satisfactionLevel === 2 && (
                  <>
                    <SentimentSatisfiedIcon color="warning" sx={{ mr: 1 }} />
                    <Typography>普通</Typography>
                  </>
                )}
                {progress.satisfactionLevel === 3 && (
                  <>
                    <SentimentVerySatisfiedIcon color="success" sx={{ mr: 1 }} />
                    <Typography>満足</Typography>
                  </>
                )}
              </Box>
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Divider />
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              作成日時
            </Typography>
            <Typography variant="body2">
              {formatDate(progress.createdAt)}
            </Typography>
          </Grid>
          
          {progress.updatedAt && (
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                最終更新日時
              </Typography>
              <Typography variant="body2">
                {formatDate(progress.updatedAt)}
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 