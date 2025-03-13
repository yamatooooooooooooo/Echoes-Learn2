import React, { memo, useMemo } from 'react';
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

// 満足度インジケーターを分離してメモ化
const SatisfactionIndicator = memo(({ level }: { level?: number }) => {
  if (!level) return null;

  switch (level) {
    case 1:
      return (
        <>
          <SentimentDissatisfiedIcon color="error" sx={{ mr: 1 }} />
          <Typography>不満</Typography>
        </>
      );
    case 2:
      return (
        <>
          <SentimentSatisfiedIcon color="warning" sx={{ mr: 1 }} />
          <Typography>普通</Typography>
        </>
      );
    case 3:
      return (
        <>
          <SentimentVerySatisfiedIcon color="success" sx={{ mr: 1 }} />
          <Typography>満足</Typography>
        </>
      );
    default:
      return null;
  }
});

// ダイアログ内の詳細情報セクションをメモ化
const ProgressDetails = memo(({ progress, formatDate }: { progress: Progress, formatDate: (date: string | Date) => string }) => {
  // 進捗詳細の表示データをメモ化
  const formattedData = useMemo(() => ({
    recordDate: formatDate(progress.recordDate),
    startPage: progress.startPage,
    endPage: progress.endPage,
    pagesRead: progress.pagesRead,
    studyDuration: progress.studyDuration,
    memo: progress.memo,
    reportProgress: progress.reportProgress,
    satisfactionLevel: progress.satisfactionLevel,
    createdAt: formatDate(progress.createdAt),
    updatedAt: progress.updatedAt ? formatDate(progress.updatedAt) : null
  }), [progress, formatDate]);
  
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="subtitle2" color="text.secondary">
          記録日
        </Typography>
        <Typography variant="body1">
          {formattedData.recordDate}
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
          {formattedData.startPage}
        </Typography>
      </Grid>
      
      <Grid item xs={4}>
        <Typography variant="subtitle2" color="text.secondary">
          終了ページ
        </Typography>
        <Typography variant="body1">
          {formattedData.endPage}
        </Typography>
      </Grid>
      
      <Grid item xs={4}>
        <Typography variant="subtitle2" color="text.secondary">
          読了ページ数
        </Typography>
        <Typography variant="body1">
          {formattedData.pagesRead} ページ
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <Divider />
      </Grid>
      
      {formattedData.studyDuration && formattedData.studyDuration > 0 && (
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="text.secondary">
            学習時間
          </Typography>
          <Typography variant="body1">
            {formattedData.studyDuration} 分
          </Typography>
        </Grid>
      )}
      
      {formattedData.memo && (
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="text.secondary">
            学習メモ
          </Typography>
          <Box sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {formattedData.memo}
            </Typography>
          </Box>
        </Grid>
      )}
      
      {formattedData.reportProgress && (
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="text.secondary">
            レポート進捗
          </Typography>
          <Box sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {formattedData.reportProgress}
            </Typography>
          </Box>
        </Grid>
      )}
      
      {formattedData.satisfactionLevel && (
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="text.secondary">
            満足度
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <SatisfactionIndicator level={formattedData.satisfactionLevel} />
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
          {formattedData.createdAt}
        </Typography>
      </Grid>
      
      {formattedData.updatedAt && (
        <Grid item xs={6}>
          <Typography variant="subtitle2" color="text.secondary">
            最終更新日時
          </Typography>
          <Typography variant="body2">
            {formattedData.updatedAt}
          </Typography>
        </Grid>
      )}
    </Grid>
  );
});

/**
 * 進捗記録の詳細を表示するダイアログコンポーネント
 */
export const ProgressDetailDialog = memo<ProgressDetailDialogProps>(({
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
        <ProgressDetails progress={progress} formatDate={formatDate} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
}); 