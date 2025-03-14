import React from 'react';
import { Box, LinearProgress, Typography, useTheme, LinearProgressProps } from '@mui/material';
import { styled } from '@mui/material/styles';

interface NotionProgressBarProps {
  value: number;
  height?: number;
  showPercentage?: boolean;
  label?: string;
  color?: string;
}

// カスタムLinearProgressのプロパティ型
interface StyledLinearProgressProps extends LinearProgressProps {
  height?: number;
  barColor?: string;
}

// スタイル付きのLinearProgressコンポーネント
const StyledLinearProgress = styled(LinearProgress, {
  shouldForwardProp: (prop) => prop !== 'height' && prop !== 'barColor',
})<StyledLinearProgressProps>(({ theme, height = 4, barColor }) => ({
  height: height,
  borderRadius: height / 2,
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(0, 0, 0, 0.05)',
  '& .MuiLinearProgress-bar': {
    borderRadius: height / 2,
    backgroundColor: barColor || theme.palette.primary.main,
  },
}));

/**
 * Notion風のプログレスバーコンポーネント
 * @param value - 進捗の値（0-100）
 * @param height - プログレスバーの高さ（デフォルト：4px）
 * @param showPercentage - パーセンテージを表示するかどうか（デフォルト：true）
 * @param label - プログレスバーの上に表示するラベル（オプション）
 * @param color - プログレスバーの色（デフォルト：theme.palette.primary.main）
 */
const NotionProgressBar: React.FC<NotionProgressBarProps> = ({
  value,
  height = 4,
  showPercentage = true,
  label,
  color,
}) => {
  const theme = useTheme();
  
  // 値が0-100の範囲内に収まるようにする
  const normalizedValue = Math.max(0, Math.min(100, value));
  
  // 進捗状況に基づいて色を決定（colorプロップが指定されていない場合）
  const getColorByProgress = (): string => {
    if (color) return color;
    
    if (normalizedValue >= 100) {
      return theme.palette.success.main; // 完了
    } else if (normalizedValue >= 75) {
      return theme.palette.success.light; // ほぼ完了
    } else if (normalizedValue >= 50) {
      return theme.palette.primary.main; // 半分完了
    } else if (normalizedValue >= 25) {
      return theme.palette.warning.main; // 開始済み
    } else {
      return theme.palette.error.light; // あまり進んでいない
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 1 }}>
      {label && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 0.5, fontSize: '0.75rem' }}
        >
          {label}
        </Typography>
      )}
      
      <StyledLinearProgress 
        variant="determinate" 
        value={normalizedValue} 
        height={height}
        barColor={getColorByProgress()}
      />
      
      {showPercentage && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mt: 0.5, 
            textAlign: 'right',
            fontSize: '0.75rem',
            opacity: 0.8
          }}
        >
          {`${Math.round(normalizedValue)}%`}
        </Typography>
      )}
    </Box>
  );
};

export default NotionProgressBar; 