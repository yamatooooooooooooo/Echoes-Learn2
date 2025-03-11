import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Divider,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { DASHBOARD_MODULES, DashboardModule } from '../../../../config/dashboardModules';
import { ModuleSettings } from '../hooks/useDashboardSettings';

interface DashboardSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  moduleSettings: ModuleSettings;
  toggleModuleEnabled: (moduleId: string) => void;
  resetToDefaults: () => void;
  saveSettings: () => void;
  isSaving: boolean;
}

/**
 * ダッシュボード設定を管理するダイアログコンポーネント
 */
export const DashboardSettingsDialog: React.FC<DashboardSettingsDialogProps> = ({
  open,
  onClose,
  moduleSettings,
  toggleModuleEnabled,
  resetToDefaults,
  saveSettings,
  isSaving
}) => {
  // 設定を保存して閉じる
  const handleSave = () => {
    saveSettings();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        ダッシュボード設定
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" gutterBottom>
          表示するモジュールを選択
        </Typography>
        <Box sx={{ mb: 2 }}>
          {Object.entries(DASHBOARD_MODULES).map(([moduleId, module]) => (
            <FormControlLabel
              key={moduleId}
              control={
                <Switch
                  checked={moduleSettings[moduleId]?.enabled || false}
                  onChange={() => toggleModuleEnabled(moduleId)}
                  color="primary"
                />
              }
              label={module.title}
              sx={{ display: 'block', my: 1 }}
            />
          ))}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            すべての設定をリセット
          </Typography>
          <IconButton
            onClick={resetToDefaults}
            color="warning"
            size="small"
            sx={{ ml: 1 }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          キャンセル
        </Button>
        <Button 
          onClick={handleSave} 
          color="primary" 
          variant="contained"
          disabled={isSaving}
        >
          {isSaving ? '保存中...' : '保存'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 