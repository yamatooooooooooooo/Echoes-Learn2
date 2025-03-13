import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Container,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link
} from '@mui/material';
import { 
  Google as GoogleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';

/**
 * ログインページコンポーネント
 */
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  // メールアドレスとパスワードでログイン
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      console.error('ログインエラー:', err);
      
      // エラーメッセージの日本語化
      if (err.code === 'auth/invalid-credential') {
        setError('メールアドレスまたはパスワードが正しくありません。');
      } else if (err.code === 'auth/user-not-found') {
        setError('このメールアドレスのユーザーが見つかりません。');
      } else if (err.code === 'auth/wrong-password') {
        setError('パスワードが正しくありません。');
      } else if (err.code === 'auth/too-many-requests') {
        setError('ログイン試行回数が多すぎます。しばらく時間をおいてから再試行してください。');
      } else {
        setError(`ログインに失敗しました: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Googleでログイン
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err: any) {
      console.error('Googleログインエラー:', err);
      setError(`Googleログインに失敗しました: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // パスワードの表示/非表示を切り替え
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={0} sx={{ p: 4, width: '100%', borderRadius: 2, border: '1px solid #E0E0E0' }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Echoes Learn
          </Typography>
          <Typography variant="h5" component="h2" align="center" gutterBottom>
            ログイン
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleEmailLogin} sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="メールアドレス"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="パスワード"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="パスワードの表示切り替え"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'ログイン'}
            </Button>
            
            <Divider sx={{ my: 3 }}>または</Divider>
            
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              Googleでログイン
            </Button>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2">
                アカウントをお持ちでないですか？{' '}
                <Link component={RouterLink} to="/signup" variant="body2">
                  新規登録
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage; 