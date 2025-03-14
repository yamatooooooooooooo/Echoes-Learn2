import React, { useState, useRef, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Divider,
  useMediaQuery,
  useTheme,
  Collapse,
  InputBase,
  Avatar,
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
  Search as SearchIcon,
  Add as AddIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Folder as FolderIcon,
  MoreHoriz as MoreHorizIcon,
  ExpandMore,
  ExpandLess,
  Backup as BackupIcon,
  ChevronLeft as ChevronLeftIcon,
  HelpOutline as HelpOutlineIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

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
      { 
        id: 'studyTracking', 
        text: '学習状況', 
        icon: <ShowChartIcon />, 
        type: 'folder',
        children: [
          { id: 'progress', text: '学習進捗', icon: <ShowChartIcon />, type: 'page' },
          { id: 'study', text: '学習記録', icon: <HistoryIcon />, type: 'page' },
        ]
      },
      { id: 'gamification', text: '学習成果', icon: <EmojiEventsIcon />, type: 'page' },
    ]
  },
  {
    id: 'settings',
    text: '設定',
    icon: <SettingsIcon />,
    type: 'page'
  },
  {
    id: 'backup',
    text: 'バックアップ',
    icon: <BackupIcon />,
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
    workspace: true,
    studyTracking: false
  });
  const [searchQuery, setSearchQuery] = useState('');

  // ドロワーの幅をデバイスサイズに合わせて調整
  const drawerWidth = isMobile ? 240 : isTablet ? 260 : 280;

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

  // ドロワーの内容コンポーネント
  const DrawerContent = () => (
    <>
      <Toolbar 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 1.5,
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            alt="Echoes Learn"
            src="/logo.png"
            sx={{ 
              width: 32, 
              height: 32, 
              mr: 1,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              bgcolor: 'white'
            }}
          >
            E
          </Avatar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ 
              fontWeight: 700,
              fontSize: '1.1rem',
              color: 'white'
            }}
          >
            Echoes Learn
          </Typography>
        </Box>
        <IconButton onClick={onToggle} sx={{ ml: 1, color: 'white' }}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      
      {/* 検索ボックス */}
      <Box sx={{ px: 2, py: 1 }}>
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
        </Box>
      </Box>
      
      <Divider sx={{ mx: 2, my: 0.5 }} />
      
      <Box sx={{ 
        overflowY: 'auto',
        flex: 1,
        p: 1,
        '::-webkit-scrollbar': {
          width: '4px',
        },
        '::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
        },
        '::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.divider,
          borderRadius: '4px',
        }
      }}>
        <List 
          dense 
          component="nav"
          sx={{ p: 0 }}
        >
          {renderMenuItems(sidebarItems)}
        </List>
      </Box>
      
      <Divider />
      
      <List dense sx={{ p: 0 }}>
        <ListItemButton
          component={RouterLink}
          to="/help"
          sx={{
            borderRadius: 1,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <ListItemIcon>
            <HelpOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="ヘルプ" />
        </ListItemButton>
      </List>
    </>
  );

  // モバイル用ドロワー
  const mobileDrawer = (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onToggle}
      ModalProps={{
        keepMounted: true, // モバイルでのパフォーマンス向上
      }}
      sx={{
        '& .MuiDrawer-paper': { 
          width: drawerWidth,
          boxSizing: 'border-box',
          boxShadow: theme.shadows[5],
          borderRadius: { xs: 0, sm: '0 8px 8px 0' }
        },
      }}
    >
      <DrawerContent />
    </Drawer>
  );

  // デスクトップ用ドロワー
  const desktopDrawer = (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        '& .MuiDrawer-paper': { 
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
          // スクロールバーのカスタマイズ
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.divider,
            borderRadius: '4px',
          }
        },
      }}
    >
      <DrawerContent />
    </Drawer>
  );

  return (
    <nav>
      {/* フローティングメニューボタン - AppBarの代わり */}
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={onToggle}
        size="small"
        sx={{
          position: 'fixed',
          top: 12,
          left: 12,
          backgroundColor: theme.palette.background.paper,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: theme.zIndex.drawer + 1,
          width: 40, 
          height: 40,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          }
        }}
      >
        <MenuIcon fontSize="small" />
      </IconButton>
      
      {/* デバイスタイプに応じたドロワーの表示 */}
      {isMobile ? mobileDrawer : desktopDrawer}
    </nav>
  );
}; 