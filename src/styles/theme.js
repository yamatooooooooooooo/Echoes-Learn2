import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Notion風カラーパレット
const notionColors = {
  teal: {
    main: '#08A29E', // ティール/青緑色
    light: '#3CBCB8',
    dark: '#078D8A',
    contrastText: '#FFFFFF',
  },
  gray: {
    50: '#F7F7F7',
    100: '#EAEAEA',
    200: '#DFDFDF',
    300: '#CFCFCF',
    400: '#B0B0B0',
    500: '#909090',
    600: '#6F6F6F',
    700: '#4F4F4F',
    800: '#2F2F2F',
    900: '#1F1F1F',
  },
  text: {
    primary: '#37352F',
    secondary: '#6B6B6B',
    disabled: '#9B9B9B',
  },
  background: {
    default: '#FFFFFF',
    paper: '#FFFFFF',
    subtle: '#F7F6F3',
  },
  divider: '#EAEAE9',
};

// ダークモード用カラーパレット
const darkModeColors = {
  teal: {
    main: '#08A29E', // メインカラーは同じに
    light: '#3CBCB8',
    dark: '#078D8A',
    contrastText: '#FFFFFF',
  },
  gray: {
    50: '#2F2F2F',
    100: '#3F3F3F',
    200: '#4F4F4F',
    300: '#5F5F5F',
    400: '#6F6F6F',
    500: '#7F7F7F',
    600: '#8F8F8F',
    700: '#9F9F9F',
    800: '#AFAFAF',
    900: '#BFBFBF',
  },
  text: {
    primary: '#E6E6E6',
    secondary: '#BBBBBB',
    disabled: '#777777',
  },
  background: {
    default: '#191919',
    paper: '#252525',
    subtle: '#2D2D2D',
  },
  divider: '#3D3D3D',
};

// ライトモードテーマの作成
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: notionColors.teal,
    secondary: {
      main: '#F2994A', // オレンジ色
      light: '#F5B97E',
      dark: '#E07C26',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#EB5757',
      light: '#F08989',
      dark: '#D43F3F',
    },
    warning: {
      main: '#F2C94C',
      light: '#F6DB86',
      dark: '#DFB52E',
    },
    info: {
      main: '#56CCF2',
      light: '#88DCF6',
      dark: '#30AED3',
    },
    success: {
      main: '#6FCF97',
      light: '#9BDEB6',
      dark: '#4FB77A',
    },
    text: {
      primary: notionColors.text.primary,
      secondary: notionColors.text.secondary,
      disabled: notionColors.text.disabled,
    },
    background: {
      default: notionColors.background.default,
      paper: notionColors.background.paper,
    },
    divider: notionColors.divider,
    grey: notionColors.gray,
  },
  typography: {
    fontFamily: '"Noto Sans JP", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '2.125rem',
      fontWeight: 600,
      letterSpacing: '-0.025em',
      lineHeight: 1.3,
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 600,
      letterSpacing: '-0.025em',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.015em',
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
    caption: {
      fontSize: '0.75rem',
      letterSpacing: '0.01em',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 500,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 3, // Notionの角丸は控えめ
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.05)',
    '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
    '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
    // ... デフォルトのシャドウを残す ...
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '6px 16px',
          fontSize: '0.875rem',
          borderRadius: 3,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          },
          '@media (max-width:600px)': {
            padding: '8px 16px',
            fontSize: '0.8125rem',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
        outlined: {
          borderColor: notionColors.gray[200],
          '&:hover': {
            backgroundColor: notionColors.background.subtle,
            borderColor: notionColors.gray[300],
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: `1px solid ${notionColors.divider}`,
        },
        elevation1: {
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: notionColors.gray[200],
            },
            '&:hover fieldset': {
              borderColor: notionColors.gray[300],
            },
            '&.Mui-focused fieldset': {
              borderColor: notionColors.teal.main,
            },
          },
          '@media (max-width:600px)': {
            '& .MuiInputBase-root': {
              fontSize: '0.875rem',
            },
            '& .MuiInputLabel-root': {
              fontSize: '0.875rem',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${notionColors.divider}`,
          borderRadius: 3,
          '@media (max-width:600px)': {
            borderRadius: 2,
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            padding: '12px 16px',
            '&:last-child': {
              paddingBottom: 12,
            },
          },
        },
      },
    },
    MuiCardActions: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            padding: '8px 16px 16px',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: notionColors.divider,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
          height: '24px',
          borderRadius: '3px',
          '@media (max-width:600px)': {
            height: '28px',
            fontSize: '0.75rem',
          },
        },
        outlined: {
          borderColor: notionColors.gray[200],
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 3,
          '&:hover': {
            backgroundColor: notionColors.background.subtle,
          },
          '@media (max-width:600px)': {
            paddingTop: 8,
            paddingBottom: 8,
            minHeight: 48,
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: 16,
          paddingRight: 16,
          '@media (min-width:600px)': {
            paddingLeft: 24,
            paddingRight: 24,
          },
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0, // スマートフォン（縦向き）
      sm: 600, // スマートフォン（横向き）、小型タブレット
      md: 900, // タブレット
      lg: 1200, // デスクトップ
      xl: 1536, // 大型デスクトップ
    },
  },
});

// ダークモードテーマの作成
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: darkModeColors.teal,
    secondary: {
      main: '#F2994A', // オレンジ色
      light: '#F5B97E',
      dark: '#E07C26',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#EB5757',
      light: '#F08989',
      dark: '#D43F3F',
    },
    warning: {
      main: '#F2C94C',
      light: '#F6DB86',
      dark: '#DFB52E',
    },
    info: {
      main: '#56CCF2',
      light: '#88DCF6',
      dark: '#30AED3',
    },
    success: {
      main: '#6FCF97',
      light: '#9BDEB6',
      dark: '#4FB77A',
    },
    text: {
      primary: darkModeColors.text.primary,
      secondary: darkModeColors.text.secondary,
      disabled: darkModeColors.text.disabled,
    },
    background: {
      default: darkModeColors.background.default,
      paper: darkModeColors.background.paper,
    },
    divider: darkModeColors.divider,
    grey: darkModeColors.gray,
  },
  typography: lightTheme.typography, // タイポグラフィはライトテーマと同じ
  shape: lightTheme.shape, // 図形も同じ
  transitions: lightTheme.transitions, // トランジションも同じ
  zIndex: lightTheme.zIndex, // zIndexも同じ
});

// テーマに共通の設定を適用
const getTheme = (mode) => {
  return responsiveFontSizes(mode === 'dark' ? darkTheme : lightTheme);
};

export { getTheme };
export default lightTheme; // 後方互換性のため、デフォルトでlightThemeをエクスポート
