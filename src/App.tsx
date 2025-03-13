import React, { useState, createContext, useContext, useEffect } from 'react';
import { Box, CssBaseline, Typography, Button, useMediaQuery, useTheme } from '@mui/material';
import { SubjectList } from './presentation/features/subject/components/SubjectList';
import DashboardScreen from './presentation/features/dashboard/components/DashboardScreen';
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

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuSelect = (menu: string) => {
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
  };

  // ナビゲーション関数
  const navigateTo = (menu: string) => {
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
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '未設定';
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // サイドバーが開いているときのコンテンツのマージン
  const drawerWidth = 240;

  const renderContent = () => {
    switch (selectedMenu) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'subjects':
        return <SubjectList formatDate={formatDate} />;
      case 'settings':
        return <SettingsPage />;
      // 以下のケースは一時的に無効化
      // case 'progress':
      //   return <ProgressStatsPage />;
      // case 'study':
      //   return <StudySessionPage />;
      // case 'gamification':
      //   return <GamificationPage />;
      default:
        return <DashboardScreen />;
    }
  };

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
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* スクロール可能なコンテンツエリア - シンプルに変更 */}
            <Box 
              sx={{ 
                padding: { xs: 1, sm: 2, md: 3 },
                paddingTop: { xs: 8, sm: 8, md: 8 },
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <NavigationContext.Provider value={{ navigateTo }}>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route
                    path="/"
                    element={<PrivateRoute />}
                  >
                    <Route index element={<>{renderContent()}</>} />
                  </Route>
                </Routes>
              </NavigationContext.Provider>
            </Box>
          </Box>
        </Box>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App; 