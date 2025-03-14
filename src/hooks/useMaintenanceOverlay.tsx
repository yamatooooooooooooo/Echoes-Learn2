import React from 'react';
import { Box, Typography, Paper, Fade, Backdrop, Button, Snackbar, Alert } from '@mui/material';
import { ConstructionOutlined as ConstructionIcon } from '@mui/icons-material';

/**
 * メンテナンス中のコンポーネントをラップするためのHOC（Higher Order Component）
 * @param Component ラップするコンポーネント
 * @param options オプション設定
 * @returns ラップされたコンポーネント
 *
 * 使用例:
 * ```
 * const WrappedComponent = withMaintenanceOverlay(MyComponent, {
 *   message: 'この機能は現在メンテナンス中です',
 *   showComponent: true
 * });
 * ```
 */
export function withMaintenanceOverlay<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    message?: string;
    title?: string;
    showComponent?: boolean;
    severity?: 'info' | 'warning';
  } = {}
): React.FC<P> {
  const {
    message = 'この機能は現在メンテナンス中です。近日中に実装予定です。',
    title = '機能準備中',
    showComponent = true,
    severity = 'info',
  } = options;

  // ラップするコンポーネントを返す
  const WrappedComponent: React.FC<P> = (props: P) => {
    const [showSnackbar, setShowSnackbar] = React.useState(false);

    // スナックバーを表示する関数
    const handleShowSnackbar = () => {
      setShowSnackbar(true);
    };

    // スナックバーを閉じる関数
    const handleCloseSnackbar = () => {
      setShowSnackbar(false);
    };

    // 1秒後に自動的にスナックバーを表示
    React.useEffect(() => {
      const timer = setTimeout(() => {
        handleShowSnackbar();
      }, 1000);

      return () => clearTimeout(timer);
    }, []);

    return (
      <>
        {/* 元のコンポーネントを表示 */}
        {showComponent && <Component {...props} />}

        {/* メンテナンスオーバーレイ */}
        <Backdrop
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          open={true}
        >
          <Fade in={true}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                maxWidth: '80%',
                maxHeight: '80%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <ConstructionIcon fontSize="large" color={severity} sx={{ mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                {title}
              </Typography>
              <Typography variant="body1" paragraph>
                {message}
              </Typography>
              <Button variant="outlined" color="primary" onClick={handleShowSnackbar}>
                了解
              </Button>
            </Paper>
          </Fade>
        </Backdrop>

        {/* 通知メッセージ */}
        <Snackbar
          open={showSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={severity}
            sx={{ width: '100%' }}
            icon={<ConstructionIcon />}
          >
            {message}
          </Alert>
        </Snackbar>
      </>
    );
  };

  return WrappedComponent;
}
