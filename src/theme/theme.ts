import { createTheme, ThemeOptions } from '@mui/material/styles';

// ライトモードのテーマ設定
export const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#2E77EE',
      light: '#E8F1FF',
    },
    secondary: {
      main: '#6B7280',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    divider: '#E0E0E0',
  },
  // カスタムブレークポイントの設定
  breakpoints: {
    values: {
      xs: 0,      // スマートフォン（縦向き）
      sm: 600,    // スマートフォン（横向き）
      md: 960,    // タブレット
      lg: 1280,   // デスクトップ（小）
      xl: 1920,   // デスクトップ（大）
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'SF Pro Display',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Hiragino Kaku Gothic ProN"',
      '"Hiragino Sans"',
      'Meiryo',
      'sans-serif',
    ].join(','),
    // レスポンシブフォントサイズの設定
    h4: {
      fontWeight: 500,
      letterSpacing: '-0.02em',
      lineHeight: 1.3,
      fontSize: '1.5rem',
      '@media (min-width:600px)': {
        fontSize: '1.75rem',
      },
    },
    h5: {
      fontWeight: 500,
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
      fontSize: '1.25rem',
      '@media (min-width:600px)': {
        fontSize: '1.375rem',
      },
    },
    h6: {
      fontWeight: 500,
      letterSpacing: '-0.01em',
      lineHeight: 1.5,
      fontSize: '1rem',
      '@media (min-width:600px)': {
        fontSize: '1.125rem',
      },
    },
    subtitle1: {
      fontWeight: 500,
      lineHeight: 1.6,
      letterSpacing: '0.01em',
      fontSize: '0.9375rem',
      '@media (min-width:600px)': {
        fontSize: '1rem',
      },
    },
    subtitle2: {
      fontWeight: 500,
      lineHeight: 1.6,
      letterSpacing: '0.01em',
      fontSize: '0.8125rem',
      '@media (min-width:600px)': {
        fontSize: '0.875rem',
      },
      opacity: 0.9,
    },
    body1: {
      fontWeight: 400,
      lineHeight: 1.8,
      letterSpacing: '0.01em',
      fontSize: '0.875rem',
      '@media (min-width:600px)': {
        fontSize: '0.9375rem',
      },
    },
    body2: {
      fontWeight: 400,
      lineHeight: 1.7,
      letterSpacing: '0.01em',
      fontSize: '0.8125rem',
      '@media (min-width:600px)': {
        fontSize: '0.875rem',
      },
      opacity: 0.8,
    },
    caption: {
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.02em',
      fontSize: '0.6875rem',
      '@media (min-width:600px)': {
        fontSize: '0.75rem',
      },
      opacity: 0.7,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
  },
  spacing: (factor: number) => `${0.6 * factor}rem`,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#FFFFFF',
          margin: 0,
          padding: 0,
          // モバイル用のタッチ対応
          WebkitTapHighlightColor: 'transparent',
          // スクロールの改善
          overflowY: 'auto',
          // コンテンツが画面からはみ出るのを防ぐ
          overflowX: 'hidden',
          // ピンチズームの挙動を制御
          touchAction: 'manipulation',
        },
        // ビューポート設定を確保
        'html, body': {
          height: '100%',
          width: '100%',
        },
        // フォントレンダリングの最適化
        '@media (max-width:600px)': {
          html: {
            fontSize: '14px', // モバイルでは基本フォントサイズを小さくする
          }
        }
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          padding: '8px 16px',
          '@media (max-width:600px)': {
            padding: '6px 12px', // モバイルではボタンを小さくする
            fontSize: '0.8125rem',
          },
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            backgroundColor: (theme: any) => `${theme.palette.primary.light}20`,
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
        outlined: {
          '&:hover': {
            backgroundColor: (theme: any) => `${theme.palette.primary.light}10`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          border: '1px solid #E0E0E0',
          transition: 'all 0.25s ease-in-out',
          backgroundColor: '#FFFFFF',
          width: '100%',  // コンテナの幅いっぱいに広がる
          maxWidth: '100%', // 横幅が親要素を超えないようにする
          '@media (max-width:600px)': {
            borderRadius: 6, // モバイルでは角丸を小さくする
          },
          '@media (min-width:601px)': {
            minWidth: '500px', // タブレット以上では最小幅を設定
          },
          '@media (min-width:960px)': {
            minWidth: '600px', // デスクトップでは最小幅を大きく
          },
          '&:hover': {
            borderColor: '#C0C0C0',
            transform: 'translateY(-2px)',
            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.04)',
          }
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '1.5rem',
          '@media (max-width:600px)': {
            padding: '1rem', // モバイルではパディングを小さくする
          },
          '&:last-child': {
            paddingBottom: '1.5rem',
            '@media (max-width:600px)': {
              paddingBottom: '1rem',
            },
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #F5F5F5',
          backgroundColor: '#FFFFFF',
        },
        title: {
          fontSize: '1.125rem',
          fontWeight: 500,
        },
        subheader: {
          fontSize: '0.875rem',
          color: 'rgba(0, 0, 0, 0.6)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          backgroundColor: '#FFFFFF',
        },
        elevation1: {
          boxShadow: 'none',
          border: '1px solid #E0E0E0',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid #E0E0E0',
          backgroundColor: '#FFFFFF',
          color: '#333333',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#E0E0E0',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #E0E0E0',
          padding: '1rem 1.5rem',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 8,
          borderRadius: 4,
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: '0.8125rem',
          fontWeight: 500,
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          },
        },
        clickable: {
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #F5F5F5',
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.01)',
            paddingLeft: '4px',
          },
          '&:last-child': {
            borderBottom: 'none',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            transform: 'scale(1.05)',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          '&.on-dark': {
            color: 'rgba(255, 255, 255, 0.95)',
          },
          '&.secondary-text': {
            color: 'text.secondary',
            fontSize: '0.875rem',
            opacity: 0.85,
          },
          '&.primary-text': {
            color: 'text.primary',
            fontWeight: 500,
          },
          '&.meta-text': {
            fontSize: '0.75rem',
            color: 'text.secondary',
            opacity: 0.7,
            letterSpacing: '0.02em',
          },
          '&.label-text': {
            fontSize: '0.75rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            opacity: 0.7,
          },
        },
      },
    },
  },
};

