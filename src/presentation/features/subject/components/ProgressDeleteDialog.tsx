import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress
} from '@mui/material';

interface ProgressDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

/**
 * 進捗記録削除確認ダイアログ
 */
export const ProgressDeleteDialog: React.FC<ProgressDeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  isDeleting = false
}) => {
  return (
    <Dialog
      open={open}
      onClose={isDeleting ? undefined : onClose}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <DialogTitle id="delete-dialog-title">
        進捗記録の削除
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-dialog-description">
          この進捗記録を削除してもよろしいですか？
          この操作は元に戻すことができません。
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          color="primary"
          disabled={isDeleting}
        >
          キャンセル
        </Button>
        <Button 
          onClick={onConfirm} 
          color="error" 
          variant="contained"
          disabled={isDeleting}
          startIcon={isDeleting && <CircularProgress size={20} color="inherit" />}
        >
          削除する
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 