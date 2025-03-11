import React from 'react';
import { Grid, Box, Typography, CircularProgress } from '@mui/material';
import { SubjectCard } from './SubjectCard';
import { Subject } from '../../../../domain/models/SubjectModel';

interface SubjectListContentProps {
  subjects: Subject[];
  loading: boolean;
  formatDate: (date: Date | string | undefined) => string;
  onSubjectUpdated: (subject: Subject) => void;
  onSubjectEdit: (subject: Subject) => void;
  onSubjectDelete: (subject: Subject) => void;
}

/**
 * 科目カードのリストを表示するコンポーネント
 */
export const SubjectListContent: React.FC<SubjectListContentProps> = ({
  subjects,
  loading,
  formatDate,
  onSubjectUpdated,
  onSubjectEdit,
  onSubjectDelete
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (subjects.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          科目がまだ登録されていません。「新しい科目」ボタンから科目を追加してください。
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ width: '100%', margin: 0 }}>
      {subjects.map((subject) => (
        <Grid 
          item 
          xs={12} 
          sm={6} 
          md={4} 
          key={subject.id}
          sx={{
            display: 'flex',
            '& > *': { width: '100%' }
          }}
        >
          <SubjectCard
            subject={subject}
            formatDate={formatDate}
            onProgressAdded={() => {}}
            onSubjectUpdated={onSubjectUpdated}
            onEdit={onSubjectEdit}
            onDelete={onSubjectDelete}
          />
        </Grid>
      ))}
    </Grid>
  );
}; 