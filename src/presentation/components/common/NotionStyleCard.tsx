import React, { ReactNode, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon, 
  ExpandLess as ExpandLessIcon 
} from '@mui/icons-material';

interface NotionStyleCardProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  headerAction?: ReactNode;
}

/**
 * Notion風のシンプルでエレガントなカードコンポーネント
 */
export const NotionStyleCard: React.FC<NotionStyleCardProps> = ({
  title,
  children,
  icon,
  collapsible = false,
  defaultCollapsed = false,
  headerAction,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  
  return (
    <Card 
      elevation={0}
      sx={{ 
        mb: 3, 
        border: '1px solid #E0E0E0',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: '#C0C0C0'
        }
      }}
    >
      <CardHeader
        sx={{ 
          borderBottom: collapsed ? 'none' : '1px solid #F0F0F0',
          py: 2.5, 
          px: 3
        }}
        avatar={icon && (
          <Box sx={{ color: 'text.secondary', opacity: 0.8 }}>
            {icon}
          </Box>
        )}
        title={
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            {title}
          </Typography>
        }
        action={
          <>
            {headerAction}
            {collapsible && (
              <IconButton size="small" onClick={() => setCollapsed(!collapsed)}>
                {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
              </IconButton>
            )}
          </>
        }
      />
      {!collapsed && (
        <CardContent sx={{ p: 3 }}>
          {children}
        </CardContent>
      )}
    </Card>
  );
}; 