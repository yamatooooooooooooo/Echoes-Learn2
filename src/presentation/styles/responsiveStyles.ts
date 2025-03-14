import { Theme } from '@mui/material/styles';

// メディアクエリのブレークポイント
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};

// モバイルタッチ最適化スタイル
export const touchFriendlyStyles = {
  touchTarget: {
    minHeight: 48,
    minWidth: 48,
    padding: '12px',
  },
  touchableTab: {
    minHeight: 48,
    fontSize: '1rem',
    padding: '12px 16px',
  },
  mobileActionButton: {
    minWidth: '44px',
    minHeight: '44px',
  },
};

// レスポンシブコンテナスタイル
export const responsiveContainerStyles = {
  mainContainer: {
    width: '100%',
    padding: {
      xs: '12px',
      sm: '20px',
      md: '28px',
    },
    maxWidth: {
      sm: '95%',
      md: '92%',
      lg: '1400px'
    },
    mx: 'auto',
  },
  cardContainer: {
    padding: {
      xs: '10px',
      sm: '14px',
      md: '20px',
    },
    borderRadius: {
      xs: '4px',
      sm: '6px'
    }
  },
  flexCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  flexBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridContainer: {
    display: 'grid',
    gridGap: {
      xs: '16px',
      sm: '24px',
      md: '32px'
    },
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(auto-fill, minmax(280px, 1fr))',
      md: 'repeat(auto-fill, minmax(320px, 1fr))'
    }
  },
  // タッチデバイス向けの調整
  touchFriendly: {
    button: {
      minHeight: '44px',
      minWidth: '44px'
    },
    input: {
      padding: '12px',
      fontSize: '16px' // iOSでの自動ズームを防止
    },
    clickableArea: {
      padding: '12px'
    }
  }
};

// レスポンシブデータ可視化スタイル
export const responsiveDataVisStyles = {
  chartHeight: {
    height: {
      xs: 200,
      sm: 250,
      md: 300,
    },
  },
  chartContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  responsiveFontSize: {
    fontSize: {
      xs: 10,
      sm: 12,
      md: 14,
    },
  },
};

// レスポンシブテキストスタイル
export const responsiveTextStyles = {
  header: {
    fontSize: {
      xs: '1.5rem',
      sm: '1.75rem',
      md: '2rem',
    },
    fontWeight: 600,
    lineHeight: 1.2,
  },
  subheader: {
    fontSize: {
      xs: '1.1rem',
      sm: '1.25rem',
      md: '1.5rem',
    },
    fontWeight: 500,
    lineHeight: 1.3,
  },
  body: {
    fontSize: {
      xs: '0.875rem',
      sm: '1rem',
      md: '1rem',
    },
    lineHeight: 1.5,
  },
};

// デバイス検出ヘルパー
export const isSafariOrIOS = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  
  const ua = navigator.userAgent.toLowerCase();
  const isSafari = ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  return isSafari || isIOS;
};

export default {
  breakpoints,
  touchFriendlyStyles,
  responsiveContainerStyles,
  responsiveDataVisStyles,
  responsiveTextStyles,
  isSafariOrIOS,
}; 