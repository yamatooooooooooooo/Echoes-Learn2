import React from 'react';
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  DeviceHub as DeviceHubIcon,
} from '@mui/icons-material';
import { useTheme } from '../../../../contexts/ThemeContext';

interface SubjectThemeSelectorProps {
  subjectId: string;
}

/**
 * 科目ごとのテーマ設定を行うコンポーネント
 */
export const SubjectThemeSelector: React.FC<SubjectThemeSelectorProps> = ({ subjectId }) => {
  const { currentTheme, subjectThemes, setSubjectTheme } = useTheme();
  const muiTheme = useMuiTheme();

  // 現在の科目のテーマ設定を取得
  const subjectTheme = subjectThemes.find((theme) => theme.subjectId === subjectId);
  const currentMode = subjectTheme?.mode || 'inherit';

  const handleThemeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: 'light' | 'dark' | 'inherit' | null
  ) => {
    if (newMode !== null) {
      setSubjectTheme(subjectId, newMode);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        テーマ設定
      </Typography>
      <ToggleButtonGroup
        value={currentMode}
        exclusive
        onChange={handleThemeChange}
        aria-label="科目テーマ設定"
        size="small"
        sx={{ width: '100%' }}
      >
        <ToggleButton
          value="light"
          aria-label="ライトモード"
          sx={{
            flex: 1,
            borderRadius: '4px 0 0 4px',
            color: currentMode === 'light' ? muiTheme.palette.primary.main : 'inherit',
          }}
        >
          <Tooltip title="ライトモード">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LightModeIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="caption">ライト</Typography>
            </Box>
          </Tooltip>
        </ToggleButton>

        <ToggleButton
          value="dark"
          aria-label="ダークモード"
          sx={{
            flex: 1,
            color: currentMode === 'dark' ? muiTheme.palette.primary.main : 'inherit',
          }}
        >
          <Tooltip title="ダークモード">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DarkModeIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="caption">ダーク</Typography>
            </Box>
          </Tooltip>
        </ToggleButton>

        <ToggleButton
          value="inherit"
          aria-label="グローバル設定に従う"
          sx={{
            flex: 1,
            borderRadius: '0 4px 4px 0',
            color: currentMode === 'inherit' ? muiTheme.palette.primary.main : 'inherit',
          }}
        >
          <Tooltip title="グローバル設定に従う（現在: ${currentTheme === 'light' ? 'ライト' : 'ダーク'}）">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DeviceHubIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="caption">グローバル</Typography>
            </Box>
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};
