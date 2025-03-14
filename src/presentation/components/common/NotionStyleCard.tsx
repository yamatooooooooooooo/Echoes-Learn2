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
        borderRadius: '4px',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: '#C0C0C0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        },
        backgroundColor: 'background.paper'
      }}
    >
      <CardHeader
        sx={{ 
          borderBottom: collapsed ? 'none' : '1px solid #F0F0F0',
          py: 2, 
          px: { xs: 2, sm: 3 },
          '& .MuiCardHeader-title': {
            fontSize: { xs: '0.95rem', sm: '1.05rem' },
          },
          '& .MuiCardHeader-subheader': {
            fontSize: { xs: '0.8rem', sm: '0.85rem' },
          }
        }}
        avatar={icon && (
          <Box sx={{ 
            color: 'text.secondary', 
            opacity: 0.7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </Box>
        )}
        title={
          <Typography variant="h6" sx={{ 
            fontWeight: 500,
            lineHeight: 1.3
          }}>
            {title}
          </Typography>
        }
        action={
          <>
            {headerAction}
            {collapsible && (
              <IconButton 
                size="small" 
                onClick={() => setCollapsed(!collapsed)}
                sx={{ 
                  opacity: 0.7,
                  '&:hover': { opacity: 1, backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                }}
              >
                {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
              </IconButton>
            )}
          </>
        }
      />
      {!collapsed && (
        <CardContent sx={{ 
          p: { xs: 2, sm: 3 },
          pt: { xs: 1.5, sm: 2 },
          '&:last-child': { pb: { xs: 2, sm: 3 } }
        }}>
          {children}
        </CardContent>
      )}
    </Card>
  );
}; 