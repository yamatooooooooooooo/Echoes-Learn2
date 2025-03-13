import React, { useState } from 'react';
import {
  IconButton,
  Tooltip,
  Popover,
  Typography,
  Paper,
  Box,
  useTheme,
  SxProps,
  Theme
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

interface HelpTooltipProps {
  /**
   * ヘルプテキスト - ポップアップ内に表示される詳細説明
   */
  helpText: string;
  
  /**
   * ツールチップのテキスト - アイコンホバー時に表示される短いヒント
   */
  tooltipText?: string;
  
  /**
   * アイコンサイズ
   */
  iconSize?: 'small' | 'medium' | 'large';
  
  /**
   * アイコンの色 - デフォルトはinfoカラー
   */
  iconColor?: string;
  
  /**
   * 追加のスタイル
   */
  sx?: SxProps<Theme>;
}

/**
 * ヘルプツールチップコンポーネント
 * 情報アイコンをクリックすると詳細説明のポップアップが表示される
 */
export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  helpText,
  tooltipText = '詳細情報',
  iconSize = 'small',
  iconColor,
  sx
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const theme = useTheme();
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const open = Boolean(anchorEl);
  const id = open ? 'help-popover' : undefined;
  
  return (
    <>
      <Tooltip title={tooltipText}>
        <IconButton
          size={iconSize}
          onClick={handleClick}
          sx={{ 
            color: iconColor || 'info.main',
            ...sx
          }}
          aria-describedby={id}
        >
          <InfoIcon fontSize={iconSize} />
        </IconButton>
      </Tooltip>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Paper sx={{ maxWidth: 320, p: 2 }}>
          <Typography variant="body2">
            {helpText}
          </Typography>
        </Paper>
      </Popover>
    </>
  );
}; 