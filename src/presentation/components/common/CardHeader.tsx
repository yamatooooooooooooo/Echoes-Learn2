import React from 'react';
import { Box, Typography, IconButton, Tooltip, useTheme } from '@mui/material';
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
  helpText,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 2.5 },
          pb: { xs: 1.5, sm: 2 },
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.03)',
          borderBottom: '1px solid',
          borderColor:
            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                color:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.95)'
                    : 'rgba(0, 0, 0, 0.85)',
                letterSpacing: '0.01em',
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: '0.85rem',
                  mt: 0.5,
                  opacity: 0.8,
                }}
              >
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
                sx={{
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.07)'
                      : 'rgba(0, 0, 0, 0.04)',
                  '&:hover': {
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.15)'
                        : 'rgba(0, 0, 0, 0.08)',
                  },
                }}
              >
                {isVisible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
};
