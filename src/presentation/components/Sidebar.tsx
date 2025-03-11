import React, { useRef, useEffect } from 'react';
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
  SwipeableDrawer
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { 
  Dashboard as DashboardIcon,
  MenuBook as MenuBookIcon,
  ShowChart as ShowChartIcon,
  Settings as SettingsIcon,
  EmojiEvents as EmojiEventsIcon,
  History as HistoryIcon
} from '@mui/icons-material';

// サイドバーのプロパティ型
interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  onMenuSelect: (menu: string) => void;
  selectedMenu: string;
}

// メニュー項目の定義
const menuItems = [
  { id: 'dashboard', text: 'ダッシュボード', icon: <DashboardIcon /> },
  { id: 'subjects', text: '科目管理', icon: <MenuBookIcon /> },
  // 以下の項目は一時的に非表示
  // { id: 'progress', text: '学習進捗', icon: <ShowChartIcon /> },
  // { id: 'study', text: '学習記録', icon: <HistoryIcon /> },
  // { id: 'gamification', text: '学習成果', icon: <EmojiEventsIcon /> },
  // { id: 'settings', text: '設定', icon: <SettingsIcon /> }
];

/**
 * サイドバーコンポーネント
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

  // フォーカス管理
  useEffect(() => {
    // ドロワーが閉じられたときにフォーカス可能な要素からフォーカスを外す
    if (!open && drawerRef.current) {
      const focusableElements = drawerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      focusableElements.forEach((el) => {
        (el as HTMLElement).setAttribute('tabindex', '-1');
      });
    } else if (open && drawerRef.current) {
      // ドロワーが開いたときにフォーカス可能な要素のtabindexを復元
      const focusableElements = drawerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex="-1"]'
      );
      
      focusableElements.forEach((el) => {
        (el as HTMLElement).removeAttribute('tabindex');
      });
    }
  }, [open]);

  const drawerContent = (
    <Box sx={{ width: isMobile ? '85%' : 240, maxWidth: isMobile ? 280 : 'none' }} role="navigation">
      <Box sx={{ 
        p: { xs: 1.5, sm: 2 }, 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography variant="h6" component="div">
          Echoes Learn
        </Typography>
      </Box>
      <Divider />
      <List sx={{ pt: { xs: 1, sm: 1.5 } }}>
        {menuItems.map((item) => (
          <ListItem 
            key={item.id} 
            disablePadding
            sx={{ 
              mb: { xs: 0.5, sm: 0.5 },
              px: { xs: 1, sm: 1 }
            }}
          >
            <ListItemButton
              selected={selectedMenu === item.id}
              onClick={() => onMenuSelect(item.id)}
              sx={{
                py: { xs: 1, sm: 1.2 },
                px: { xs: 1.5, sm: 2 },
                borderRadius: '8px',
                borderLeft: selectedMenu === item.id ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                backgroundColor: selectedMenu === item.id ? 
                  (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)') : 
                  'transparent',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)',
                }
              }}
            >
              <ListItemIcon
                sx={{
                  color: selectedMenu === item.id ? theme.palette.primary.main : 'inherit',
                  minWidth: { xs: '40px', sm: '40px' }
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: selectedMenu === item.id ? 600 : 400,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(18, 18, 18, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          color: theme.palette.text.primary,
          backdropFilter: 'blur(8px)',
          display: 'flex'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label={open ? 'メニューを閉じる' : 'メニューを開く'}
            edge="start"
            onClick={onToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.id === selectedMenu)?.text || ''}
          </Typography>
        </Toolbar>
      </AppBar>
      
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
              marginTop: 0,
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
            width: isTablet ? 260 : 240,
            flexShrink: 0,
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              width: isTablet ? 260 : 240, 
              boxSizing: 'border-box',
              backgroundColor: theme.palette.background.paper,
              borderRight: '1px solid',
              borderColor: theme.palette.divider,
              marginTop: '64px',
              height: 'calc(100% - 64px)',
              boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)'
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