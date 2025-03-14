import React from 'react';
import { IconButton, Tooltip, useTheme as useMuiTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '../../../contexts/ThemeContext';

/**
 * テーマ切り替えボタンコンポーネント
 */
export const ThemeToggle: React.FC = () => {
  const { mode, toggleMode } = useTheme();
  const muiTheme = useMuiTheme();
  
  // 現在のテーマ（light/dark）を計算
  const isDarkMode = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <Tooltip title={isDarkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}>
      <IconButton
        onClick={toggleMode}
        color="inherit"
        aria-label="テーマ切り替え"
        sx={{
          ml: 1,
          transition: 'all 0.3s',
          '&:hover': {
            transform: 'rotate(12deg)',
            bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
          },
        }}
      >
        {isDarkMode ? (
          <Brightness7Icon sx={{ color: muiTheme.palette.text.primary }} />
        ) : (
          <Brightness4Icon sx={{ color: muiTheme.palette.text.primary }} />
        )}
      </IconButton>
    </Tooltip>
  );
}; 