import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingScreenProps {
  message?: string;
}

/**
 * 読み込み中の画面を表示するコンポーネント
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = '読み込み中...' }) => {
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
      <CircularProgress size={40} thickness={4} />
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Box>
  );
};
