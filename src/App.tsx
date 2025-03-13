import React, { useState, createContext, useContext, useEffect, useMemo, useCallback } from 'react';
import { Box, CssBaseline, Typography, Button, useMediaQuery, useTheme } from '@mui/material';
import { SubjectList } from './presentation/features/subject/components/SubjectList';
import DashboardScreen, { DashboardScreenComponent } from './presentation/features/dashboard/components/DashboardScreen';
import { Sidebar } from './presentation/components/Sidebar';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './presentation/features/auth/pages/LoginPage';
import SignupPage from './presentation/features/auth/pages/SignupPage';
import PrivateRoute from './presentation/components/PrivateRoute';
import ErrorBoundary from './presentation/components/common/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { SettingsPage } from './presentation/features/settings/pages/SettingsPage';

// ナビゲーションコンテキスト
interface NavigationContextType {
  navigateTo: (menu: string) => void;
}

// コンテキストの作成
export const NavigationContext = createContext<NavigationContextType>({
  navigateTo: () => {}
});

// 独自フックでコンテキストを使用
export const useNavigation = () => useContext(NavigationContext);

// エラーハンドリング関数
const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('アプリケーションエラー:', error);
  console.error('コンポーネントスタック:', errorInfo.componentStack);
  
  // Firebaseアナリティクスにエラーを送信
  try {
    const analytics = getAnalytics();
    logEvent(analytics, 'app_exception', {
      description: `${error.name}: ${error.message}`,
      stackTrace: errorInfo.componentStack,
      fatal: true
    });
  } catch (analyticsError) {
    console.error('エラーログの送信に失敗しました:', analyticsError);
  }
};

const App: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  
  // 画面サイズが変更されたときにドロワーの状態を調整
  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  // メモ化したドロワートグル処理
  const handleDrawerToggle = useCallback(() => {
    setDrawerOpen(prevState => !prevState);
  }, []);

  // メモ化したメニュー選択処理
  const handleMenuSelect = useCallback((menu: string) => {
    // 現在は「ダッシュボード」と「科目管理」のみ有効
    if (menu === 'dashboard' || menu === 'subjects' || menu === 'settings') {
      setSelectedMenu(menu);
    } else {
      setSelectedMenu('dashboard');
    }
    
    // モバイルでは自動的にドロワーを閉じる
    if (isMobile) {
      setDrawerOpen(false);
    }
  }, [isMobile]);

  // ナビゲーション関数（メモ化）
  const navigateTo = useCallback((menu: string) => {
    // 現在は「ダッシュボード」と「科目管理」のみ有効
    if (menu === 'dashboard' || menu === 'subjects' || menu === 'settings') {
      setSelectedMenu(menu);
    } else {
      setSelectedMenu('dashboard');
    }
    
    // モバイルでは自動的にドロワーを閉じる
    if (isMobile) {
      setDrawerOpen(false);
    }
  }, [isMobile]);

  // 日付フォーマット関数（メモ化して一貫性を保つ）
  const formatDate = useCallback((date: Date | string | undefined): string => {
    if (!date) return '未設定';
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // サイドバーが開いているときのコンテンツのマージン
  const drawerWidth = 240;

  // コンテンツレンダリング処理（メモ化）
  const renderContent = useMemo(() => {
    switch (selectedMenu) {
      case 'dashboard':
        return <DashboardScreenComponent />;
      case 'subjects':
        return <SubjectList formatDate={formatDate} />;
      case 'settings':
        return <SettingsPage />;
      // 将来の拡張のために準備
      // case 'gamification':
      //   return <GamificationPage />;
      default:
        return <DashboardScreenComponent />;
    }
  }, [selectedMenu, formatDate]);

  // メモ化されたフッターコンポーネント
  const footerContent = useMemo(() => {
    return (
      <Box 
        component="footer" 
        sx={{ 
          padding: 2, 
          textAlign: 'center',
          borderTop: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(18, 18, 18, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          position: 'fixed',
          bottom: 0,
          left: { xs: 0, sm: drawerOpen ? drawerWidth : 0 },
          right: 0,
          width: { xs: '100%', sm: drawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          transition: theme.transitions.create(['left', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          zIndex: 10
        }}
      >
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            fontSize: '0.75rem',
            opacity: 0.8
          }}
        >
          &copy; 2024 Echoes Learn
        </Typography>
      </Box>
    );
  }, [theme.palette.mode, drawerOpen, drawerWidth, theme.transitions]);

  // NavigationContextのメモ化
  const navigationContextValue = useMemo(() => ({ navigateTo }), [navigateTo]);

  return (
    <ErrorBoundary
      fallbackComponent={
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            エラーが発生しました
          </Typography>
          <Button variant="contained" color="primary" onClick={() => window.location.reload()}>
            ページを再読み込み
          </Button>
        </Box>
      }
      onError={handleError}
    >
      <AuthProvider>
        <CssBaseline />
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
          {/* サイドバー */}
          <Sidebar
            open={drawerOpen}
            onToggle={handleDrawerToggle}
            onMenuSelect={handleMenuSelect}
            selectedMenu={selectedMenu}
          />

          {/* メインコンテンツ */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              width: { sm: `calc(100% - ${drawerWidth}px)` },
              ml: { sm: drawerOpen ? `${drawerWidth}px` : 0 },
              transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
              ...(drawerOpen && {
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                ml: { sm: `${drawerWidth}px` },
                transition: theme.transitions.create(['margin', 'width'], {
                  easing: theme.transitions.easing.easeOut,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              }),
              height: '100vh',
              overflow: 'auto', // メインコンテナでのみスクロールを許可
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              paddingTop: { xs: 0, sm: 0, md: 0 },
              marginTop: 0
            }}
          >
            {/* スクロール可能なコンテンツエリア - シンプルに変更 */}
            <Box 
              sx={{ 
                padding: { xs: 1, sm: 2, md: 3 },
                paddingTop: { xs: 12, sm: 12, md: 12 }, // パディングを調整
                paddingBottom: { xs: 80, sm: 40, md: 20 }, // パディングを調整
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                minHeight: '100vh',
                overflow: 'visible' // 内部コンテナではスクロールを無効化
              }}
            >
              <NavigationContext.Provider value={navigationContextValue}>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route
                    path="/"
                    element={<PrivateRoute />}
                  >
                    <Route index element={<>{renderContent}</>} />
                  </Route>
                </Routes>
              </NavigationContext.Provider>
            </Box>
            
            {/* グローバルフッター */}
            {footerContent}
          </Box>
        </Box>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App; 