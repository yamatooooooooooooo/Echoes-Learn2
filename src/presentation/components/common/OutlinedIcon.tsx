import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

interface OutlinedIconProps {
  icon: SvgIconComponent;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  active?: boolean;
  sx?: SxProps<Theme>;
}

/**
 * アウトラインスタイルのアイコンを統一したデザインで表示するコンポーネント
 */
export const OutlinedIcon: React.FC<OutlinedIconProps> = ({
  icon: IconComponent,
  size = 'medium',
  color,
  active = false,
  sx = {},
}) => {
  // サイズに応じたフォントサイズを設定
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return '1.25rem';
      case 'large':
        return '2rem';
      case 'medium':
      default:
        return '1.5rem';
    }
  };

  // パディングを取得
  const getPadding = () => {
    switch (size) {
      case 'small':
        return '0.3rem';
      case 'large':
        return '0.7rem';
      case 'medium':
      default:
        return '0.5rem';
    }
  };

  // サイズに応じた背景サイズを設定
  const getBackgroundSize = () => {
    switch (size) {
      case 'small':
        return '2.25rem';
      case 'large':
        return '3.75rem';
      case 'medium':
      default:
        return '3rem';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        backgroundColor: active ? `${color || 'primary.main'}15` : 'transparent',
        transition: 'all 0.2s ease',
        width: getBackgroundSize(),
        height: getBackgroundSize(),
        padding: getPadding(),
        '&:hover': {
          backgroundColor: `${color || 'primary.main'}08`,
        },
        ...sx
      }}
    >
      <IconComponent
        fontSize={size}
        color={active ? 'primary' : 'inherit'}
        sx={{
          color: color || (active ? 'primary.main' : 'text.secondary'),
          opacity: active ? 1 : 0.75,
          stroke: active ? color || 'primary.main' : 'currentColor',
          strokeWidth: active ? 0.5 : 0,
          transition: 'all 0.2s ease',
          transform: active ? 'scale(1.05)' : 'scale(1)',
        }}
      />
    </Box>
  );
}; 