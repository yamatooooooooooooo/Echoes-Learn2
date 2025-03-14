import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Divider,
  Switch,
  FormControlLabel,
  FormGroup,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  useTheme as useMuiTheme
} from '@mui/material';
import { UserSettingsForm } from '../components/UserSettingsForm';
import { useTheme } from '../../../../contexts/ThemeContext';
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  SettingsBrightness as SettingsBrightnessIcon,
  Info as InfoIcon
} from '@mui/icons-material';

/**
 * 設定ページ全体のコンポーネント
 * Notion風のUIで設定項目を表示する
 */
export const SettingsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = React.useState(0);
  const { mode, setMode, currentTheme } = useTheme();
  const muiTheme = useMuiTheme();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  // テーマモードの変更ハンドラー
  const handleThemeModeChange = (newMode: 'light' | 'dark' | 'system') => {
    setMode(newMode);
  };

  // タブの内容をレンダリングする関数
  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              テーマ設定
            </Typography>
            
            <Card variant="outlined" sx={{ mb: 4 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={500}>
                    カラーモード
                  </Typography>
                  <Tooltip title="アプリ全体の表示モードを設定します。システム設定に従うと、デバイスの設定に合わせて自動的に切り替わります。">
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={4}>
                    <Paper
                      elevation={0}
                      onClick={() => handleThemeModeChange('light')}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: mode === 'light' ? 'primary.main' : 'divider',
                        bgcolor: mode === 'light' ? 'primary.light' : 'background.paper',
                        borderRadius: 2,
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'primary.light',
                          opacity: 0.8
                        }
                      }}
                    >
                      <LightModeIcon sx={{ fontSize: 32, color: mode === 'light' ? 'primary.main' : 'text.secondary' }} />
                      <Typography variant="body2" sx={{ mt: 1, fontWeight: mode === 'light' ? 500 : 400 }}>
                        ライトモード
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper
                      elevation={0}
                      onClick={() => handleThemeModeChange('dark')}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: mode === 'dark' ? 'primary.main' : 'divider',
                        bgcolor: mode === 'dark' ? 'primary.light' : 'background.paper',
                        borderRadius: 2,
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'primary.light',
                          opacity: 0.8
                        }
                      }}
                    >
                      <DarkModeIcon sx={{ fontSize: 32, color: mode === 'dark' ? 'primary.main' : 'text.secondary' }} />
                      <Typography variant="body2" sx={{ mt: 1, fontWeight: mode === 'dark' ? 500 : 400 }}>
                        ダークモード
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper
                      elevation={0}
                      onClick={() => handleThemeModeChange('system')}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: mode === 'system' ? 'primary.main' : 'divider',
                        bgcolor: mode === 'system' ? 'primary.light' : 'background.paper',
                        borderRadius: 2,
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'primary.light',
                          opacity: 0.8
                        }
                      }}
                    >
                      <SettingsBrightnessIcon sx={{ fontSize: 32, color: mode === 'system' ? 'primary.main' : 'text.secondary' }} />
                      <Typography variant="body2" sx={{ mt: 1, fontWeight: mode === 'system' ? 500 : 400 }}>
                        システム設定
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    現在の表示モード: <strong>{currentTheme === 'light' ? 'ライトモード' : 'ダークモード'}</strong>
                    {mode === 'system' && ' (システム設定に基づく)'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );
      case 1:
        return <UserSettingsForm />;
      default:
        return <div>テーマ設定（実装中）</div>;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          設定
        </Typography>
        <Typography variant="body1" color="text.secondary">
          アプリケーションの設定を変更します
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            '& .MuiTab-root': {
              py: 2,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
            }
          }}
        >
          <Tab label="表示設定" id="tab-0" aria-controls="tabpanel-0" />
          <Tab label="学習設定" id="tab-1" aria-controls="tabpanel-1" />
        </Tabs>

        <Divider />

        <Box role="tabpanel" p={3}>
          {renderTabContent()}
        </Box>
      </Paper>
    </Container>
  );
}; 