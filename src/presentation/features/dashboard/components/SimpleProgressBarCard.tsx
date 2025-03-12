import React from 'react';
import { 
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Paper,
  Divider
} from '@mui/material';
import { Subject } from '../../../../domain/models/SubjectModel';
import { calculateProgress } from '../../subject/utils/subjectUtils';

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
  
  // 進捗率に応じた色を返す
  const getProgressColor = (progress: number): string => {
    if (progress < 30) return '#f44336';  // 赤
    if (progress < 70) return '#ff9800';  // オレンジ
    return '#4caf50';  // 緑
  };
  
  if (isLoading) {
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
          
          return (
            <Paper 
              key={subject.id} 
              elevation={1} 
              sx={{ 
                mb: 2,
                p: 2,
                borderLeft: `4px solid ${progressColor}`,
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