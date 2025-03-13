import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Skeleton, 
  Divider, 
  LinearProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CheckCircleOutline as CheckCircleOutlineIcon,
  Warning as WarningIcon,
  ErrorOutline as ErrorOutlineIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { Subject } from '../../../../domain/models/SubjectModel';
import { useUserSettings } from '../../../../hooks/useUserSettings';
import { calculateDailyQuota } from '../../../../domain/utils/quotaCalculator';

/**
 * シンプルな1日のノルマ表示カード
 */
export const SimpleDailyQuotaCard: React.FC<{
  subjects: Subject[];
  isLoading?: boolean;
}> = ({ subjects, isLoading = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // ユーザー設定を取得
  const { userSettings, isLoading: isLoadingSettings } = useUserSettings();
  const [dailyQuota, setDailyQuota] = useState<{ [key: string]: number }>({});
  const [totalQuota, setTotalQuota] = useState(0);
  
  // ユーザー設定に基づいてクォータを計算
  useEffect(() => {
    if (subjects.length === 0 || isLoadingSettings) return;
    
    const calculatedQuota = calculateDailyQuota(subjects, userSettings);
    
    // クォータアイテムからサブジェクトIDごとのページ数を集計
    const subjectQuotas: { [key: string]: number } = {};
    calculatedQuota.quotaItems.forEach(item => {
      subjectQuotas[item.subjectId] = item.pages;
    });
    
    setDailyQuota(subjectQuotas);
    setTotalQuota(calculatedQuota.totalPages);
  }, [subjects, userSettings, isLoadingSettings]);
  
  // 表示されるトップN科目を制限
  const topSubjectsCount = isMobile ? 3 : 4;
  const subjectsToShow = subjects
    .filter(subject => dailyQuota[subject.id] > 0)
    .sort((a, b) => dailyQuota[b.id] - dailyQuota[a.id])
    .slice(0, topSubjectsCount);
  
  // その他の科目のクォータ合計
  const otherSubjectsQuota = subjects
    .filter(subject => dailyQuota[subject.id] > 0)
    .sort((a, b) => dailyQuota[b.id] - dailyQuota[a.id])
    .slice(topSubjectsCount)
    .reduce((total, subject) => total + dailyQuota[subject.id], 0);
  
  // クォータの達成状況アイコンを選択
  const getStatusIcon = (quota: number) => {
    if (quota <= 5) {
      return <CheckCircleOutlineIcon sx={{ color: 'success.main', fontSize: '1.25rem' }} />;
    } else if (quota <= 15) {
      return <TrendingUpIcon sx={{ color: 'info.main', fontSize: '1.25rem' }} />;
    } else if (quota <= 30) {
      return <WarningIcon sx={{ color: 'warning.main', fontSize: '1.25rem' }} />;
    } else {
      return <ErrorOutlineIcon sx={{ color: 'error.main', fontSize: '1.25rem' }} />;
    }
  };
  
  if (isLoading || isLoadingSettings) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          height: '100%', 
          p: { xs: 2, sm: 3 }, 
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.7)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="text" width="90%" height={24} sx={{ mb: 1 }} />
        </Box>
        <Divider sx={{ my: 1.5 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton variant="rectangular" height={24} sx={{ mb: 2, mt: 1, borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={24} sx={{ mb: 2, borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={24} sx={{ mb: 2, borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={24} sx={{ mb: 1, borderRadius: 1 }} />
        </Box>
      </Paper>
    );
  }
  
  const noQuota = totalQuota === 0 || subjectsToShow.length === 0;
  
  return (
    <Paper 
      elevation={0}
      sx={{ 
        height: '100%',
        p: { xs: 2, sm: 3 }, 
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.7)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 8px 24px rgba(0, 0, 0, 0.3)' 
            : '0 8px 24px rgba(0, 0, 0, 0.08)'
        }
      }}
    >
      <Box>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 0.5, 
            fontWeight: 600,
            fontSize: { xs: '1.1rem', sm: '1.25rem' } 
          }}
        >
          今日のノルマ
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ mb: 1 }}
        >
          {noQuota 
            ? '進行中の科目がありません'
            : `1日あたり合計 ${totalQuota} ページの学習が必要です`}
        </Typography>
      </Box>
      
      <Divider sx={{ 
        my: 1.5, 
        borderColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.1)' 
          : 'rgba(0, 0, 0, 0.08)' 
      }} />
      
      <Box sx={{ flexGrow: 1, mt: 1 }}>
        {noQuota ? (
          <Box 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              py: 2,
              opacity: 0.7
            }}
          >
            <CheckCircleOutlineIcon 
              color="success" 
              sx={{ fontSize: '3rem', mb: 1.5, opacity: 0.7 }} 
            />
            <Typography 
              variant="body1" 
              color="text.secondary" 
              align="center"
            >
              今日の学習ノルマはありません
            </Typography>
          </Box>
        ) : (
          <>
            {subjectsToShow.map((subject) => (
              <Box 
                key={subject.id} 
                sx={{ 
                  mb: 2, 
                  pb: 1,
                  '&:last-child': { mb: 0, pb: 0 }
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 0.5
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      maxWidth: '75%',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {subject.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getStatusIcon(dailyQuota[subject.id])}
                    <Typography 
                      variant="body2" 
                      fontWeight={600} 
                      sx={{ ml: 0.5 }}
                    >
                      {dailyQuota[subject.id]}ページ
                    </Typography>
                  </Box>
                </Box>
                
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(100, (subject.currentPage / subject.totalPages) * 100)}
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: subject.priority === 'high' 
                        ? theme.palette.error.main 
                        : subject.priority === 'medium'
                          ? theme.palette.warning.main
                          : theme.palette.success.main
                    }
                  }}
                />
              </Box>
            ))}
            
            {otherSubjectsQuota > 0 && (
              <Box 
                sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 2,
                  pt: 1,
                  borderTop: '1px dashed',
                  borderColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.08)'
                }}
              >
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                >
                  その他の科目
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  fontWeight={500}
                >
                  合計 {otherSubjectsQuota}ページ
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>
    </Paper>
  );
}; 