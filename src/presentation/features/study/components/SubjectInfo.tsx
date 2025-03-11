import React from 'react';
import { Box, Typography, Paper, Chip, Skeleton, Grid } from '@mui/material';
import { CalendarToday as CalendarIcon, MenuBook as BookIcon } from '@mui/icons-material';

interface SubjectProps {
  subject: any; // 実際の型に合わせて調整
  loading: boolean;
}

/**
 * 科目情報を表示するコンポーネント
 */
const SubjectInfo: React.FC<SubjectProps> = ({ subject, loading }) => {
  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Skeleton variant="rectangular" height={100} />
      </Paper>
    );
  }

  if (!subject) {
    return (
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" color="text.secondary">
          科目が選択されていません
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            {subject.name}
          </Typography>
          {subject.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {subject.description}
            </Typography>
          )}
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <BookIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="body2">
              進捗状況: {subject.currentPage} / {subject.totalPages} ページ 
              ({Math.round((subject.currentPage / subject.totalPages) * 100)}%)
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          {subject.examDate && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">
                試験日: {new Date(subject.examDate).toLocaleDateString('ja-JP')}
              </Typography>
            </Box>
          )}
        </Grid>
        
        {subject.priority && (
          <Grid item xs={12}>
            <Chip 
              label={`優先度: ${
                subject.priority === 'high' ? '高' : 
                subject.priority === 'medium' ? '中' : '低'
              }`} 
              color={
                subject.priority === 'high' ? 'error' : 
                subject.priority === 'medium' ? 'warning' : 'success'
              }
              size="small"
              sx={{ mr: 1 }}
            />
            {subject.category && (
              <Chip label={subject.category} size="small" variant="outlined" />
            )}
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default SubjectInfo; 