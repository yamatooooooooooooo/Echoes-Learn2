import React from 'react';
import { Box, Typography, Button, Alert, Paper } from '@mui/material';
import { ReportProblem as ReportProblemIcon } from '@mui/icons-material';

interface ErrorScreenProps {
  message?: string;
  details?: string;
  onRetry?: () => void;
}

/**
 * エラー画面を表示するコンポーネント
 */
export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  message = 'エラーが発生しました',
  details,
  onRetry,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        minHeight: '300px',
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 3,
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <ReportProblemIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h5" component="h2" gutterBottom>
          {message}
        </Typography>

        {details && (
          <Alert severity="error" sx={{ mt: 2, mb: 2, textAlign: 'left' }}>
            {details}
          </Alert>
        )}

        {onRetry && (
          <Button variant="contained" color="primary" onClick={onRetry} sx={{ mt: 2 }}>
            再試行
          </Button>
        )}

        <Button
          variant="outlined"
          color="primary"
          onClick={() => window.location.reload()}
          sx={{ mt: 2, ml: onRetry ? 2 : 0 }}
        >
          ページを更新
        </Button>
      </Paper>
    </Box>
  );
};
