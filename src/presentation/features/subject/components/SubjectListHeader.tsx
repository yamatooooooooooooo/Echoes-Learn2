import React from 'react';
import { Box, Typography, Button, Tooltip } from '@mui/material';
import { 
  Add as AddIcon, 
  Autorenew as AutorenewIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

interface SubjectListHeaderProps {
  onAddClick: () => void;
  onUpdatePriority: () => void;
  onRecordProgress?: () => void;
  isSubmitting: boolean;
  isPriorityUpdating: boolean;
  autoPriorityEnabled: boolean;
}

/**
 * 科目一覧のヘッダー部分を表示するコンポーネント
 * タイトルと新規科目追加ボタン、優先順位更新ボタン、進捗記録ボタンを含む
 */
export const SubjectListHeader: React.FC<SubjectListHeaderProps> = ({
  onAddClick,
  onUpdatePriority,
  onRecordProgress,
  isSubmitting,
  isPriorityUpdating,
  autoPriorityEnabled
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h5">科目一覧</Typography>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        {onRecordProgress && (
          <Tooltip title="学習の進捗を記録する">
            <Button
              variant="contained"
              color="success"
              startIcon={<TimelineIcon />}
              onClick={onRecordProgress}
              disabled={isSubmitting}
            >
              進捗記録
            </Button>
          </Tooltip>
        )}
        
        <Tooltip title="優先順位を今すぐ再計算">
          <span>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<AutorenewIcon />}
              onClick={onUpdatePriority}
              disabled={isSubmitting || isPriorityUpdating || !autoPriorityEnabled}
              size="small"
            >
              優先順位更新
            </Button>
          </span>
        </Tooltip>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddClick}
          disabled={isSubmitting}
        >
          新しい科目
        </Button>
      </Box>
    </Box>
  );
}; 