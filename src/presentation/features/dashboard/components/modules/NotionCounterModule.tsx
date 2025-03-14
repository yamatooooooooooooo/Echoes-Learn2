import React from 'react';
import { Box, Typography, useTheme, CircularProgress } from '@mui/material';
import { NotionModuleCard } from '../../../../components/common/NotionModuleCard';

export interface NotionCounterModuleProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: React.ReactNode;
  footer?: string;
  loading?: boolean;
  color?: string;
  id: string;
  index: number;
  onToggleVisibility?: (id: string) => void;
  onToggleCollapse?: (id: string, isCollapsed: boolean) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  isDraggingEnabled?: boolean;
  canHide?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

export const NotionCounterModule: React.FC<NotionCounterModuleProps> = ({
  title,
  value,
  description,
  icon,
  footer,
  loading = false,
  color,
  id,
  index,
  onToggleVisibility,
  onToggleCollapse,
  onMoveUp,
  onMoveDown,
  isDraggingEnabled = true,
  canHide = true,
  isFirst = false,
  isLast = false
}) => {
  const theme = useTheme();
  
  // カードの内部コンテンツ
  const content = (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
          <CircularProgress size={40} thickness={4} />
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
          </Box>
          
          <Typography 
            variant="h3" 
            component="div"
            sx={{ 
              fontWeight: 600, 
              my: 2,
              fontSize: { xs: '2rem', sm: '2.5rem' },
              color: color || theme.palette.primary.main,
              textAlign: 'center'
            }}
          >
            {value}
          </Typography>
          
          {footer && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                mt: 'auto', 
                pt: 1, 
                textAlign: 'center',
                fontSize: '0.75rem'
              }}
            >
              {footer}
            </Typography>
          )}
        </>
      )}
    </Box>
  );

  return (
    <NotionModuleCard
      id={id}
      index={index}
      title={title}
      icon={icon}
      onToggleCollapse={onToggleCollapse}
      onToggleVisibility={onToggleVisibility}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      isDraggingEnabled={isDraggingEnabled}
      canHide={canHide}
      isFirst={isFirst}
      isLast={isLast}
    >
      {content}
    </NotionModuleCard>
  );
}; 