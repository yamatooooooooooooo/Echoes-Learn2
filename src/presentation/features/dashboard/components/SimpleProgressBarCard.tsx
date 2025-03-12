import React from 'react';
import { 
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Paper,
  Divider,
  Tooltip
} from '@mui/material';
import { Subject } from '../../../../domain/models/SubjectModel';
import { calculateProgress } from '../../subject/utils/subjectUtils';
import { useUserSettings } from '../../../../hooks/useUserSettings';

interface SimpleProgressBarCardProps {
  subjects: Subject[];
  isLoading?: boolean;
}

/**
 * シンプルな進捗バーカード
 */
const SimpleProgressBarCard: React.FC<SimpleProgressBarCardProps> = ({ 
  subjects,
  isLoading = false
}) => {
  // ユーザー設定を取得
  const { userSettings, isLoading: isSettingsLoading } = useUserSettings();
  
  // 進捗率に応じた色を返す
  const getProgressColor = (progress: number): string => {
    if (progress < 30) return '#f44336';  // 赤
    if (progress < 70) return '#ff9800';  // オレンジ
    return '#4caf50';  // 緑
  };
  
  // 目標達成までの日数を計算
  const calculateDaysUntilTarget = (subject: Subject): number | null => {
    if (!subject.examDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const examDate = new Date(subject.examDate);
    examDate.setHours(0, 0, 0, 0);
    
    const bufferDays = subject.bufferDays || userSettings.examBufferDays;
    const targetDate = new Date(examDate);
    targetDate.setDate(targetDate.getDate() - bufferDays);
    
    // 今日から目標日までの日数
    const daysUntilTarget = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilTarget > 0 ? daysUntilTarget : 0;
  };
  
  // 残りの読了時間を計算
  const calculateRemainingReadingTime = (subject: Subject): number => {
    const remainingPages = subject.totalPages - (subject.currentPage || 0);
    return remainingPages * userSettings.averagePageReadingTime;
  };
  
  if (isLoading || isSettingsLoading) {
    return (
      <Card elevation={2} sx={{ mb: 3, maxWidth: '100%', width: '100%' }}>
        <CardHeader 
          title="学習進捗" 
          titleTypographyProps={{ variant: 'h6' }}
        />
        <CardContent>
          <LinearProgress sx={{ height: 10, borderRadius: 5 }} />
        </CardContent>
      </Card>
    );
  }
  
  if (subjects.length === 0) {
    return (
      <Card elevation={2} sx={{ mb: 3, maxWidth: '100%', width: '100%' }}>
        <CardHeader 
          title="学習進捗" 
          titleTypographyProps={{ variant: 'h6' }}
        />
        <CardContent>
          <Typography variant="body2" color="text.secondary" align="center">
            科目がありません
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            科目を登録してください
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  // 試験日が近い順にソート
  const sortedSubjects = [...subjects].sort((a, b) => {
    const dateA = new Date(a.examDate).getTime();
    const dateB = new Date(b.examDate).getTime();
    return dateA - dateB;
  });
  
  return (
    <Card elevation={2} sx={{ mb: 3, maxWidth: '100%', width: '100%' }}>
      <CardHeader 
        title="学習進捗" 
        titleTypographyProps={{ variant: 'h6' }}
      />
      <CardContent>
        <Divider sx={{ mb: 2 }} />
        
        {sortedSubjects.map((subject) => {
          const progress = calculateProgress(subject.currentPage || 0, subject.totalPages);
          const progressColor = getProgressColor(progress);
          const daysUntilTarget = calculateDaysUntilTarget(subject);
          const remainingMinutes = calculateRemainingReadingTime(subject);
          
          return (
            <Paper 
              key={subject.id} 
              elevation={1} 
              sx={{ 
                mb: 2,
                p: 2,
                borderLeft: `4px solid ${progressColor}`,
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body1">{subject.name}</Typography>
                  <Typography variant="body2">
                    {subject.currentPage} / {subject.totalPages} ページ
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    試験日: {new Date(subject.examDate).toLocaleDateString('ja-JP')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {progress}%
                  </Typography>
                </Box>
                
                {daysUntilTarget !== null && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Tooltip title={`目標達成までの残り日数（試験日の${userSettings.examBufferDays}日前までに完了）`}>
                      <Typography variant="caption" color="text.secondary">
                        目標達成まであと: {daysUntilTarget}日
                      </Typography>
                    </Tooltip>
                    <Tooltip title={`1ページあたり${userSettings.averagePageReadingTime}分で計算`}>
                      <Typography variant="caption" color="text.secondary">
                        残り読了時間: 約{Math.ceil(remainingMinutes / 60)}時間
                      </Typography>
                    </Tooltip>
                  </Box>
                )}
              </Box>
              
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: progressColor
                  }
                }} 
              />
            </Paper>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default SimpleProgressBarCard; 