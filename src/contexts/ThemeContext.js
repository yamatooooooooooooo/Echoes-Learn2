import React, { createContext, useState, useContext, useEffect } from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { getTheme } from '../styles/theme';

// テーマコンテキストの作成
const ThemeContext = createContext({
  mode: 'light',
  toggleTheme: () => {},
});

// カスタムフックの作成
export const useTheme = () => useContext(ThemeContext);

// テーマプロバイダーコンポーネント
export const ThemeProvider = ({ children }) => {
  // ローカルストレージからテーマモードを取得、またはデフォルトでlightを使用
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });

  // テーマ切り替え関数
  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  // テーマモードが変更されたとき、HTMLのdata-theme属性を更新
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  // 現在のモードに基づいてテーマを取得
  const theme = getTheme(mode);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MUIThemeProvider theme={theme}>
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
}; 