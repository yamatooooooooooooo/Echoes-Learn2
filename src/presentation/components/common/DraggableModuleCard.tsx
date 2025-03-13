import React, { ReactNode, useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  Box, 
  IconButton, 
  Collapse,
  useTheme,
  useMediaQuery
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
          elevation={snapshot.isDragging ? 4 : 1}
          sx={{
            mb: { xs: 2, sm: 3 },
            border: `1px solid ${theme.palette.divider}`,
            transition: 'all 0.3s ease-in-out',
            borderRadius: { xs: 2, sm: 2.5 },
            overflow: 'visible',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            '&:hover': {
              borderColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.2)' 
                : 'rgba(0, 0, 0, 0.12)',
              transform: snapshot.isDragging ? 'rotate(1deg) scale(1.02)' : 'translateY(-2px)',
              boxShadow: snapshot.isDragging 
                ? '0 10px 25px rgba(0, 0, 0, 0.1)' 
                : '0 4px 10px rgba(0, 0, 0, 0.05)',
            },
            ...(snapshot.isDragging ? {
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              cursor: 'grabbing',
              zIndex: 10
            } : {})
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <CardHeader
            sx={{
              borderBottom: collapsed ? 'none' : `1px solid ${theme.palette.divider}`,
              py: { xs: 1.5, sm: 2 },
              px: { xs: 1.5, sm: 2 },
              bgcolor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.02)',
              '& .MuiCardHeader-action': {
                margin: 0,
                alignSelf: 'center'
              },
              transition: 'background-color 0.3s ease'
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
                    opacity: (isHovering || snapshot.isDragging || isMobile) ? 0.7 : 0,
                    transition: 'opacity 0.2s ease',
                    cursor: 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    color: theme.palette.text.secondary,
                    // モバイルでタッチしやすいサイズに
                    padding: isMobile ? '4px' : 0,
                    '&:active': {
                      cursor: 'grabbing'
                    }
                  }}
                >
                  <OutlinedIcon 
                    icon={ICONS.dragHandle} 
                    size={isMobile ? "medium" : "small"} 
                  />
                </Box>
                <Box sx={{ 
                  color: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {icon}
                </Box>
              </Box>
            }
            title={
              <Typography 
                variant={isMobile ? "body1" : "subtitle1"} 
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '0.95rem', sm: '1rem' },
                  lineHeight: 1.4,
                  letterSpacing: 0.2,
                  color: theme.palette.text.primary
                }}
              >
                {title}
              </Typography>
            }
            action={
              <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
                {canHide && onToggleVisibility && (
                  <IconButton 
                    size={isMobile ? "medium" : "small"}
                    onClick={handleToggleVisibility}
                    sx={{ 
                      opacity: 0.7,
                      transition: 'opacity 0.2s ease, background-color 0.2s ease',
                      '&:hover': { 
                        opacity: 1,
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(0, 0, 0, 0.05)'
                      },
                      // モバイルでタッチしやすいサイズに
                      padding: isMobile ? '8px' : '4px'
                    }}
                  >
                    <OutlinedIcon 
                      icon={ICONS.invisible} 
                      size={isMobile ? "medium" : "small"} 
                    />
                  </IconButton>
                )}
                
                {!isFirst && onMoveUp && (
                  <IconButton 
                    size={isMobile ? "medium" : "small"}
                    onClick={handleMoveUp}
                    sx={{ 
                      opacity: 0.7,
                      transition: 'opacity 0.2s ease, background-color 0.2s ease',
                      '&:hover': { 
                        opacity: 1,
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(0, 0, 0, 0.05)'
                      },
                      padding: isMobile ? '8px' : '4px'
                    }}
                  >
                    <OutlinedIcon 
                      icon={ICONS.arrowUp} 
                      size={isMobile ? "medium" : "small"} 
                    />
                  </IconButton>
                )}
                
                {!isLast && onMoveDown && (
                  <IconButton 
                    size={isMobile ? "medium" : "small"}
                    onClick={handleMoveDown}
                    sx={{ 
                      opacity: 0.7,
                      transition: 'opacity 0.2s ease, background-color 0.2s ease',
                      '&:hover': { 
                        opacity: 1,
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(0, 0, 0, 0.05)'
                      },
                      padding: isMobile ? '8px' : '4px'
                    }}
                  >
                    <OutlinedIcon 
                      icon={ICONS.arrowDown} 
                      size={isMobile ? "medium" : "small"} 
                    />
                  </IconButton>
                )}
                
                <IconButton 
                  size={isMobile ? "medium" : "small"}
                  onClick={handleToggleCollapse}
                  sx={{ 
                    opacity: 0.9,
                    transition: 'background-color 0.2s ease',
                    '&:hover': { 
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'rgba(0, 0, 0, 0.05)'
                    },
                    padding: isMobile ? '8px' : '4px'
                  }}
                >
                  <OutlinedIcon 
                    icon={collapsed ? ICONS.expandMore : ICONS.expandLess} 
                    size={isMobile ? "medium" : "small"} 
                  />
                </IconButton>
              </Box>
            }
          />
          
          <Collapse in={!collapsed} timeout="auto" unmountOnExit sx={{ flexGrow: 1 }}>
            <CardContent sx={{ 
              p: { xs: 1.5, sm: 2.5 },
              height: '100%',
              "&:last-child": {
                paddingBottom: { xs: 2, sm: 3 }
              }
            }}>
              {children}
            </CardContent>
          </Collapse>
        </Card>
      )}
    </Draggable>
  );
}; 