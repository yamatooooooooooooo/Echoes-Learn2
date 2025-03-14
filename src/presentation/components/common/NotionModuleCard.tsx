import React, { useState, ReactNode } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader,
  Typography,
  Box,
  IconButton,
  Collapse,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  ButtonBase,
  Tooltip,
  Divider
} from '@mui/material';
import { Draggable } from '@hello-pangea/dnd';
import { 
  MoreHoriz as MoreHorizIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  DragIndicator as DragIndicatorIcon
} from '@mui/icons-material';

interface NotionModuleCardProps {
  id: string;
  index: number;
  title: string;
  icon?: ReactNode;
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
 * Notion風のドラッグ可能なモジュールカードコンポーネント
 * Notionのデータベースビューに似た外観と操作感を提供します
 */
export const NotionModuleCard: React.FC<NotionModuleCardProps> = ({
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
  const isMenuOpen = Boolean(menuAnchorEl);

  // カードの折りたたみを切り替える
  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
    if (onToggleCollapse) {
      onToggleCollapse(id, !collapsed);
    }
  };

  // メニューを開く
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
    event.stopPropagation();
  };

  // メニューを閉じる
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // モジュールの表示/非表示を切り替える
  const handleToggleVisibility = () => {
    if (onToggleVisibility) {
      onToggleVisibility(id);
      handleMenuClose();
    }
  };

  // モジュールを上に移動
  const handleMoveUp = () => {
    if (onMoveUp && !isFirst) {
      onMoveUp(id);
      handleMenuClose();
    }
  };

  // モジュールを下に移動
  const handleMoveDown = () => {
    if (onMoveDown && !isLast) {
      onMoveDown(id);
      handleMenuClose();
    }
  };

  return (
    <Draggable
      draggableId={id}
      index={index}
      isDragDisabled={!isDraggingEnabled}
    >
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          elevation={snapshot.isDragging ? 4 : 0}
          sx={{
            mb: 3,
            border: '1px solid',
            borderColor: snapshot.isDragging ? 'primary.light' : 'rgba(230, 230, 230, 1)',
            borderRadius: '8px',
            backgroundColor: snapshot.isDragging ? 'rgba(245, 247, 249, 1)' : 'white',
            transition: 'all 0.2s ease',
            position: 'relative',
            '&:hover': {
              borderColor: 'rgba(200, 200, 200, 1)'
            }
          }}
        >
          {/* ドラッグハンドル - 常に表示 */}
          {isDraggingEnabled && (
            <Box
              {...provided.dragHandleProps}
              sx={{
                position: 'absolute',
                top: '15px',
                left: '12px',
                cursor: 'grab',
                display: 'flex',
                alignItems: 'center',
                opacity: snapshot.isDragging ? 1 : 0.2,
                '&:hover': {
                  opacity: 1
                }
              }}
            >
              <DragIndicatorIcon fontSize="small" />
            </Box>
          )}

          {/* カードヘッダー */}
          <CardHeader
            sx={{
              pt: 2,
              pb: collapsed ? 2 : 1.5,
              pl: isDraggingEnabled ? 6 : 3,
              pr: 2,
              borderBottom: collapsed ? 'none' : '1px solid rgba(230, 230, 230, 0.5)',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(245, 247, 249, 0.5)'
              }
            }}
            onClick={handleToggleCollapse}
            avatar={
              icon && (
                <Box sx={{ color: 'text.secondary', opacity: 0.8, mr: 1, display: 'flex', alignItems: 'center' }}>
                  {icon}
                </Box>
              )
            }
            title={
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 500,
                  fontSize: '1rem',
                  color: 'rgba(55, 53, 47, 1)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {title}
              </Typography>
            }
            action={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {/* 折りたたみボタン */}
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleCollapse();
                  }}
                  size="small"
                  sx={{ mr: 0.5 }}
                >
                  {collapsed ? (
                    <ExpandMoreIcon fontSize="small" />
                  ) : (
                    <ExpandLessIcon fontSize="small" />
                  )}
                </IconButton>

                {/* もっと見るメニュー */}
                <IconButton
                  onClick={handleMenuOpen}
                  size="small"
                  sx={{ ml: 0.5 }}
                >
                  <MoreHorizIcon fontSize="small" />
                </IconButton>

                {/* ドロップダウンメニュー */}
                <Menu
                  anchorEl={menuAnchorEl}
                  open={isMenuOpen}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  PaperProps={{
                    elevation: 1,
                    sx: {
                      minWidth: 180,
                      borderRadius: '4px',
                      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
                      mt: 0.5
                    }
                  }}
                >
                  {/* 表示/非表示の切り替え */}
                  {canHide && (
                    <MenuItem onClick={handleToggleVisibility}>
                      <ListItemIcon>
                        <VisibilityOffIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="非表示にする" />
                    </MenuItem>
                  )}

                  <Divider sx={{ my: 0.5 }} />

                  {/* 上に移動 */}
                  <MenuItem onClick={handleMoveUp} disabled={isFirst || !isDraggingEnabled}>
                    <ListItemIcon>
                      <ArrowUpwardIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="上に移動" />
                  </MenuItem>

                  {/* 下に移動 */}
                  <MenuItem onClick={handleMoveDown} disabled={isLast || !isDraggingEnabled}>
                    <ListItemIcon>
                      <ArrowDownwardIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="下に移動" />
                  </MenuItem>
                </Menu>
              </Box>
            }
          />

          {/* コンテンツ部分 */}
          <Collapse in={!collapsed} timeout="auto">
            <CardContent
              sx={{
                p: 3,
                backgroundColor: 'white',
                '&:last-child': { pb: 3 }
              }}
            >
              {children}
            </CardContent>
          </Collapse>
        </Card>
      )}
    </Draggable>
  );
}; 