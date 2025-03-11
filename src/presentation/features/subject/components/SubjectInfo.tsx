import React from 'react';
import { 
  Typography, 
  Box, 
  Grid,
  LinearProgress,
  Tooltip,
  Chip
} from '@mui/material';
import { 
  CalendarToday as CalendarIcon,
  Book as BookIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { Subject } from '../../../../domain/models/SubjectModel';

interface SubjectInfoProps {
  subject: Subject;
  formatDate: (date: Date | string | undefined) => string;
  progress: number;
}

/**
 * 科目の基本情報と進捗バーを表示するコンポーネント
 */
export const SubjectInfo: React.FC<SubjectInfoProps> = ({
  subject,
  formatDate,
  progress
}) => {
  // 進捗状況に応じたステータスと色の決定
  const getProgressStatus = () => {
    if (progress >= 100) return { label: '完了', color: 'success', icon: <CheckCircleIcon fontSize="small" /> };
    if (progress >= 75) return { label: '順調', color: 'success', icon: <CheckCircleIcon fontSize="small" /> };
    if (progress >= 50) return { label: '進行中', color: 'primary', icon: <HourglassEmptyIcon fontSize="small" /> };
    if (progress >= 25) return { label: '初期段階', color: 'warning', icon: <HourglassEmptyIcon fontSize="small" /> };
    return { label: '要注意', color: 'error', icon: <WarningIcon fontSize="small" /> };
  };

  const progressStatus = getProgressStatus();
  const progressColor = progressStatus.color;
  
  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: '#6b6b6b' }}>
            <CalendarIcon sx={{ fontSize: '0.9rem', mr: 1, opacity: 0.8 }} />
            <Typography variant="body2">
              試験日: {formatDate(subject?.examDate)}
            </Typography>
          </Box>
        </Grid>
        
        {subject.reportDeadline && (
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', color: '#6b6b6b' }}>
              <AssignmentIcon sx={{ fontSize: '0.9rem', mr: 1, opacity: 0.8 }} />
              <Typography variant="body2">
                レポート締切: {formatDate(subject?.reportDeadline)}
              </Typography>
            </Box>
          </Grid>
        )}
        
        <Grid item xs={12} sm={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: '#6b6b6b' }}>
            <BookIcon sx={{ fontSize: '1rem', mr: 1, opacity: 0.8 }} />
            <Tooltip title={`${subject?.totalPages - (subject?.currentPage || 0)}ページ残り`} arrow>
              <Typography variant="body2">
                進捗状況: {subject?.currentPage || 0} / {subject?.totalPages || 0} ページ
              </Typography>
            </Tooltip>
          </Box>
        </Grid>

        {subject.textbookName && (
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', color: '#6b6b6b' }}>
              <BookIcon sx={{ fontSize: '1rem', mr: 1, opacity: 0.8 }} />
              <Typography variant="body2">
                教科書: {subject.textbookName}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
      
      {/* 進捗バーと進捗率 */}
      <Box sx={{ mt: 2, mb: 1, position: 'relative' }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 0.5
        }}>
          <Chip
            icon={progressStatus.icon}
            label={progressStatus.label}
            size="small"
            color={progressColor as any}
            variant="outlined"
            sx={{ height: 24 }}
          />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              color: `${progressColor}.main`
            }}
          >
            {progress}%
          </Typography>
        </Box>
        
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: '8px',
            borderRadius: '4px',
            backgroundColor: 'rgba(0,0,0,0.05)',
            '& .MuiLinearProgress-bar': {
              borderRadius: '4px',
              bgcolor: `${progressColor}.main`
            }
          }}
        />
      </Box>
    </>
  );
}; 