// ダークモードのテーマ設定
export const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#4B8AF0', // ライトモードよりやや明るく
      light: '#1E293B',
    },
    secondary: {
      main: '#94A3B8',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#E2E8F0',
      secondary: '#94A3B8',
    },
    divider: '#2D3748',
  },
  typography: lightThemeOptions.typography,
  spacing: lightThemeOptions.spacing,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#121212',
          margin: 0,
          padding: 0,
          WebkitTapHighlightColor: 'transparent',
          overflowY: 'auto',
          overflowX: 'hidden',
          touchAction: 'manipulation',
        },
        'html, body': {
          height: '100%',
          width: '100%',
        },
        '@media (max-width:600px)': {
          html: {
            fontSize: '14px',
          }
        }
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
            backgroundColor: (theme: any) => `${theme.palette.primary.light}30`,
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          },
        },
        outlined: {
          borderColor: '#2D3748',
          '&:hover': {
            borderColor: '#4A5568',
            backgroundColor: (theme: any) => `${theme.palette.primary.light}20`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          border: '1px solid #2D3748',
          transition: 'all 0.25s ease-in-out',
          backgroundColor: '#1E1E1E',
          '&:hover': {
            borderColor: '#4A5568',
            transform: 'translateY(-2px)',
            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.2)',
          }
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          backgroundColor: '#1E1E1E',
        },
        elevation1: {
          boxShadow: 'none',
          border: '1px solid #2D3748',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid #2D3748',
          backgroundColor: '#1E1E1E',
          color: '#E2E8F0',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E1E1E',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#2D3748',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #2D3748',
          padding: '1rem 1.5rem',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #2D3748',
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            paddingLeft: '4px',
          },
          '&:last-child': {
            borderBottom: 'none',
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #2D3748',
          backgroundColor: '#1E1E1E',
        },
        title: {
          fontSize: '1.125rem',
          fontWeight: 500,
          color: '#E2E8F0',
        },
        subheader: {
          fontSize: '0.875rem',
          color: '#94A3B8',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '1.5rem',
          backgroundColor: '#1E1E1E',
          '@media (max-width:600px)': {
            padding: '1rem',
          },
          '&:last-child': {
            paddingBottom: '1.5rem',
            '@media (max-width:600px)': {
              paddingBottom: '1rem',
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            transform: 'scale(1.05)',
          },
        },
      },
    },
  },
};

// デフォルトテーマ (軽量版)
export const theme = createTheme(lightThemeOptions);

// テーマを作成する関数
export const createAppTheme = (mode: 'light' | 'dark') => {
  return createTheme(mode === 'light' ? lightThemeOptions : darkThemeOptions);
}; 