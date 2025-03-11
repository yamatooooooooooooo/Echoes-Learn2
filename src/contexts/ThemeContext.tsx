import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { createAppTheme } from '../theme/theme';
import { useLocalStorage } from '../hooks/useLocalStorage';

// テーマモードの定義
export type ThemeMode = 'light' | 'dark' | 'system' | 'auto';

// テーマコンテキストの型定義
interface ThemeContextType {
  mode: ThemeMode;
  currentTheme: 'light' | 'dark'; // 実際に適用されているテーマ
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void; // テーマを切り替える関数
}

// コンテキストの作成
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// プロバイダーコンポーネントのプロパティ型
interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * テーマプロバイダーコンポーネント
 * アプリケーション全体でテーマを管理する
 */
export function AppThemeProvider({ children }: ThemeProviderProps) {
  // ローカルストレージにテーマ設定を保存
  const [mode, setMode] = useLocalStorage<ThemeMode>('themeMode', 'system');
  
  // 実際に適用するテーマ（light または dark）
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  // エラー状態
  const [error, setError] = useState<string | null>(null);

  // テーマを適用する関数
  const applyTheme = () => {
    try {
      if (mode === 'light') {
        setCurrentTheme('light');
      } else if (mode === 'dark') {
        setCurrentTheme('dark');
      } else if (mode === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setCurrentTheme(prefersDark ? 'dark' : 'light');
      } else if (mode === 'auto') {
        // 時間帯に応じた自動切り替え（6時〜18時はライト、それ以外はダーク）
        const hours = new Date().getHours();
        setCurrentTheme(hours >= 6 && hours < 18 ? 'light' : 'dark');
      }
    } catch (err) {
      console.error('テーマの適用に失敗しました:', err);
      setError('テーマの適用に失敗しました。デフォルト設定を使用します。');
      setCurrentTheme('light'); // エラー時はライトモードをデフォルトとして使用
    }
  };

  // システムのテーマ設定を取得（メディアクエリ）
  useEffect(() => {
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // システムテーマが変更されたときのハンドラー
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        try {
          if (mode === 'system') {
            setCurrentTheme(e.matches ? 'dark' : 'light');
          }
        } catch (err) {
          console.error('システムテーマの変更処理に失敗しました:', err);
          setError('システムテーマの変更処理に失敗しました。');
        }
      };
      
      // 初期テーマを適用
      applyTheme();
      
      // システムテーマの変更を監視
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      
      // 'auto'モードの場合は1分ごとにチェック（時間帯による切り替え）
      let intervalId: number | undefined;
      if (mode === 'auto') {
        intervalId = window.setInterval(applyTheme, 60000);
      }
      
      return () => {
        try {
          mediaQuery.removeEventListener('change', handleSystemThemeChange);
          if (intervalId) clearInterval(intervalId);
        } catch (err) {
          console.error('テーマ監視のクリーンアップに失敗しました:', err);
        }
      };
    } catch (err) {
      console.error('テーマ設定の初期化に失敗しました:', err);
      setError('テーマ設定の初期化に失敗しました。デフォルト設定を使用します。');
      setCurrentTheme('light'); // エラー時はライトモードをデフォルトとして使用
    }
  }, [mode]); // modeが変更されたら再実行

  // コンテキスト値
  const contextValue: ThemeContextType = {
    mode,
    currentTheme,
    setMode,
    toggleTheme: () => {
      // 現在のモードに基づいて切り替え
      if (mode === 'light') {
        setMode('dark');
      } else if (mode === 'dark') {
        setMode('light');
      } else if (mode === 'system' || mode === 'auto') {
        // systemまたはautoの場合は、現在適用されているテーマの反対を設定
        setMode(currentTheme === 'light' ? 'dark' : 'light');
      }
    }
  };

  // 現在のテーマに基づいてMUIテーマを生成
  const theme = createAppTheme(currentTheme);

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        {error && (
          <div style={{ 
            padding: '8px 16px', 
            backgroundColor: '#f44336', 
            color: 'white',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

/**
 * テーマにアクセスするためのカスタムフック
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a AppThemeProvider');
  }
  return context;
}

export default ThemeContext; 