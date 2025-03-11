import React, { ReactNode, useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  Box, 
  IconButton, 
  Collapse
} from '@mui/material';
import { Draggable } from '@hello-pangea/dnd';
import { OutlinedIcon } from './OutlinedIcon';
import { ICONS } from '../../../config/appIcons';

interface DraggableModuleCardProps {
  id: string;
  index: number;
  title: string;
  icon?: React.ReactNode;
  children: ReactNode;
  defaultCollapsed?: boolean;
  onToggleCollapse?: (id: string, isCollapsed: boolean) => void;
  onToggleVisibility?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  isDraggingEnabled?: boolean;
  canHide?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

/**
 * ドラッグ可能で折りたたみ可能なモジュールカードコンポーネント
 */
export const DraggableModuleCard: React.FC<DraggableModuleCardProps> = ({
  id,
  index,
  title,
  icon,
  children,
  defaultCollapsed = false,
  onToggleCollapse,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  isDraggingEnabled = true,
  canHide = true,
  isFirst = false,
  isLast = false
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  
  const handleToggleCollapse = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    if (onToggleCollapse) {
      onToggleCollapse(id, newCollapsedState);
    }
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  const handleToggleVisibility = () => {
    if (onToggleVisibility) {
      onToggleVisibility(id);
    }
    handleMenuClose();
  };
  
  const handleMoveUp = () => {
    if (onMoveUp) {
      onMoveUp(id);
    }
    handleMenuClose();
  };
  
  const handleMoveDown = () => {
    if (onMoveDown) {
      onMoveDown(id);
    }
    handleMenuClose();
  };
  
  return (
    <Draggable draggableId={id} index={index} isDragDisabled={!isDraggingEnabled}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          elevation={snapshot.isDragging ? 3 : 0}
          sx={{
            mb: 3,
            border: '1px solid #F0F0F0',
            transition: 'all 0.25s ease-in-out',
            borderRadius: 1.5,
            overflow: 'visible',
            '&:hover': {
              borderColor: '#E0E0E0',
              transform: snapshot.isDragging ? 'rotate(1deg)' : 'none',
              boxShadow: snapshot.isDragging ? '0 8px 20px rgba(0, 0, 0, 0.08)' : '0 2px 6px rgba(0, 0, 0, 0.03)',
            },
            ...(snapshot.isDragging ? {
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
              cursor: 'grabbing'
            } : {})
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <CardHeader
            sx={{
              borderBottom: collapsed ? 'none' : '1px solid #F0F0F0',
              py: 1.5,
              px: 2,
              bgcolor: '#FAFAFA',
              '& .MuiCardHeader-action': {
                margin: 0,
                alignSelf: 'center'
              }
            }}
            avatar={
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center'
                }}
              >
                <Box
                  {...provided.dragHandleProps}
                  sx={{
                    mr: 1,
                    opacity: isHovering || snapshot.isDragging ? 0.6 : 0,
                    transition: 'opacity 0.2s ease',
                    cursor: 'grab',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <OutlinedIcon icon={ICONS.dragHandle} size="small" />
                </Box>
                {icon}
              </Box>
            }
            title={
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                {title}
              </Typography>
            }
            action={
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {canHide && onToggleVisibility && (
                  <IconButton 
                    size="small"
                    onClick={handleToggleVisibility}
                    sx={{ 
                      opacity: 0.7,
                      transition: 'opacity 0.2s ease',
                      '&:hover': { opacity: 1 }
                    }}
                  >
                    <OutlinedIcon icon={ICONS.invisible} size="small" />
                  </IconButton>
                )}
                
                {!isFirst && onMoveUp && (
                  <IconButton 
                    size="small"
                    onClick={handleMoveUp}
                    sx={{ 
                      opacity: 0.7,
                      transition: 'opacity 0.2s ease',
                      '&:hover': { opacity: 1 }
                    }}
                  >
                    <OutlinedIcon icon={ICONS.arrowUp} size="small" />
                  </IconButton>
                )}
                
                {!isLast && onMoveDown && (
                  <IconButton 
                    size="small"
                    onClick={handleMoveDown}
                    sx={{ 
                      opacity: 0.7,
                      transition: 'opacity 0.2s ease',
                      '&:hover': { opacity: 1 }
                    }}
                  >
                    <OutlinedIcon icon={ICONS.arrowDown} size="small" />
                  </IconButton>
                )}
                
                <IconButton 
                  size="small" 
                  onClick={handleToggleCollapse}
                >
                  <OutlinedIcon 
                    icon={collapsed ? ICONS.expandMore : ICONS.expandLess} 
                    size="small" 
                  />
                </IconButton>
              </Box>
            }
          />
          
          <Collapse in={!collapsed} timeout="auto" unmountOnExit>
            <CardContent sx={{ p: 2.5 }}>
              {children}
            </CardContent>
          </Collapse>
        </Card>
      )}
    </Draggable>
  );
}; 