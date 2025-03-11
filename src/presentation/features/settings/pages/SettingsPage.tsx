import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import { UserSettingsForm } from '../components/UserSettingsForm';

/**
 * 設定ページ全体のコンポーネント
 * Notion風のUIで設定項目を表示する
 */
export const SettingsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = React.useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  // タブの内容をレンダリングする関数
  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return <div>テーマ設定（実装中）</div>;
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