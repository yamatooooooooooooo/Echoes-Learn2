import React, { useState, useRef, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Divider,
  useMediaQuery,
  useTheme,
  SwipeableDrawer,
  Collapse,
  InputBase,
  Avatar,
  Tooltip,
  Button,
  alpha
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  MenuBook as MenuBookIcon,
  ShowChart as ShowChartIcon,
  Settings as SettingsIcon,
  EmojiEvents as EmojiEventsIcon,
  History as HistoryIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  NoteAdd as NoteAddIcon,
  Folder as FolderIcon,
  MoreHoriz as MoreHorizIcon,
  DragIndicator as DragIndicatorIcon,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';

// サイドバーのプロパティ型
interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  onMenuSelect: (menu: string) => void;
  selectedMenu: string;
}

// サイドバー項目の型定義
interface SidebarItem {
  id: string;
  text: string;
  icon: React.ReactNode;
  type: 'page' | 'folder' | 'section';
  children?: SidebarItem[];
  starred?: boolean;
}

// サイドバー項目の定義
const sidebarItems: SidebarItem[] = [
  {
    id: 'favorites',
    text: 'お気に入り',
    icon: <StarIcon />,
    type: 'section',
    children: [
      { id: 'dashboard', text: 'ダッシュボード', icon: <DashboardIcon />, type: 'page', starred: true },
    ]
  },
  {
    id: 'workspace',
    text: 'ワークスペース',
    icon: <FolderIcon />,
    type: 'section',
    children: [
      { id: 'subjects', text: '科目管理', icon: <MenuBookIcon />, type: 'page' },
      { id: 'gamification', text: '学習成果', icon: <EmojiEventsIcon />, type: 'page' },
    ]
  },
  {
    id: 'settings',
    text: '設定',
    icon: <SettingsIcon />,
    type: 'page'
  }
];

// アクセシビリティ対応: aria-hiddenの代わりにinert属性を使用
const applyAccessibility = (element: HTMLElement, shouldBeHidden: boolean) => {
  if (shouldBeHidden) {
    element.setAttribute('inert', '');
  } else {
    element.removeAttribute('inert');
  }
};

/**
 * Notion風サイドバーコンポーネント
 * アプリケーションのナビゲーションメニューを提供する
 */
