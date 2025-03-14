import { createTheme } from '@mui/material/styles';

// Notion風のライトテーマ
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#37352f',
    },
    secondary: {
      main: '#2eaadc',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
      subtle: '#f7f6f3',
    },
    text: {
      primary: '#37352f',
      secondary: '#6b6b6b',
    },
    divider: '#EAEAEA',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 3,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow:
            'rgba(15, 15, 15, 0.05) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 3px 6px, rgba(15, 15, 15, 0.2) 0px 9px 24px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #EAEAEA',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: '#D1D1D1',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#EAEAEA',
        },
      },
    },
  },
});
