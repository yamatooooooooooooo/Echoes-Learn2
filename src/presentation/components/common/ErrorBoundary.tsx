import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { getAnalytics, logEvent } from 'firebase/analytics';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * エラーバウンダリーコンポーネント
 * Reactコンポーネントツリー内で発生したJavaScriptエラーをキャッチし、
 * エラーメッセージを表示するフォールバックUIを表示します。
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // エラー発生時に状態を更新してフォールバックUIを表示
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // エラー情報をログに記録
    console.error('エラーバウンダリーでエラーをキャッチしました:', error, errorInfo);

    // カスタムエラーハンドラが提供されていれば呼び出す
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Firebaseアナリティクスにエラーをログ
    try {
      const analytics = getAnalytics();
      logEvent(analytics, 'app_exception', {
        description: `${error.name}: ${error.message}`,
        fatal: true,
      });
    } catch (analyticsError) {
      console.error('エラーのログ記録に失敗しました:', analyticsError);
    }

    this.setState({ errorInfo });
  }

  handleReload = (): void => {
    // アプリケーションをリロード
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // カスタムフォールバックUIが提供されていればそれを使用
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      // デフォルトのエラー表示
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            p: 2,
          }}
        >
          <Paper elevation={3} sx={{ p: 4, maxWidth: 600, width: '100%' }}>
            <Typography variant="h5" color="error" gutterBottom>
              問題が発生しました
            </Typography>
            <Typography variant="body1" gutterBottom>
              申し訳ありませんが、アプリケーションでエラーが発生しました。
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
              エラー: {this.state.error?.message}
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button variant="contained" color="primary" onClick={this.handleReload}>
                ページをリロードする
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
