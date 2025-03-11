import React, { useState } from 'react';
import { 
  Snackbar, 
  Alert, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button 
} from '@mui/material';
import { ConstructionOutlined as ConstructionIcon } from '@mui/icons-material';

interface MaintenanceMessageProps {
  // メッセージのタイプ（トースト通知かモーダルダイアログか）
  type?: 'toast' | 'modal';
  // 表示するメッセージ
  message?: string;
  // モーダルのタイトル（typeがmodalの場合のみ使用）
  title?: string;
  // トリガーとなるイベントハンドラをラップするための関数
  wrapHandler?: (originalHandler?: () => void) => () => void;
}

/**
 * メンテナンス中メッセージコンポーネント
 * 
 * 使用例:
 * <Button 
 *   onClick={MaintenanceMessage.wrapHandler(() => console.log('Original handler'))} 
 * >
 *   クリック
 * </Button>
 * 
 * または:
 * <MaintenanceMessage type="modal" />
 * ...
 * const showMaintenance = MaintenanceMessage.wrapHandler();
 * <Button onClick={showMaintenance}>クリック</Button>
 */
const MaintenanceMessage: React.FC<MaintenanceMessageProps> & {
  wrapHandler: (originalHandler?: () => void) => () => void;
} = ({
  type = 'toast',
  message = 'この機能は現在メンテナンス中です。近日中に実装予定です。',
  title = '機能準備中',
}) => {
  const [open, setOpen] = useState(false);
  
  const handleClose = () => {
    setOpen(false);
  };
  
  if (!open) return null;
  
  if (type === 'toast') {
    return (
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleClose} 
          severity="info" 
          sx={{ width: '100%', alignItems: 'center' }}
          icon={<ConstructionIcon />}
        >
          {message}
        </Alert>
      </Snackbar>
    );
  } else {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="maintenance-dialog-title"
        aria-describedby="maintenance-dialog-description"
      >
        <DialogTitle id="maintenance-dialog-title" sx={{ display: 'flex', alignItems: 'center' }}>
          <ConstructionIcon sx={{ mr: 1 }} />
          {title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="maintenance-dialog-description">
            {message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" autoFocus>
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
};

// 静的メソッドとしてwrapHandlerを追加
MaintenanceMessage.wrapHandler = (originalHandler?: () => void) => {
  // setOpen関数を使うためのステートを管理するコンポーネントを作成
  const MaintenanceMessageWrapper = () => {
    const [open, setOpen] = useState(false);
    
    const handleClick = () => {
      setOpen(true);
      if (originalHandler) {
        originalHandler();
      }
    };
    
    return (
      <>
        <Snackbar
          open={open}
          autoHideDuration={4000}
          onClose={() => setOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setOpen(false)} 
            severity="info" 
            sx={{ width: '100%', alignItems: 'center' }}
            icon={<ConstructionIcon />}
          >
            この機能は現在メンテナンス中です。近日中に実装予定です。
          </Alert>
        </Snackbar>
      </>
    );
  };
  
  // このコンポーネントのインスタンスを作成
  const wrapper = document.createElement('div');
  wrapper.id = 'maintenance-message-wrapper';
  if (!document.getElementById('maintenance-message-wrapper')) {
    document.body.appendChild(wrapper);
  }
  
  return () => {
    const element = document.getElementById('maintenance-message-wrapper');
    if (element) {
      const toast = document.createElement('div');
      toast.className = 'maintenance-toast';
      element.appendChild(toast);
      
      // スナックバーを表示
      const snackbar = document.createElement('div');
      snackbar.className = 'MuiSnackbar-root';
      snackbar.style.position = 'fixed';
      snackbar.style.bottom = '24px';
      snackbar.style.left = '50%';
      snackbar.style.transform = 'translateX(-50%)';
      snackbar.style.zIndex = '1400';
      
      const alert = document.createElement('div');
      alert.className = 'MuiAlert-root MuiAlert-standardInfo';
      alert.style.backgroundColor = '#e3f2fd';
      alert.style.color = '#0288d1';
      alert.style.padding = '6px 16px';
      alert.style.borderRadius = '4px';
      alert.style.boxShadow = '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)';
      alert.style.display = 'flex';
      alert.style.alignItems = 'center';
      
      const message = document.createElement('div');
      message.innerText = 'この機能は現在メンテナンス中です。近日中に実装予定です。';
      
      alert.appendChild(message);
      snackbar.appendChild(alert);
      element.appendChild(snackbar);
      
      // 4秒後に自動で消える
      setTimeout(() => {
        element.removeChild(snackbar);
      }, 4000);
      
      // 元のハンドラを実行
      if (originalHandler) {
        originalHandler();
      }
    }
  };
};

export { MaintenanceMessage }; 