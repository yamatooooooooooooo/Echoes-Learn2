import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

/**
 * 認証が必要なルートを保護するコンポーネント
 * ログインしていない場合はログインページにリダイレクトする
 */
const PrivateRoute: React.FC = () => {
  const { currentUser, isLoading } = useAuth();

  // 認証状態の読み込み中
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 認証されていない場合はログインページにリダイレクト
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 認証されている場合は子ルートをレンダリング
  return <Outlet />;
};

export default PrivateRoute; 