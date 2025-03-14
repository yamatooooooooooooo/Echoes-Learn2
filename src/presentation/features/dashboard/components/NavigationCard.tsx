import React from 'react';
import { Card, CardContent, Typography, Grid, Box, Button, useTheme } from '@mui/material';
import {
  LibraryBooks as LibraryBooksIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

interface NavigationItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface NavigationCardProps {
  onNavigate: (menuId: string) => void;
}

/**
 * ダッシュボードに表示する各ページへのナビゲーションカード
 */
export const NavigationCard: React.FC<NavigationCardProps> = ({ onNavigate }) => {
  const theme = useTheme();

  const navigationItems: NavigationItem[] = [
    {
      id: 'subjects',
      label: '科目一覧',
      description: '科目の追加、編集、進捗の更新を行います。',
      icon: <LibraryBooksIcon fontSize="large" />,
      color: theme.palette.primary.main,
    },
    {
      id: 'progress',
      label: '進捗記録',
      description: '学習の進捗状況を確認し、分析します。',
      icon: <TimelineIcon fontSize="large" />,
      color: theme.palette.success.main,
    },
    {
      id: 'settings',
      label: '設定',
      description: 'アプリケーションの設定を変更します。',
      icon: <SettingsIcon fontSize="large" />,
      color: theme.palette.info.main,
    },
  ];

  return (
    <Card elevation={1}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          クイックアクセス
        </Typography>

        <Grid container spacing={3}>
          {navigationItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[3],
                    borderColor: item.color,
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: `${item.color}15`, // 色を透明に
                        borderRadius: '50%',
                        p: 1,
                        mr: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ color: item.color }}>{item.icon}</Box>
                    </Box>
                    <Typography variant="h6">{item.label}</Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {item.description}
                  </Typography>

                  <Button
                    variant="outlined"
                    onClick={() => onNavigate(item.id)}
                    fullWidth
                    sx={{
                      borderColor: item.color,
                      color: item.color,
                      '&:hover': {
                        borderColor: item.color,
                        backgroundColor: `${item.color}10`,
                      },
                    }}
                  >
                    移動する
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};
