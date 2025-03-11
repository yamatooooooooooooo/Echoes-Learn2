import React from 'react';
import { IconButton, Tooltip, useTheme as useMuiTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '../../../contexts/ThemeContext';

/**
 * テーマ切り替えボタンコンポーネント
 */
export const ThemeToggle: React.FC = () => {
  const { mode, currentTheme, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();

  return (
    <Tooltip title={currentTheme === 'light' ? 'ダークモードに切り替え' : 'ライトモードに切り替え'}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        aria-label="テーマ切り替え"
        sx={{
          ml: 1,
          transition: 'all 0.3s',
          '&:hover': {
            transform: 'rotate(12deg)',
            bgcolor: currentTheme === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
          },
        }}
      >
        {currentTheme === 'light' ? (
          <Brightness4Icon sx={{ color: muiTheme.palette.text.primary }} />
        ) : (
          <Brightness7Icon sx={{ color: muiTheme.palette.text.primary }} />
        )}
      </IconButton>
    </Tooltip>
  );
}; 