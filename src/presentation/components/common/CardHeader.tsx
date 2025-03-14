import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  isVisible = true,
  onToggleVisibility
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'flex-start',
      mb: 1.5,
      px: { xs: 2, sm: 2.5 },
      pt: { xs: 1.5, sm: 2 }
    }}>
      <Box>
        <Typography 
          variant="h6" 
          component="div"
          sx={{
            fontSize: { xs: '1rem', sm: '1.1rem' },
            fontWeight: 500,
            lineHeight: 1.3,
            marginBottom: subtitle ? 0.5 : 0,
            color: 'text.primary'
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.8rem', sm: '0.85rem' },
              lineHeight: 1.4,
              opacity: 0.85
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 0.75,
        ml: 1.5,
        mt: 0.25
      }}>
        {action}
        {onToggleVisibility && (
          <Tooltip title={isVisible ? 'カードを非表示' : 'カードを表示'}>
            <IconButton 
              onClick={onToggleVisibility}
              size="small"
              sx={{
                opacity: 0.7,
                '&:hover': {
                  opacity: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              {isVisible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}; 