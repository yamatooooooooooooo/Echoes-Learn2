import { createTheme, ThemeOptions, PaletteOptions, Components } from '@mui/material/styles';

// ダークテーマのパレット設定
const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: '#0077CC', // Notionのブルー
    light: '#3399FF',
    dark: '#005599',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#606060', // ダークグレー
    light: '#808080',
    dark: '#454545',
    contrastText: '#ffffff',
  },
  background: {
    default: '#191919', // ダーク背景
    paper: '#2D2D2D',  // カード背景
  },
  text: {
    primary: '#EDEDED',
    secondary: '#AAAAAA',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
  error: {
    main: '#E03E3E', // Notion風の赤
    light: '#FF5555',
    dark: '#CC3333',
  },
  warning: {
    main: '#D9730D', // Notion風のオレンジ
    light: '#F0A958',
    dark: '#B15A00',
  },
  info: {
    main: '#0077CC', // ブルー（primaryと同じ）
    light: '#3399FF',
    dark: '#005599',
  },
  success: {
    main: '#0F7B6C', // Notion風の緑
    light: '#1EA993',
    dark: '#096158',
  },
};

// ライトテーマのパレット設定
const lightPalette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#0077CC', // Notionのブルー
    light: '#E6F2FF',
    dark: '#005599',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#606060', // ダークグレー
    light: '#F5F5F5',
    dark: '#454545',
    contrastText: '#ffffff',
  },
  background: {
    default: '#FFFFFF', // 純白の背景
    paper: '#FFFFFF',  // カード背景も白
  },
  text: {
    primary: '#37352F', // Notionの本文色
    secondary: '#6B6B6B',
  },
  divider: 'rgba(0, 0, 0, 0.08)',
  error: {
    main: '#E03E3E', // Notion風の赤
    light: '#FFEAEA',
    dark: '#CC3333',
  },
  warning: {
    main: '#D9730D', // Notion風のオレンジ
    light: '#FFEFDD',
    dark: '#B15A00',
  },
  info: {
    main: '#0077CC', // ブルー（primaryと同じ）
    light: '#E6F2FF',
    dark: '#005599',
  },
  success: {
    main: '#0F7B6C', // Notion風の緑
    light: '#E7F7F5',
    dark: '#096158',
  },
};

// ダークテーマの共通コンポーネントスタイル
const darkComponents: Components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundColor: '#191919',
        color: '#EDEDED',
        scrollbarColor: 'rgba(255, 255, 255, 0.2) #191919',
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#2D2D2D',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '4px',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        backgroundColor: '#2D2D2D',
        backgroundImage: 'none',
        boxShadow: 'none',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        boxShadow: 'none',
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        backgroundImage: 'none',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundImage: 'none',
        backgroundColor: '#232323',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        boxShadow: 'none',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      },
    },
  },
  MuiInputBase: {
    styleOverrides: {
      input: {
        '&:-webkit-autofill': {
          '-webkit-box-shadow': '0 0 0 100px #2D2D2D inset !important',
          '-webkit-text-fill-color': '#EDEDED !important',
        },
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      notchedOutline: {
        borderColor: 'rgba(255, 255, 255, 0.15)',
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      filled: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        '&.Mui-selected': {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
        },
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      standardSuccess: {
        backgroundColor: 'rgba(15, 123, 108, 0.15)',
      },
      standardError: {
        backgroundColor: 'rgba(224, 62, 62, 0.15)',
      },
      standardWarning: {
        backgroundColor: 'rgba(217, 115, 13, 0.15)',
      },
      standardInfo: {
        backgroundColor: 'rgba(0, 119, 204, 0.15)',
      },
    },
  },
};

// ライトテーマの共通コンポーネントスタイル
const lightComponents: Components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundColor: '#FFFFFF',
        color: '#37352F',
        scrollbarColor: 'rgba(0, 0, 0, 0.15) #FFFFFF',
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#F5F5F5',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0, 0, 0, 0.15)',
          borderRadius: '4px',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        boxShadow: 'none',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        borderRadius: '3px',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        boxShadow: 'none',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: 'none',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
      },
    },
  },
  MuiInputBase: {
    styleOverrides: {
      input: {
        '&:-webkit-autofill': {
          '-webkit-box-shadow': '0 0 0 100px #FFFFFF inset !important',
          '-webkit-text-fill-color': '#37352F !important',
        },
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: '3px',
      },
      notchedOutline: {
        borderColor: 'rgba(0, 0, 0, 0.15)',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        boxShadow: 'none',
        textTransform: 'none',
        borderRadius: '3px',
        fontWeight: 500,
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: 'none',
        },
      },
      outlined: {
        borderWidth: '1px',
        '&:hover': {
          borderWidth: '1px',
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      filled: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      standardSuccess: {
        backgroundColor: 'rgba(15, 123, 108, 0.08)',
      },
      standardError: {
        backgroundColor: 'rgba(224, 62, 62, 0.08)',
      },
      standardWarning: {
        backgroundColor: 'rgba(217, 115, 13, 0.08)',
      },
      standardInfo: {
        backgroundColor: 'rgba(0, 119, 204, 0.08)',
      },
    },
  },
};

// 共通のテーマ設定
const commonOptions = {
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 500,
    },
    divider: '#2D3748',
  },
  spacing: 8, // デフォルトのスペーシングを使用
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
  },
  shape: {
    borderRadius: 3,
  },
  mixins: {
    toolbar: {
      minHeight: 56,
      '@media (min-width:0px) and (orientation: landscape)': {
        minHeight: 48,
      },
      '@media (min-width:600px)': {
        minHeight: 64,
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

// ダークテーマの設定
const darkThemeOptions: ThemeOptions = {
  ...commonOptions,
  palette: darkPalette,
  components: darkComponents,
};

// ライトテーマの設定
const lightThemeOptions: ThemeOptions = {
  ...commonOptions,
  palette: lightPalette,
  components: lightComponents,
};

// テーマを作成する関数
export const createAppTheme = (mode: 'light' | 'dark') => {
  // テーマモードに応じてbodyのdataset-themeを設定
  if (typeof document !== 'undefined') {
    document.body.dataset.theme = mode;
  }
  return createTheme(mode === 'light' ? lightThemeOptions : darkThemeOptions);
}; 
