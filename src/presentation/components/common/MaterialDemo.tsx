import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  Switch,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Select,
  InputLabel,
  FormHelperText,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Chip,
  Avatar,
  Badge,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import MailIcon from '@mui/icons-material/Mail';

/**
 * Material-UIコンポーネントのデモ表示
 */
export const MaterialDemo: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const handleThemeChange = () => {
    setDarkMode(!darkMode);
  };

  const handleSnackbarOpen = () => {
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h3" gutterBottom>
        Material-UI コンポーネント デモ
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          基本的なコンポーネント
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              ボタン
            </Typography>
            <Box sx={{ '& > button': { m: 1 } }}>
              <Button variant="text">テキスト</Button>
              <Button variant="contained">コンテインド</Button>
              <Button variant="outlined">アウトライン</Button>
              <Button variant="contained" color="primary">
                プライマリ
              </Button>
              <Button variant="contained" color="secondary">
                セカンダリ
              </Button>
              <Button variant="contained" color="success">
                成功
              </Button>
              <Button variant="contained" color="error">
                エラー
              </Button>
              <Button variant="contained" disabled>
                無効
              </Button>
              <Button variant="contained" size="small">
                小
              </Button>
              <Button variant="contained" size="large">
                大
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              テキストフィールド
            </Typography>
            <Box
              component="form"
              sx={{
                '& > :not(style)': { m: 1, width: '25ch' },
              }}
              noValidate
              autoComplete="off"
            >
              <TextField id="outlined-basic" label="アウトライン" variant="outlined" />
              <TextField id="filled-basic" label="フィルド" variant="filled" />
              <TextField id="standard-basic" label="スタンダード" variant="standard" />
              <TextField
                id="outlined-password-input"
                label="パスワード"
                type="password"
                autoComplete="current-password"
                variant="outlined"
              />
              <TextField
                id="outlined-multiline-static"
                label="複数行"
                multiline
                rows={4}
                defaultValue="デフォルトテキスト"
                variant="outlined"
              />
              <TextField
                id="outlined-helperText"
                label="ヘルパーテキスト"
                defaultValue="デフォルト値"
                helperText="ヘルパーテキストの例"
                variant="outlined"
              />
              <TextField
                error
                id="outlined-error-helper-text"
                label="エラー"
                defaultValue="エラー値"
                helperText="エラーメッセージの例"
                variant="outlined"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          レイアウトコンポーネント
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              カード
            </Typography>
            <Card sx={{ maxWidth: 345 }}>
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  カードタイトル
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  カードの内容をここに記述します。これはカードコンポーネントのデモです。
                  複数行のテキストを表示することができます。
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">共有</Button>
                <Button size="small">詳細</Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              ペーパー
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                '& > :not(style)': {
                  m: 1,
                  width: 128,
                  height: 128,
                },
              }}
            >
              <Paper elevation={0} />
              <Paper />
              <Paper elevation={3} />
              <Paper elevation={6} />
              <Paper elevation={9} />
              <Paper elevation={12} />
              <Paper elevation={24} />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          フィードバックコンポーネント
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              プログレス
            </Typography>
            <Box sx={{ width: '100%', mb: 2 }}>
              <LinearProgress />
            </Box>
            <Box sx={{ width: '100%', mb: 2 }}>
              <LinearProgress color="secondary" />
            </Box>
            <Box sx={{ width: '100%', mb: 2 }}>
              <LinearProgress variant="determinate" value={50} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ m: 1, position: 'relative' }}>
                <CircularProgress />
              </Box>
              <Box sx={{ m: 1, position: 'relative' }}>
                <CircularProgress color="secondary" />
              </Box>
              <Box sx={{ m: 1, position: 'relative' }}>
                <CircularProgress variant="determinate" value={75} />
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              アラート
            </Typography>
            <Box sx={{ width: '100%' }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                これはエラーアラートです — 重要な情報を確認してください!
              </Alert>
              <Alert severity="warning" sx={{ mb: 2 }}>
                これは警告アラートです — 注意が必要です!
              </Alert>
              <Alert severity="info" sx={{ mb: 2 }}>
                これは情報アラートです — 参考にしてください!
              </Alert>
              <Alert severity="success" sx={{ mb: 2 }}>
                これは成功アラートです — 素晴らしい!
              </Alert>
              <Button variant="outlined" onClick={handleSnackbarOpen}>
                スナックバーを開く
              </Button>
              <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                message="メッセージ通知"
                action={
                  <Button color="secondary" size="small" onClick={handleSnackbarClose}>
                    閉じる
                  </Button>
                }
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          その他のコンポーネント
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              チップとバッジ
            </Typography>
            <Box sx={{ '& > *': { m: 0.5 } }}>
              <Chip label="基本" />
              <Chip label="無効" disabled />
              <Chip avatar={<Avatar>M</Avatar>} label="アバター付き" />
              <Chip label="クリック可能" onClick={() => {}} />
              <Chip label="削除可能" onDelete={() => {}} />
              <Chip color="primary" label="プライマリ" />
              <Chip color="secondary" label="セカンダリ" />
            </Box>
            <Box sx={{ '& > *': { m: 2 } }}>
              <Badge badgeContent={4} color="primary">
                <MailIcon />
              </Badge>
              <Badge badgeContent={10} color="secondary">
                <MailIcon />
              </Badge>
              <Badge badgeContent={100} max={99} color="error">
                <MailIcon />
              </Badge>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              タブ
            </Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="基本的なタブ例">
                <Tab label="アイテム 1" />
                <Tab label="アイテム 2" />
                <Tab label="アイテム 3" />
              </Tabs>
            </Box>
            <Box sx={{ p: 3 }}>
              {tabValue === 0 && <Box>アイテム 1の内容</Box>}
              {tabValue === 1 && <Box>アイテム 2の内容</Box>}
              {tabValue === 2 && <Box>アイテム 3の内容</Box>}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};
