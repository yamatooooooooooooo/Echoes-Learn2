import React, { useState, createContext, useContext } from 'react';
import { Box, CssBaseline, IconButton, Typography, Button } from '@mui/material';
import { SubjectList } from './presentation/features/subject/components/SubjectList';
import DashboardScreen from './presentation/features/dashboard/components/DashboardScreen';
import { Sidebar } from './presentation/components/Sidebar';
import { Routes, Route } from 'react-router-dom';
import GamificationPage from './presentation/features/gamification/pages/GamificationPage';
import LoginPage from './presentation/features/auth/pages/LoginPage';
import SignupPage from './presentation/features/auth/pages/SignupPage';
import PrivateRoute from './presentation/components/PrivateRoute';
import ErrorBoundary from './presentation/components/common/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import StudySessionPage from './presentation/features/study/pages/StudySessionPage';
import { getAnalytics, logEvent } from 'firebase/analytics';
import MenuIcon from '@mui/icons-material/Menu';
import ProgressStatsPage from './presentation/features/progress/pages/ProgressStatsPage';
import { ThemeToggle } from './presentation/components/common/ThemeToggle';

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuSelect = (menu: string) => {
    setSelectedMenu(menu);
  };

  // ナビゲーション関数
  const navigateTo = (menu: string) => {
    setSelectedMenu(menu);
    // モバイルでは自動的にドロワーを閉じる
    if (window.innerWidth < 960) {
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
      case 'progress':
        return <ProgressStatsPage />;
      case 'study':
        return <StudySessionPage />;
      case 'gamification':
        return <GamificationPage />;
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
              p: { xs: 1, sm: 2, md: 3 },
              width: { sm: `calc(100% - ${drawerWidth}px)` },
              ml: { sm: `${drawerWidth}px` },
              overflow: 'auto',
              bgcolor: 'background.default',
              display: 'flex',
              flexDirection: 'column',
              height: '100vh',
            }}
          >
            {/* モバイル表示時のヘッダー */}
            <Box
              sx={{
                display: { sm: 'none', xs: 'flex' },
                p: 1,
                mb: 1,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <IconButton color="inherit" onClick={handleDrawerToggle} edge="start">
                <MenuIcon />
              </IconButton>
              
              {/* テーマ切り替えボタン */}
              <ThemeToggle />
            </Box>

            {/* コンテンツエリア */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <NavigationContext.Provider value={{ navigateTo }}>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route
                    path="/"
                    element={<PrivateRoute />}
                  >
                    <Route index element={
                      <>
                        {renderContent()}
                      </>
                    } />
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