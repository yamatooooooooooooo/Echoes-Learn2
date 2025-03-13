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
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
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