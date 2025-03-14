import { useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { ConstructionOutlined as ConstructionIcon } from '@mui/icons-material';

interface UseMaintenanceMessageOptions {
  message?: string;
  duration?: number;
}

/**
 * メンテナンスメッセージを表示するためのカスタムフック
 *
 * @param options 設定オプション
 * @returns メンテナンスメッセージの表示・非表示を制御する関数と表示用コンポーネント
 *
 * 使用例:
 * ```
 * const { showMaintenanceMessage, MaintenanceMessageComponent } = useMaintenanceMessage();
 *
 * return (
 *   <>
 *     <Button onClick={() => showMaintenanceMessage()}>クリック</Button>
 *     <MaintenanceMessageComponent />
 *   </>
 * );
 * ```
 */
export const useMaintenanceMessage = (options?: UseMaintenanceMessageOptions) => {
  const { message = 'この機能は現在メンテナンス中です。近日中に実装予定です。', duration = 4000 } =
    options || {};

  const [open, setOpen] = useState(false);

  // メンテナンスメッセージを表示する関数
  const showMaintenanceMessage = useCallback(() => {
    setOpen(true);
  }, []);

  // メンテナンスメッセージを閉じる関数
  const closeMaintenanceMessage = useCallback(() => {
    setOpen(false);
  }, []);

  // 元のハンドラを実行しつつメンテナンスメッセージも表示するラッパー関数
  const wrapWithMaintenanceMessage = useCallback(
    (originalHandler?: () => void) => {
      return () => {
        showMaintenanceMessage();
        if (originalHandler) {
          originalHandler();
        }
      };
    },
    [showMaintenanceMessage]
  );

  // メンテナンスメッセージコンポーネント
  const MaintenanceMessageComponent = useCallback(() => {
    return (
      <Snackbar
        open={open}
        autoHideDuration={duration}
        onClose={closeMaintenanceMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={closeMaintenanceMessage}
          severity="info"
          sx={{ width: '100%', alignItems: 'center' }}
          icon={<ConstructionIcon />}
        >
          {message}
        </Alert>
      </Snackbar>
    );
  }, [open, duration, closeMaintenanceMessage, message]);

  return {
    showMaintenanceMessage,
    closeMaintenanceMessage,
    wrapWithMaintenanceMessage,
    MaintenanceMessageComponent,
  };
};
