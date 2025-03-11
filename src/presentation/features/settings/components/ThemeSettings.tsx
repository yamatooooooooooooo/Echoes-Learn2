import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Stack,
  Divider,
  Alert,
  IconButton,
  Card,
  CardActionArea,
  CardContent,
  Switch,
  useTheme,
  CircularProgress
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ComputerIcon from '@mui/icons-material/Computer';
import ScheduleIcon from '@mui/icons-material/Schedule';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme as useAppTheme } from '../../../../contexts/ThemeContext';
import { useServices } from '../../../../hooks/useServices';

// 直接ThemeModeの型を定義
type ThemeMode = 'light' | 'dark' | 'system';

/**
 * テーマ設定コンポーネント
 * Notion風のUIでダークモード設定を提供
 */
export const ThemeSettings: React.FC = () => {
  const { mode, setMode } = useAppTheme();
  const muiTheme = useTheme();
  const { userSettingsRepository } = useServices();
  
  const [infoOpen, setInfoOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // モードの変更を処理
  const handleModeChange = async (newMode: ThemeMode) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // ローカルの状態を先に更新して即時反映
      setMode(newMode);
      
      // ユーザー設定にも保存
      await userSettingsRepository.updateUserSettings({
        themeMode: newMode
      });
      
      setSuccess('テーマ設定を保存しました');
      
      // 成功メッセージを5秒後に消す
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      console.error('テーマ設定の保存に失敗しました:', err);
      setError('テーマ設定の保存に失敗しましたが、現在の設定は一時的に適用されています。');
      // エラーが発生しても、UIには反映させる（ローカルだけでも動作するように）
    } finally {
      setLoading(false);
    }
  };

  // マウント時にユーザー設定から読み込む
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const settings = await userSettingsRepository.getUserSettings();
        if (settings?.themeMode) {
          setMode(settings.themeMode);
        }
      } catch (err) {
        console.error('テーマ設定の読み込みに失敗しました:', err);
        setError('サーバーからの設定読み込みに失敗しました。ローカルの設定を使用します。');
        // エラー時はローカルストレージの設定をそのまま使用するので、特別な処理は不要
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [setMode]); // userSettingsRepositoryを依存配列から除外（意図的）

  if (loading && !mode) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {success && (
        <Alert 
          severity="success"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setSuccess(null)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert 
          severity="error"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setError(null)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">アピアランス</Typography>
          <IconButton size="small" onClick={() => setInfoOpen(!infoOpen)}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Box>
        
        {infoOpen && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              mb: 2, 
              bgcolor: muiTheme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1
            }}
          >
            <Typography variant="body2">
              アプリケーションの表示モードを選択できます。「システム設定に従う」を選択すると、
              お使いのデバイスの設定に合わせて自動的に切り替わります。「時間帯で自動切替」を選択すると、
              6時〜18時はライトモード、18時〜6時はダークモードが適用されます。
            </Typography>
          </Paper>
        )}

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Card 
            variant="outlined" 
            sx={{ 
              flex: 1,
              borderColor: mode === 'light' ? 'primary.main' : 'divider',
              boxShadow: mode === 'light' ? 2 : 0
            }}
          >
            <CardActionArea onClick={() => handleModeChange('light')} disabled={loading}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                <Box 
                  sx={{ 
                    bgcolor: '#FAFAFA', 
                    color: '#333333', 
                    width: '100%', 
                    height: 100, 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    borderRadius: 1,
                    mb: 1
                  }}
                >
                  <LightModeIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="subtitle2" align="center">ライトモード</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
          
          <Card 
            variant="outlined" 
            sx={{ 
              flex: 1,
              borderColor: mode === 'dark' ? 'primary.main' : 'divider',
              boxShadow: mode === 'dark' ? 2 : 0
            }}
          >
            <CardActionArea onClick={() => handleModeChange('dark')} disabled={loading}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                <Box 
                  sx={{ 
                    bgcolor: '#121212', 
                    color: '#E2E8F0', 
                    width: '100%', 
                    height: 100, 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    borderRadius: 1,
                    mb: 1
                  }}
                >
                  <DarkModeIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="subtitle2" align="center">ダークモード</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Stack>
      </Box>
      
      <Divider />
      
      <FormControl component="fieldset">
        <Typography variant="h6" sx={{ mb: 2 }}>自動設定</Typography>
        
        <RadioGroup 
          value={mode} 
          onChange={(e) => handleModeChange(e.target.value as ThemeMode)}
        >
          <Paper 
            elevation={0} 
            sx={{ 
              mb: 2, 
              border: '1px solid', 
              borderColor: mode === 'system' ? 'primary.main' : 'divider',
              borderRadius: 1,
              overflow: 'hidden'
            }}
          >
            <FormControlLabel
              value="system"
              control={<Radio color="primary" disabled={loading} />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ComputerIcon sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="subtitle1">システム設定に従う</Typography>
                    <Typography variant="body2" color="text.secondary">
                      デバイスのシステム設定に合わせて自動的に切り替わります
                    </Typography>
                  </Box>
                </Box>
              }
              sx={{ 
                width: '100%', 
                m: 0, 
                p: 2,
                '&:hover': { bgcolor: muiTheme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }
              }}
            />
          </Paper>
          
          <Paper 
            elevation={0} 
            sx={{ 
              border: '1px solid', 
              borderColor: mode === 'system' ? 'primary.main' : 'divider',
              borderRadius: 1,
              overflow: 'hidden'
            }}
          >
            <FormControlLabel
              value="system"
              control={<Radio color="primary" disabled={loading} />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ScheduleIcon sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="subtitle1">時間帯で自動切替</Typography>
                    <Typography variant="body2" color="text.secondary">
                      6時〜18時はライトモード、18時〜6時はダークモード
                    </Typography>
                  </Box>
                </Box>
              }
              sx={{ 
                width: '100%', 
                m: 0, 
                p: 2,
                '&:hover': { bgcolor: muiTheme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }
              }}
            />
          </Paper>
        </RadioGroup>
      </FormControl>
    </Stack>
  );
}; 