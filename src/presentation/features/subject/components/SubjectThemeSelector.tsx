import React from 'react';
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  useTheme as useMuiTheme
} from '@mui/material';
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  DeviceHub as DeviceHubIcon
} from '@mui/icons-material';
import { useTheme } from '../../../../contexts/ThemeContext';

interface SubjectThemeSelectorProps {
  subjectId: string;
}

/**
 * 科目ごとのテーマ設定を行うコンポーネント
 * 注意: ThemeContextの変更に伴い一時的に無効化しています
 */
export const SubjectThemeSelector: React.FC<SubjectThemeSelectorProps> = ({ subjectId }) => {
  const { mode } = useTheme();
  const muiTheme = useMuiTheme();
  
  // 現在の実際のテーマ（light/dark）を計算
  const isDarkMode = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // 一時的な実装（修正中）
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        テーマ設定
      </Typography>
      <Typography variant="body2" color="text.secondary">
        この機能は現在メンテナンス中です。
      </Typography>
    </Box>
  );
}; 