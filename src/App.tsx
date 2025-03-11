import React, { useState, createContext, useContext } from 'react';
import { Box, CssBaseline, ThemeProvider, IconButton, useMediaQuery, useTheme, Typography, Alert, Button } from '@mui/material';
import { SubjectList } from './presentation/features/subject/components/SubjectList';
import { ProgressStats } from './presentation/features/progress/components/ProgressStats';
import DashboardScreen from './presentation/features/dashboard/components/DashboardScreen';
import { Sidebar } from './presentation/components/Sidebar';
import { Routes, Route } from 'react-router-dom';
import GamificationPage from './presentation/features/gamification/pages/GamificationPage';
import { theme } from './theme/theme';
import LoginPage from './presentation/features/auth/pages/LoginPage';
import SignupPage from './presentation/features/auth/pages/SignupPage';
import PrivateRoute from './presentation/components/PrivateRoute';
import ErrorBoundary from './presentation/components/common/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import StudySessionPage from './presentation/features/study/pages/StudySessionPage';
import { getAnalytics, logEvent } from 'firebase/analytics';
import MenuIcon from '@mui/icons-material/Menu';
import ProgressStatsPage from './presentation/features/progress/pages/ProgressStatsPage';

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
  const theme = useTheme();
  // モバイルとタブレットの状態を使用するロジックをコメント
  /* 
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md')); 
  */

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
    <ErrorBoundary onError={handleError}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <NavigationContext.Provider value={{ navigateTo }}>
            <Routes>
              {/* 認証が不要なルート */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              {/* 認証が必要なルート */}
              <Route element={<PrivateRoute />}>
                <Route path="/" element={
                  <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF', minHeight: '100vh' }}>
                    {/* オーバーレイ */}
                    {drawerOpen && (
                      <Box
                        onClick={handleDrawerToggle}
                        sx={{
                          position: 'fixed',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          bgcolor: 'rgba(0, 0, 0, 0.4)',
                          zIndex: theme.zIndex.drawer - 1,
                          transition: 'background-color 0.3s ease',
                        }}
                      />
                    )}
                    
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
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        p: { xs: 2, sm: 2, md: 3 }, // レスポンシブパディング
                        width: '100%',
                        maxWidth: '1200px',
                        mx: 'auto', // 左右のマージンを自動で、中央に配置
                        transition: theme.transitions.create(['filter'], {
                          easing: theme.transitions.easing.sharp,
                          duration: theme.transitions.duration.leavingScreen,
                        }),
                        filter: drawerOpen ? 'brightness(0.95)' : 'none',
                        bgcolor: '#FFFFFF', // 背景色を白に設定
                      }}
                    >
                      {/* メニュー開閉ボタン */}
                      <IconButton
                        color="inherit"
                        aria-label={drawerOpen ? 'メニューを閉じる' : 'メニューを開く'}
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ 
                          mr: 2, 
                          position: 'fixed', 
                          top: '10px', 
                          left: '10px',
                          zIndex: theme.zIndex.drawer + 2,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                          transition: theme.transitions.create(['left', 'box-shadow'], {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen,
                          }),
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.15)',
                          },
                          // モバイルでボタンを大きくして押しやすくする
                          padding: { xs: '8px', sm: '8px' },
                          width: { xs: '40px', sm: '40px' },
                          height: { xs: '40px', sm: '40px' },
                        }}
                      >
                        <MenuIcon />
                      </IconButton>
                      
                      {/* コンテンツの上部にスペースを追加してボタンと重ならないようにする */}
                      <Box sx={{ 
                        mt: { xs: 5, sm: 5, md: 5 },
                        width: '100%',
                      }}>
                        {renderContent()}
                      </Box>
                    </Box>
                  </Box>
                } />
                <Route path="/gamification" element={<GamificationPage />} />
              </Route>
            </Routes>
          </NavigationContext.Provider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App; 