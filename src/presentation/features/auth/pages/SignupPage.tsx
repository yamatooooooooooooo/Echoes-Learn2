import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
} from '@mui/material';
import {
  Google as GoogleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';

/**
 * 新規登録ページコンポーネント
 */
const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // パスワードのバリデーション
  const validatePassword = () => {
    if (password.length < 6) {
      return 'パスワードは6文字以上である必要があります。';
    }
    if (password !== confirmPassword) {
      return 'パスワードが一致しません。';
    }
    return null;
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // パスワードの検証
    const passwordError = validatePassword();
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    try {
      await signup(email, password);
      navigate('/');
    } catch (err: any) {
      console.error('新規登録エラー:', err);

      // エラーメッセージの日本語化
      if (err.code === 'auth/email-already-in-use') {
        setError('このメールアドレスは既に使用されています。');
      } else if (err.code === 'auth/invalid-email') {
        setError('有効なメールアドレスを入力してください。');
      } else if (err.code === 'auth/weak-password') {
        setError('このパスワードは脆弱です。より強いパスワードを設定してください。');
      } else {
        setError(`新規登録に失敗しました: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Googleで新規登録
  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);

    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err: any) {
      console.error('Google新規登録エラー:', err);

      // エラーメッセージの日本語化
      if (err.code === 'auth/operation-not-allowed') {
        setError(
          'この認証方法は現在無効になっています。Firebase Consoleで設定を確認してください。'
        );
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('認証ポップアップが閉じられました。もう一度お試しください。');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('認証リクエストがキャンセルされました。もう一度お試しください。');
      } else if (err.code === 'auth/popup-blocked') {
        setError(
          '認証ポップアップがブラウザによってブロックされました。ポップアップを許可してください。'
        );
      } else {
        setError(`Google新規登録に失敗しました: ${err.message}`);
      }
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
        <Paper
          elevation={0}
          sx={{ p: 4, width: '100%', borderRadius: 2, border: '1px solid #E0E0E0' }}
        >
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Echoes Learn
          </Typography>
          <Typography variant="h5" component="h2" align="center" gutterBottom>
            新規登録
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="名前"
              name="name"
              autoComplete="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="メールアドレス"
              name="email"
              autoComplete="email"
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
              autoComplete="new-password"
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

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="パスワード（確認）"
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : '新規登録'}
            </Button>

            <Divider sx={{ my: 3 }}>または</Divider>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignup}
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              Googleで登録
            </Button>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2">
                既にアカウントをお持ちですか？{' '}
                <Link component={RouterLink} to="/login" variant="body2">
                  ログイン
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SignupPage;
