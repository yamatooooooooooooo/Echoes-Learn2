import React from 'react';
import { Box, Typography, Button, Tooltip, Badge } from '@mui/material';
import { 
  Add as AddIcon, 
  LibraryBooks as LibraryBooksIcon
} from '@mui/icons-material';

interface SubjectListHeaderProps {
  onAddSubject: () => void;
  totalSubjects: number;
}

/**
 * 科目一覧のヘッダー部分を表示するコンポーネント
 * タイトルと新規科目追加ボタンを含む
 */
export const SubjectListHeader: React.FC<SubjectListHeaderProps> = ({
  onAddSubject,
  totalSubjects
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <LibraryBooksIcon 
          sx={{ 
            mr: 1.5, 
            color: 'primary.main',
            fontSize: '2rem'
          }} 
        />
        <Box>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1.5rem', sm: '1.8rem' }
            }}
          >
            科目管理
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {totalSubjects > 0 
              ? `${totalSubjects}科目登録されています` 
              : '科目を登録して学習を始めましょう'}
          </Typography>
        </Box>
      </Box>
      
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onAddSubject}
        sx={{
          borderRadius: 2,
          px: 2,
          boxShadow: 1
        }}
      >
        新しい科目
      </Button>
    </Box>
  );
}; 