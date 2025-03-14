import React from 'react';
import { Box, Typography, LinearProgress, useTheme } from '@mui/material';
import { NotionModuleCard } from '../../../../components/common/NotionModuleCard';

export interface NotionProgressModuleProps {
  title: string;
  value: number;
  total: number;
  description?: string;
  icon?: React.ReactNode;
  footer?: string;
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

export const NotionProgressModule: React.FC<NotionProgressModuleProps> = ({
  title,
  value,
  total,
  description,
  icon,
  footer,
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
  isLast = false,
}) => {
  const theme = useTheme();

  // 進捗率の計算
  const progress = total > 0 ? (value / total) * 100 : 0;

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
      <Box sx={{ mb: 2 }}>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              fontSize: '1.125rem',
              color: theme.palette.text.primary,
            }}
          >
            {value} / {total}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: color || theme.palette.primary.main,
            }}
          >
            {Math.round(progress)}%
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor:
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: color || theme.palette.primary.main,
              borderRadius: 4,
            },
          }}
        />
      </Box>

      {footer && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 'auto',
            pt: 1,
            fontSize: '0.75rem',
          }}
        >
          {footer}
        </Typography>
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
