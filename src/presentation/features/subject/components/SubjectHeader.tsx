import React from 'react';
import { Typography, Box, Chip, IconButton } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import { getStatusColor } from '../utils/subjectUtils';
import { Subject } from '../../../../domain/models/SubjectModel';

interface SubjectHeaderProps {
  subject: Subject;
  daysRemaining: number | null;
  progress: number;
  expanded: boolean;
  onExpandClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  formatDate: (date: Date | string | undefined) => string;
}

/**
 * 科目カードのヘッダー部分を表示するコンポーネント
 */
export const SubjectHeader: React.FC<SubjectHeaderProps> = ({
  subject,
  daysRemaining,
  progress,
  expanded,
  onExpandClick,
  onEdit,
  onDelete,
  formatDate,
}) => {
  // 優先度に対応する色とラベル
  const getPriorityColor = (priority?: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityLabel = (priority?: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
      default:
        return '未設定';
    }
  };

  return (
    <Box>
      <Box
        sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: '1rem',
            color: '#37352f',
            lineHeight: 1.3,
            flexGrow: 1,
            pr: 6, // 右側のボタン用にスペースを空ける
          }}
        >
          {subject?.name || 'タイトルなし'}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 0.5,
          mb: 1.5,
        }}
      >
        {daysRemaining !== null && (
          <Chip
            label={`あと${daysRemaining}日`}
            size="small"
            color={daysRemaining <= 7 ? 'error' : daysRemaining <= 14 ? 'warning' : 'default'}
            variant="outlined"
            sx={{
              height: '20px',
              fontSize: '0.7rem',
              fontWeight: 500,
            }}
          />
        )}

        <Chip
          label={getPriorityLabel(subject.priority)}
          size="small"
          color={getPriorityColor(subject.priority)}
          variant="outlined"
          sx={{
            height: '20px',
            fontSize: '0.7rem',
            fontWeight: 500,
          }}
        />

        <Chip
          label={`${subject.currentPage || 0}/${subject.totalPages} ページ`}
          size="small"
          variant="outlined"
          sx={{
            height: '20px',
            fontSize: '0.7rem',
            fontWeight: 500,
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
        <IconButton
          onClick={onExpandClick}
          size="small"
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s',
            height: 24,
            width: 24,
          }}
        >
          <ExpandMoreIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};
