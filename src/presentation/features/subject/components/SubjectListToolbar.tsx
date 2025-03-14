import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Toolbar,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import { Sort as SortIcon, Info as InfoIcon } from '@mui/icons-material';

// 並び替えの種類
export type SortOption =
  | 'priority-high'
  | 'priority-low'
  | 'exam-date'
  | 'exam-date-asc'
  | 'exam-date-desc'
  | 'name'
  | 'name-asc'
  | 'name-desc'
  | 'progress'
  | 'progress-asc'
  | 'progress-desc';

interface SubjectListToolbarProps {
  sortBy: SortOption;
  onSortChange: (event: SelectChangeEvent<SortOption>) => void;
  autoPriority: boolean;
  onAutoPriorityChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

/**
 * 科目一覧の並び替えオプションと自動優先順位設定を含むツールバーコンポーネント
 */
export const SubjectListToolbar: React.FC<SubjectListToolbarProps> = ({
  sortBy,
  onSortChange,
  autoPriority,
  onAutoPriorityChange,
  disabled = false,
}) => {
  return (
    <Toolbar
      variant="dense"
      sx={{
        mb: 2,
        px: 2,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <SortIcon sx={{ mr: 1, color: 'action.active' }} />
        <Typography variant="body2" sx={{ mr: 2, color: 'text.secondary' }}>
          並び替え:
        </Typography>

        <FormControl variant="standard" size="small" sx={{ minWidth: 200 }}>
          <Select
            value={sortBy}
            onChange={onSortChange}
            displayEmpty
            inputProps={{ 'aria-label': '並び替え' }}
            disabled={disabled}
          >
            <MenuItem value="priority-high">優先度（高い順）</MenuItem>
            <MenuItem value="priority-low">優先度（低い順）</MenuItem>
            <MenuItem value="exam-date">試験日が近い順</MenuItem>
            <MenuItem value="name">科目名順</MenuItem>
            <MenuItem value="progress">進捗率が低い順</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControlLabel
          control={
            <Switch
              checked={autoPriority}
              onChange={onAutoPriorityChange}
              color="primary"
              disabled={disabled}
            />
          }
          label="自動優先順位"
        />
        <Tooltip title="試験日までの日数と残りページ数から自動的に優先順位を計算します">
          <InfoIcon fontSize="small" color="action" sx={{ ml: 0.5 }} />
        </Tooltip>
      </Box>
    </Toolbar>
  );
};
