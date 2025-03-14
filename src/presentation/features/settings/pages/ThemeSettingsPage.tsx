import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Divider,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  useTheme as useMuiTheme,
  Alert,
  IconButton
} from '@mui/material';
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Computer as ComputerIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useTheme, ThemeMode } from '../../../../contexts/ThemeContext';

/**
 * テーマ設定画面
 */
export const ThemeSettingsPage: React.FC = () => {
  const { mode, setMode } = useTheme();
  const muiTheme = useMuiTheme();
  const [infoOpen, setInfoOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  
  // 現在のテーマ（light/dark）を計算
  const isDarkMode = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const handleModeChange = (newMode: ThemeMode) => {
    setMode(newMode);
    setSuccess('テーマ設定を保存しました');
    
    // 3秒後に成功メッセージを消す
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        テーマ設定
      </Typography>
      
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
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
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">アピアランス</Typography>
          <IconButton size="small" onClick={() => setInfoOpen(!infoOpen)}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Box>
        
        {infoOpen && (
          <Alert severity="info" sx={{ mb: 3 }}>
            アプリケーションの表示モードを選択できます。「システム設定に従う」を選択すると、
            お使いのデバイスの設定に合わせて自動的に切り替わります。「時間帯で自動切替」を選択すると、
            6時〜18時はライトモード、18時〜6時はダークモードが適用されます。
          </Alert>
        )}
        
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6}>
            <Card 
              variant="outlined" 
              sx={{ 
                borderColor: mode === 'light' ? 'primary.main' : 'divider',
                boxShadow: mode === 'light' ? 2 : 0
              }}
            >
              <CardActionArea onClick={() => handleModeChange('light')}>
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
          </Grid>
          
          <Grid item xs={6}>
            <Card 
              variant="outlined" 
              sx={{ 
                borderColor: mode === 'dark' ? 'primary.main' : 'divider',
                boxShadow: mode === 'dark' ? 2 : 0
              }}
            >
              <CardActionArea onClick={() => handleModeChange('dark')}>
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
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" sx={{ mb: 2 }}>自動設定</Typography>
        
        <FormControl component="fieldset" fullWidth>
          <RadioGroup 
            value={mode} 
            onChange={(e) => handleModeChange(e.target.value as ThemeMode)}
          >
            <Paper 
              elevation={0} 
              sx={{ 
                mb: 2, 
                p: 2,
                border: '1px solid', 
                borderColor: mode === 'system' ? 'primary.main' : 'divider',
                borderRadius: 1,
              }}
            >
              <FormControlLabel 
                value="system" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ComputerIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography>システム設定に従う</Typography>
                  </Box>
                }
              />
            </Paper>
            
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2,
                border: '1px solid', 
                borderColor: mode === 'system' ? 'primary.main' : 'divider',
                borderRadius: 1,
              }}
            >
              <FormControlLabel 
                value="system" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography>時間帯で自動切替</Typography>
                  </Box>
                }
              />
            </Paper>
          </RadioGroup>
        </FormControl>
      </Paper>
    </Container>
  );
}; 