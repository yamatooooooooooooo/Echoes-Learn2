import React from 'react';
import {
  Box,
  Button,
  Typography,
  Divider
} from '@mui/material';
import { Subject } from '../../../../domain/models/SubjectModel';

interface QuickProgressProps {
  subject: Subject;
  onAddProgress: (pages: number) => Promise<void>;
  onShowForm: () => void;
}

/**
 * クイック進捗記録ボタンのコンポーネント
 */
export const QuickProgress: React.FC<QuickProgressProps> = ({
  subject,
  onAddProgress,
  onShowForm
}) => {
  // 残りページ数を計算
  const remainingPages = Math.max(0, subject.totalPages - (subject.currentPage || 0));
  const isCompleted = remainingPages === 0;
  
  return (
    <Box sx={{ mt: 2, mb: 3 }}>
      <Typography variant="subtitle2" gutterBottom>
        クイック進捗記録
      </Typography>
      
      {isCompleted ? (
        <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
          この科目は完了しています！
        </Typography>
      ) : (
        <>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => onAddProgress(5)}
              disabled={remainingPages < 5}
            >
              +5ページ
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => onAddProgress(10)}
              disabled={remainingPages < 10}
            >
              +10ページ
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => onAddProgress(20)}
              disabled={remainingPages < 20}
            >
              +20ページ
            </Button>
          </Box>
          
          <Button 
            variant="text" 
            size="small" 
            onClick={onShowForm}
            sx={{ mt: 1 }}
          >
            詳細な進捗を記録
          </Button>
        </>
      )}
      
      <Divider sx={{ mt: 2 }} />
    </Box>
  );
}; 