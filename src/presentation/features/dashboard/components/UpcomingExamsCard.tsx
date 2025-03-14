import React from 'react';
import { Box, Typography, CardContent } from '@mui/material';
import { NotionStyleCard } from '../../../components/common/NotionStyleCard';
import { Subject } from '../../../../domain/models/SubjectModel';

interface UpcomingExamsCardProps {
  subjects: Subject[];
}

/**
 * 試験日カードコンポーネント（シンプル版）
 */
export const UpcomingExamsCard: React.FC<UpcomingExamsCardProps> = ({ subjects }) => {
  return (
    <NotionStyleCard title="試験日">
      <CardContent>
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            試験日の情報はまもなく提供されます
          </Typography>
        </Box>
      </CardContent>
    </NotionStyleCard>
  );
};
