import React from 'react';
import { Box, Typography } from '@mui/material';
import LearningAnalysis from '../../../../components/LearningAnalysis';

interface NotionLearningAnalysisProps {
  userId?: string;
}

/**
 * LearningAnalysisコンポーネントをラップしたNotionスタイルのコンポーネント
 */
const NotionLearningAnalysis: React.FC<NotionLearningAnalysisProps> = ({ userId }) => {
  // LearningAnalysisがuserIdを受け取るかどうかに関わらず、
  // このラッパーを介してレンダリングをします
  
  if (!userId) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          ユーザーIDが指定されていないため、学習分析を表示できません。
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%' }}>
      <LearningAnalysis userId={userId as any} />
    </Box>
  );
};

// displayNameを設定
NotionLearningAnalysis.displayName = 'NotionLearningAnalysis';

export default NotionLearningAnalysis; 