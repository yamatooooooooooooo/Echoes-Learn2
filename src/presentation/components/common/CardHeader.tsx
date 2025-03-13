import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { HelpTooltip } from './HelpTooltip';

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
  helpText?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  isVisible = true,
  onToggleVisibility,
  helpText
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      mb: 2,
      px: 2,
      pt: 2
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {helpText && (
          <HelpTooltip 
            helpText={helpText} 
            tooltipText={`${title}の使い方`}
            sx={{ marginLeft: 1 }}
          />
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {action}
        {onToggleVisibility && (
          <Tooltip title={isVisible ? 'カードを非表示' : 'カードを表示'}>
            <IconButton 
              onClick={onToggleVisibility}
              size="small"
            >
              {isVisible ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}; 