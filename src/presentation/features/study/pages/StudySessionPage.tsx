import React from 'react';
import { Box, Typography, Alert, Button } from '@mui/material';
import { useNavigation } from '../../../../App';

/**
 * 学習セッションページ（メンテナンス中）
 */
const StudySessionPage: React.FC = () => {
  const { navigateTo } = useNavigation();
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>学習セッション</Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        この機能は現在メンテナンス中です。近日中に実装予定です。
      </Alert>
      <Button 
        variant="contained" 
        onClick={() => navigateTo('dashboard')}
      >
        ダッシュボードに戻る
      </Button>
    </Box>
  );
};

export default StudySessionPage; 