export const Sidebar: React.FC<SidebarProps> = ({
  open,
  onToggle,
  onMenuSelect,
  selectedMenu
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const drawerRef = useRef<HTMLDivElement>(null);
  const [sidebarWidth, setSidebarWidth] = useState(isMobile ? 280 : 260);
  const [resizing, setResizing] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    favorites: true,
    workspace: true
  });
  const [searchQuery, setSearchQuery] = useState('');

  // フォルダの開閉状態を切り替える
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  // お気に入り状態を切り替える
  const toggleStar = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    // 実際のアプリケーションではここでお気に入り状態を更新するロジックを実装
    console.log(`Toggled star for ${itemId}`);
  };

  // サイドバーのリサイズを開始
  const startResize = (e: React.MouseEvent) => {
    if (isMobile) return;
    
    e.preventDefault();
    setResizing(true);
    
    const onMouseMove = (e: MouseEvent) => {
      // 最小幅と最大幅を設定
      const newWidth = Math.max(240, Math.min(400, e.clientX));
      setSidebarWidth(newWidth);
    };
    
    const onMouseUp = () => {
      setResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // 再帰的にメニュー項目をレンダリング
  const renderMenuItems = (items: SidebarItem[], level = 0) => {
    return items.map((item) => {
      const isSelected = selectedMenu === item.id;
      const isExpanded = expandedFolders[item.id] || false;
      const hasChildren = item.children && item.children.length > 0;
      const paddingLeft = level * 16 + 8;
      
      // セクションヘッダー
      if (item.type === 'section') {
        return (
          <React.Fragment key={item.id}>
            <ListItem 
              disablePadding
              sx={{ 
                mt: level === 0 ? 2 : 1, 
                mb: 0.5
              }}
            >
              <ListItemButton
                onClick={() => toggleFolder(item.id)}
                sx={{
                  py: 0.5,
                  px: 2,
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: 'transparent',
                  }
                }}
              >
                {hasChildren && (
                  <ExpandMore
                    sx={{
                      mr: 1,
                      transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: '0.2s',
                      fontSize: '1.2rem',
                      color: theme.palette.text.secondary,
                    }}
                  />
                )}
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    variant: 'overline',
                    fontSize: '0.75rem',
                    color: theme.palette.text.secondary,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                />
              </ListItemButton>
            </ListItem>
            
            {hasChildren && item.children && (
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                {renderMenuItems(item.children, level + 1)}
              </Collapse>
            )}
          </React.Fragment>
        );
      }
      
      // フォルダ
      if (item.type === 'folder') {
        return (
          <React.Fragment key={item.id}>
            <ListItem 
              disablePadding
              sx={{ 
                mb: 0.5,
                pl: `${paddingLeft}px`
              }}
            >
              <ListItemButton
                onClick={() => toggleFolder(item.id)}
                sx={{
                  py: 0.8,
                  px: 2,
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 32,
                    color: theme.palette.text.secondary,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                  }}
                />
                {hasChildren && (
                  isExpanded ? (
                    <ExpandLess sx={{ color: theme.palette.text.secondary }} />
                  ) : (
                    <ExpandMore sx={{ color: theme.palette.text.secondary }} />
                  )
                )}
              </ListItemButton>
            </ListItem>
            
            {hasChildren && item.children && (
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                {renderMenuItems(item.children, level + 1)}
              </Collapse>
            )}
          </React.Fragment>
        );
      }
      
      // 通常のページ
      return (
        <ListItem 
          key={item.id}
          disablePadding
          sx={{ 
            mb: 0.5,
            pl: `${paddingLeft}px`
          }}
        >
          <ListItemButton
            selected={isSelected}
            onClick={() => onMenuSelect(item.id)}
            sx={{
              py: 0.8,
              px: 2,
              borderRadius: '4px',
              backgroundColor: isSelected ? 
                alpha(theme.palette.primary.main, 0.12) : 'transparent',
              '&:hover': {
                backgroundColor: isSelected ? 
                  alpha(theme.palette.primary.main, 0.16) : 
                  alpha(theme.palette.primary.main, 0.08),
              },
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.16),
                }
              }
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 32,
                color: isSelected ? theme.palette.primary.main : theme.palette.text.secondary,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: isSelected ? 500 : 400,
                fontSize: '0.9rem',
                color: isSelected ? theme.palette.primary.main : theme.palette.text.primary,
              }}
            />
            <IconButton
              onClick={(e) => toggleStar(e, item.id)}
              size="small"
              sx={{ 
                opacity: item.starred || isSelected ? 1 : 0,
                '&:hover': { opacity: 1 },
                ml: 1
              }}
            >
              {item.starred ? (
                <StarIcon fontSize="small" color="warning" />
              ) : (
                <StarBorderIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
              )}
            </IconButton>
          </ListItemButton>
        </ListItem>
      );
    });
  };

  const drawerContent = (
    <Box 
      sx={{ 
        width: isMobile ? '85%' : sidebarWidth, 
        maxWidth: isMobile ? 280 : '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        pt: 5
      }} 
      role="navigation"
      ref={drawerRef}
    >
      {/* サイドバーヘッダー */}
      <Box sx={{ 
        p: 2,
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              width: 32, 
              height: 32, 
              mr: 1,
              bgcolor: theme.palette.primary.main,
              fontSize: '1rem'
            }}
          >
            E
          </Avatar>
          <Typography variant="subtitle1" fontWeight={600}>
            Echoes Learn
          </Typography>
        </Box>
        <IconButton size="small" onClick={onToggle}>
          <MoreHorizIcon />
        </IconButton>
      </Box>
      
      {/* 検索ボックス */}
      <Box sx={{ px: 2, pb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.08) : alpha(theme.palette.common.black, 0.04),
            borderRadius: '6px',
            p: '4px 8px',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.12) : alpha(theme.palette.common.black, 0.06),
            }
          }}
        >
          <SearchIcon sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: '1.2rem' }} />
          <InputBase
            placeholder="検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              fontSize: '0.9rem',
              flex: 1,
              '& .MuiInputBase-input': {
                p: '4px 0',
              }
            }}
          />
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ 
              backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.1) : alpha(theme.palette.common.black, 0.08),
              p: '1px 4px',
              borderRadius: '4px',
              fontSize: '0.7rem',
            }}
          >
            ⌘K
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ mx: 2, my: 0.5 }} />
      
      {/* メニューリスト */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1 }}>
        <List disablePadding>
          {renderMenuItems(sidebarItems)}
        </List>
      </Box>
      
      <Divider sx={{ mx: 2, my: 0.5 }} />
      
      {/* ページ作成ボタン */}
      <Box sx={{ p: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<AddIcon />}
          fullWidth
          size="small"
          sx={{ 
            justifyContent: 'flex-start',
            textTransform: 'none',
            borderRadius: '6px',
            py: 0.8,
            borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.1) : alpha(theme.palette.common.black, 0.1),
            color: theme.palette.text.primary,
            '&:hover': {
              borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.2) : alpha(theme.palette.common.black, 0.2),
              backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.03),
            }
          }}
        >
          新しいページ
        </Button>
      </Box>
      
      {/* リサイズハンドル */}
      {!isMobile && (
        <Box
          sx={{
            position: 'absolute',
            height: '100%',
            width: '5px',
            top: 0,
            right: 0,
            cursor: 'ew-resize',
            '&:hover': {
              backgroundColor: theme.palette.primary.main,
            },
            ...(resizing && {
              backgroundColor: theme.palette.primary.main,
            })
          }}
          onMouseDown={startResize}
        />
      )}
    </Box>
  );

  // サイドバーの開閉状態が変わった時にアクセシビリティ対応を行う
  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent && isMobile) {
      applyAccessibility(mainContent as HTMLElement, open);
    }
    return () => {
      if (mainContent && isMobile) {
        applyAccessibility(mainContent as HTMLElement, false);
      }
    };
  }, [open, isMobile]);

  return (
    <>
      {/* AppBarを削除 */}
      
      {/* メニューボタンを独立して配置 */}
      <IconButton
        color="inherit"
        aria-label={open ? 'メニューを閉じる' : 'メニューを開く'}
        edge="start"
        onClick={onToggle}
        sx={{ 
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: theme.zIndex.drawer + 2,
          backgroundColor: theme.palette.background.paper,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          }
        }}
      >
        <MenuIcon />
      </IconButton>
      
      {/* モバイル用ドロワー */}
      {isMobile ? (
        <SwipeableDrawer
          variant="temporary"
          open={open}
          onClose={onToggle}
          onOpen={onToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': { 
              width: '85%',
              maxWidth: 280, 
              boxSizing: 'border-box',
              backgroundColor: theme.palette.background.paper,
              borderRight: '1px solid',
              borderColor: theme.palette.divider,
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)'
            },
            zIndex: theme.zIndex.drawer + 2,
          }}
        >
          {drawerContent}
        </SwipeableDrawer>
      ) : (
        // タブレット・デスクトップ用ドロワー
        <Drawer
          variant="persistent"
          open={open}
          onClose={onToggle}
          sx={{
            width: sidebarWidth,
            flexShrink: 0,
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              width: sidebarWidth, 
              boxSizing: 'border-box',
              backgroundColor: theme.palette.background.paper,
              borderRight: '1px solid',
              borderColor: theme.palette.divider,
              height: '100%',
              boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
              transition: resizing ? 'none' : theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
            zIndex: theme.zIndex.drawer,
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
}; 