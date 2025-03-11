import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Tooltip,
  CircularProgress,
  Paper,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Progress } from '../../../../domain/models/ProgressModel';

interface ProgressListProps {
  progressRecords: Progress[];
  loading: boolean;
  error: Error | null;
  onEdit: (progress: Progress) => void;
  onDelete: (progressId: string) => void;
  formatDate: (date: string | Date) => string;
}

/**
 * 進捗履歴を表示するコンポーネント
 */
export const ProgressList: React.FC<ProgressListProps> = ({
  progressRecords,
  loading,
  error,
  onEdit,
  onDelete,
  formatDate
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        進捗記録の取得中にエラーが発生しました: {error.message}
      </Alert>
    );
  }

  if (!progressRecords || progressRecords.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          まだ進捗記録がありません
        </Typography>
      </Box>
    );
  }

  return (
    <Paper variant="outlined" sx={{ mt: 2 }}>
      <Box sx={{ p: 2, pb: 0 }}>
        <Typography variant="subtitle2" gutterBottom>
          進捗履歴
        </Typography>
      </Box>
      <List dense sx={{ width: '100%' }}>
        {progressRecords.map((progress, index) => (
          <React.Fragment key={progress.id || index}>
            <ListItem
              secondaryAction={
                <Box>
                  <Tooltip title="編集">
                    <IconButton 
                      edge="end" 
                      size="small" 
                      onClick={() => onEdit(progress)}
                      sx={{ mr: 0.5 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="削除">
                    <IconButton 
                      edge="end" 
                      size="small" 
                      onClick={() => onDelete(progress.id || '')}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <ListItemText
                primary={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatDate(progress.recordDate)}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {progress.startPage} → {progress.endPage} ページ ({progress.pagesRead}ページ)
                  </Typography>
                }
              />
            </ListItem>
            {index < progressRecords.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
}; 