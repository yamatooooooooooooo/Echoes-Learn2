import React from 'react';
import { Box, Typography } from '@mui/material';
import NormaDisplay from '../../../../components/NormaDisplay';

interface NotionNormaDisplayProps {
  userId?: string;
}

/**
 * NormaDisplayコンポーネントをラップしたNotionスタイルのコンポーネント
 */
const NotionNormaDisplay: React.FC<NotionNormaDisplayProps> = ({ userId }) => {
  if (!userId) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          ユーザーIDが指定されていないため、ノルマ情報を表示できません。
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%' }}>
      {/* @ts-ignore - NormaDisplayがuserIdプロパティを持っていなくても強制的に渡す */}
      <NormaDisplay userId={userId} />
    </Box>
  );
};

export default NotionNormaDisplay; 