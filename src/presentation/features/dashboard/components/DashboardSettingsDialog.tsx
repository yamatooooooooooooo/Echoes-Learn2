import React, { useState, useEffect } from 'react';
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
  IconButton,
  Slider,
  TextField,
  Grid,
  Tooltip,
} from '@mui/material';
import { Close as CloseIcon, Refresh as RefreshIcon, Info as InfoIcon } from '@mui/icons-material';
import { DASHBOARD_MODULES, DashboardModule } from '../../../../config/dashboardModules';
import { ModuleSettings } from '../hooks/useDashboardSettings';
import { useServices } from '../../../../hooks/useServices';
import { UserSettingsUpdateInput } from '../../../../domain/models/UserSettingsModel';

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
  isSaving,
}) => {
  const { userSettingsRepository } = useServices();

  // ユーザー設定の状態
  const [maxConcurrentSubjects, setMaxConcurrentSubjects] = useState<number>(3);
  const [examBufferDays, setExamBufferDays] = useState<number>(7);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ダイアログ表示時にユーザー設定を読み込む
  useEffect(() => {
    if (open) {
      loadUserSettings();
    }
  }, [open]);

  // ユーザー設定を読み込む
  const loadUserSettings = async () => {
    try {
      setIsLoading(true);
      const settings = await userSettingsRepository.getUserSettings();
      setMaxConcurrentSubjects(settings.maxConcurrentSubjects);
      setExamBufferDays(settings.examBufferDays);
    } catch (error) {
      console.error('ユーザー設定の取得に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 設定を保存して閉じる
  const handleSave = async () => {
    try {
      // ユーザー設定の更新
      const userSettingsUpdate: UserSettingsUpdateInput = {
        maxConcurrentSubjects,
        examBufferDays,
      };
      await userSettingsRepository.updateUserSettings(userSettingsUpdate);

      // ダッシュボードの表示設定を保存
      saveSettings();
      onClose();
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
    }
  };

  // バッファ日数の変更ハンドラ
  const handleBufferDaysChange = (_event: Event, newValue: number | number[]) => {
    setExamBufferDays(newValue as number);
  };

  // 同時進行科目数の変更ハンドラ
  const handleMaxConcurrentChange = (_event: Event, newValue: number | number[]) => {
    setMaxConcurrentSubjects(newValue as number);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
      <DialogContent dividers>
        {/* モジュール表示設定 */}
        <Typography variant="subtitle1" gutterBottom>
          表示するモジュールを選択
        </Typography>
        <Box sx={{ mb: 3 }}>
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

        <Divider sx={{ my: 3 }} />

        {/* ノルマ計算設定 */}
        <Typography variant="subtitle1" gutterBottom>
          ノルマ計算設定
          <Tooltip title="ノルマ計算に使用される設定です。これらの値はすべての科目に適用されるデフォルト値です。">
            <IconButton size="small" sx={{ ml: 1 }}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Typography>

        {/* 同時進行科目数の設定 */}
        <Box sx={{ mb: 3, mt: 2 }}>
          <Typography id="max-concurrent-slider" gutterBottom>
            同時進行科目数: {maxConcurrentSubjects}
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <Slider
                value={maxConcurrentSubjects}
                onChange={handleMaxConcurrentChange}
                aria-labelledby="max-concurrent-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={10}
                disabled={isLoading}
              />
            </Grid>
            <Grid item>
              <TextField
                value={maxConcurrentSubjects}
                onChange={(e) => setMaxConcurrentSubjects(Number(e.target.value))}
                inputProps={{
                  step: 1,
                  min: 1,
                  max: 10,
                  type: 'number',
                }}
                size="small"
                sx={{ width: 60 }}
                disabled={isLoading}
              />
            </Grid>
          </Grid>
          <Typography variant="caption" color="text.secondary">
            一度に進行する科目数を制限します。試験日が近い順に優先されます。
          </Typography>
        </Box>

        {/* バッファ日数の設定 */}
        <Box sx={{ mb: 2 }}>
          <Typography id="buffer-days-slider" gutterBottom>
            試験前バッファ日数: {examBufferDays}日
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <Slider
                value={examBufferDays}
                onChange={handleBufferDaysChange}
                aria-labelledby="buffer-days-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={0}
                max={30}
                disabled={isLoading}
              />
            </Grid>
            <Grid item>
              <TextField
                value={examBufferDays}
                onChange={(e) => setExamBufferDays(Number(e.target.value))}
                inputProps={{
                  step: 1,
                  min: 0,
                  max: 30,
                  type: 'number',
                }}
                size="small"
                sx={{ width: 60 }}
                disabled={isLoading}
              />
            </Grid>
          </Grid>
          <Typography variant="caption" color="text.secondary">
            試験日の何日前までに学習を完了するかを設定します。これはデフォルト値であり、科目ごとに個別設定も可能です。
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            すべての設定をリセット
          </Typography>
          <IconButton
            onClick={resetToDefaults}
            color="warning"
            size="small"
            sx={{ ml: 1 }}
            disabled={isLoading || isSaving}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading || isSaving}>
          キャンセル
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={isLoading || isSaving}
        >
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};
