import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  LinearProgress, 
  Grid,
  Tooltip,
  Skeleton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Check as CheckIcon,
  Warning as WarningIcon,
  ErrorOutline as ErrorOutlineIcon,
  HourglassTop as HourglassTopIcon
} from '@mui/icons-material';
import { Subject } from '../../../../domain/models/SubjectModel';

/**
 * 科目の進捗を一覧表示するカード
 */
export const SimpleProgressBarCard: React.FC<{
  subjects: Subject[];
  isLoading?: boolean;
}> = ({ subjects, isLoading = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // 残り日数に応じた色を取得
  const getDaysColor = (days: number | null) => {
    if (days === null) return 'text.disabled';
    if (days <= 7) return 'error';
    if (days <= 14) return 'warning';
    if (days <= 30) return 'info';
    return 'success';
  };

  // 残り日数に応じたアイコンを取得
  const getDaysIcon = (days: number | null) => {
    if (days === null) return null;
    if (days <= 7) return <ErrorOutlineIcon color="error" fontSize="small" />;
    if (days <= 14) return <WarningIcon color="warning" fontSize="small" />;
    if (days <= 30) return <HourglassTopIcon color="info" fontSize="small" />;
    return <CheckIcon color="success" fontSize="small" />;
  };
  
  // 試験日までの残り日数を計算
  const calculateDaysRemaining = (examDate: string | Date | undefined): number | null => {
    if (!examDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const exam = new Date(examDate);
    exam.setHours(0, 0, 0, 0);
    
    const diffTime = exam.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // 進捗率の計算と表示フォーマット
  const getProgress = (current: number, total: number): string => {
    if (total === 0) return '0%';
    const progress = Math.round((current / total) * 100);
    return `${progress}%`;
  };

  // 残りページ数を表示するフォーマット
  const getRemainingPages = (current: number, total: number): string => {
    const remaining = total - current;
    return remaining <= 0 
      ? '完了!' 
      : `残り ${remaining} ページ`;
  };

  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: 2 }}>
          <Skeleton variant="text" width="40%" height={32} />
          <Skeleton variant="text" width="70%" height={24} sx={{ mb: 1 }} />
        </Box>
        
        <Box sx={{ mt: 3 }}>
          <Skeleton variant="rectangular" height={48} sx={{ mb: 2, borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={48} sx={{ mb: 2, borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={48} sx={{ mb: 2, borderRadius: 1 }} />
        </Box>
      </Box>
    );
  }

  const sortedSubjects = [...subjects]
    .filter(subject => subject.totalPages > 0)
    .sort((a, b) => {
      // 試験日の近い順でソート
      const daysA = calculateDaysRemaining(a.examDate) || 1000;
      const daysB = calculateDaysRemaining(b.examDate) || 1000;
      return daysA - daysB;
    });

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 0.5, 
          fontWeight: 600,
          fontSize: { xs: '1.1rem', sm: '1.25rem' } 
        }}
      >
        全体の進捗状況
      </Typography>
      
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ mb: 2 }}
      >
        {sortedSubjects.length > 0 
          ? `${sortedSubjects.length}科目の進捗状況を確認できます` 
          : '科目を追加して学習を始めましょう'}
      </Typography>
      
      {sortedSubjects.length === 0 ? (
        <Box 
          sx={{ 
            py: 4, 
            textAlign: 'center',
            color: 'text.secondary',
            opacity: 0.7 
          }}
        >
          <Typography>進行中の科目がありません</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {sortedSubjects.map((subject) => {
            const daysRemaining = calculateDaysRemaining(subject.examDate);
            const progress = Math.min(100, Math.round((subject.currentPage / subject.totalPages) * 100));
            
            return (
              <Grid item xs={12} key={subject.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(0, 0, 0, 0.08)',
                    bgcolor: theme.palette.mode === 'dark' 
                      ? 'rgba(30, 30, 30, 0.5)' 
                      : 'rgba(255, 255, 255, 0.5)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.palette.mode === 'dark' 
                        ? '0 4px 12px rgba(0, 0, 0, 0.2)' 
                        : '0 4px 12px rgba(0, 0, 0, 0.05)'
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 1,
                      mb: 1.5
                    }}
                  >
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 500,
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%'
                        }}
                      >
                        {subject.name}
                      </Typography>
                      
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          mt: 0.5,
                          flexWrap: 'wrap',
                          gap: { xs: 2, sm: 3 }
                        }}
                      >
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ display: 'flex', alignItems: 'center' }}
                        >
                          {subject.examDate && daysRemaining !== null ? (
                            <Tooltip 
                              title={`試験日: ${new Date(subject.examDate).toLocaleDateString('ja-JP')}`}
                              arrow
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {getDaysIcon(daysRemaining)}
                                <Typography 
                                  variant="caption" 
                                  color={getDaysColor(daysRemaining)}
                                  sx={{ ml: 0.5, fontWeight: daysRemaining <= 14 ? 'bold' : 'normal' }}
                                >
                                  {daysRemaining <= 0 
                                    ? '試験日を過ぎています' 
                                    : `残り${daysRemaining}日`}
                                </Typography>
                              </Box>
                            </Tooltip>
                          ) : (
                            '試験日未設定'
                          )}
                        </Typography>
                        
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                        >
                          {getRemainingPages(subject.currentPage, subject.totalPages)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        variant="body2" 
                        fontWeight="bold"
                        sx={{ 
                          minWidth: '3rem', 
                          textAlign: 'right',
                          color: progress >= 100 
                            ? 'success.main' 
                            : progress >= 70 
                              ? 'primary.main' 
                              : progress >= 30 
                                ? 'text.primary' 
                                : 'warning.main'
                        }}
                      >
                        {getProgress(subject.currentPage, subject.totalPages)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={progress}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'rgba(0, 0, 0, 0.05)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: progress >= 100 
                          ? theme.palette.success.main 
                          : progress >= 70 
                            ? theme.palette.primary.main 
                            : progress >= 30 
                              ? theme.palette.info.main 
                              : theme.palette.warning.main
                      }
                    }}
                  />
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}; 