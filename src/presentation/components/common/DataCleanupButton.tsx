import React, { useState } from 'react';
import { 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { useFirebase } from '../../../contexts/FirebaseContext';
import { FirebaseCleanupUtil } from '../../../infrastructure/utils/firebaseCleanup';

/**
 * データクリーンアップボタンのプロパティ
 */
interface DataCleanupButtonProps {
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

/**
 * データクリーンアップボタンコンポーネント
 * ユーザーのデータを削除するためのボタンとダイアログを提供
 */
const DataCleanupButton: React.FC<DataCleanupButtonProps> = ({
  variant = 'outlined',
  color = 'error',
  size = 'medium',
  fullWidth = false
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  const { firestore, auth } = useFirebase();
  
  const handleOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  const handleCleanup = async () => {
    setLoading(true);
    
    try {
      const cleanupUtil = new FirebaseCleanupUtil(firestore, auth);
      const count = await cleanupUtil.cleanupAllUserData();
      
      setSnackbarMessage(`${count}個のデータを正常に削除しました`);
      setSnackbarSeverity('success');
      handleClose();
    } catch (error) {
      console.error('データクリーンアップ中にエラーが発生しました:', error);
      setSnackbarMessage('データの削除中にエラーが発生しました');
      setSnackbarSeverity('error');
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };
  
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  return (
    <>
      <Button
        variant={variant}
        color={color}
        size={size}
        onClick={handleOpen}
        fullWidth={fullWidth}
      >
        データをクリーンアップ
      </Button>
      
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="cleanup-dialog-title"
        aria-describedby="cleanup-dialog-description"
      >
        <DialogTitle id="cleanup-dialog-title">
          データクリーンアップの確認
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cleanup-dialog-description">
            この操作を実行すると、科目データ、進捗データ、および学習分析データなど
            すべてのユーザーデータが削除されます。この操作は元に戻せません。
            本当に実行しますか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" disabled={loading}>
            キャンセル
          </Button>
          <Button 
            onClick={handleCleanup} 
            color="error" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? '削除中...' : 'データを削除'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DataCleanupButton; 