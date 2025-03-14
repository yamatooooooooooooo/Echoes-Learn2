import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

interface PrivateRouteProps {
  children?: React.ReactNode;
}

/**
 * 認証が必要なルートを保護するコンポーネント
 * ログインしていない場合はログインページにリダイレクトする
 * ネストされたRouteの子要素としても、直接子要素を持つ場合もサポート
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuthContext();

  // 認証状態の読み込み中
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 認証されていない場合はログインページにリダイレクト
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 子コンポーネントが提供されている場合はそれを、そうでなければOutletをレンダリング
  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute; 