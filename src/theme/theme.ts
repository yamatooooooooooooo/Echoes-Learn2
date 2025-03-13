import { createTheme, ThemeOptions, PaletteOptions, Components } from '@mui/material/styles';

// ダークテーマのパレット設定
const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: '#10b981',
    light: '#34d399',
    dark: '#059669',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#7c3aed',
    light: '#9d6af0',
    dark: '#5b21b6',
    contrastText: '#ffffff',
  },
  background: {
    default: '#121212', // ダーク背景
    paper: '#1e1e1e',  // カード背景
  },
  text: {
    primary: '#f3f4f6',
    secondary: '#d1d5db',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#b91c1c',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
  },
  info: {
    main: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
  },
  success: {
    main: '#10b981',
    light: '#34d399',
    dark: '#059669',
  },
};

// ライトテーマのパレット設定
const lightPalette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#10b981',
    light: '#d1fae5',
    dark: '#059669',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#7c3aed',
    light: '#ede9fe',
    dark: '#5b21b6',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
  },
  text: {
    primary: '#111827',
    secondary: '#4b5563',
  },
  divider: 'rgba(0, 0, 0, 0.12)',
  error: {
    main: '#ef4444',
    light: '#fca5a5',
    dark: '#b91c1c',
  },
  warning: {
    main: '#f59e0b',
    light: '#fcd34d',
    dark: '#d97706',
  },
  info: {
    main: '#3b82f6',
    light: '#93c5fd',
    dark: '#2563eb',
  },
  success: {
    main: '#10b981',
    light: '#6ee7b7',
    dark: '#059669',
  },
};

// ダークテーマの共通コンポーネントスタイル
const darkComponents: Components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundColor: '#121212',
        color: '#f3f4f6',
        scrollbarColor: 'rgba(255, 255, 255, 0.2) #121212',
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#1e1e1e',
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
        backgroundColor: '#1e1e1e',
        backgroundImage: 'none',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
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
        backgroundColor: '#1a1a1a',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
    },
  },
  MuiInputBase: {
    styleOverrides: {
      input: {
        '&:-webkit-autofill': {
          '-webkit-box-shadow': '0 0 0 100px #1e1e1e inset !important',
          '-webkit-text-fill-color': '#f3f4f6 !important',
        },
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      notchedOutline: {
        borderColor: 'rgba(255, 255, 255, 0.23)',
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      filled: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        '&.Mui-selected': {
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
        },
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      standardSuccess: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
      },
      standardError: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
      },
      standardWarning: {
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
      },
      standardInfo: {
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
      },
    },
  },
};

// ライトテーマの共通コンポーネントスタイル
const lightComponents: Components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundColor: '#f5f5f5',
        color: '#111827',
        scrollbarColor: 'rgba(0, 0, 0, 0.2) #f5f5f5',
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f5f5f5',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
        },
      },
    },
  },
  MuiInputBase: {
    styleOverrides: {
      input: {
        '&:-webkit-autofill': {
          '-webkit-box-shadow': '0 0 0 100px #ffffff inset !important',
          '-webkit-text-fill-color': '#111827 !important',
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      filled: {
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      standardSuccess: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
      },
      standardError: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
      },
      standardWarning: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
      },
      standardInfo: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
      fontWeight: 600,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none' as const,
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
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