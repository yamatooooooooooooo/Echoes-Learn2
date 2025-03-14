import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { createAppTheme } from '../theme/theme';
import { useLocalStorage } from '../hooks/useLocalStorage';

// テーマモードの定義
export type ThemeMode = 'light' | 'dark' | 'system' | 'auto';

// 科目別テーマ設定の型
export interface SubjectTheme {
  subjectId: string;
  mode: 'light' | 'dark' | 'inherit'; // inheritはグローバル設定を継承
}

// テーマコンテキストの型定義
interface ThemeContextType {
  mode: ThemeMode;
  currentTheme: 'light' | 'dark'; // 実際に適用されているテーマ
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void; // テーマを切り替える関数
  subjectThemes: SubjectTheme[]; // 科目別テーマ設定
  setSubjectTheme: (subjectId: string, mode: 'light' | 'dark' | 'inherit') => void; // 科目別テーマを設定
  getSubjectTheme: (subjectId: string) => 'light' | 'dark'; // 科目のテーマを取得
}

// コンテキストの作成
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// プロバイダーコンポーネントのプロパティ型
interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * テーマプロバイダーコンポーネント
 * アプリケーション全体でテーマを管理する
 */
export const AppThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // ローカルストレージにテーマ設定を保存
  const [mode, setMode] = useLocalStorage<ThemeMode>('themeMode', 'system');
  const [subjectThemes, setSubjectThemes] = useLocalStorage<SubjectTheme[]>('subjectThemes', []);

  // 実際に適用するテーマ（light または dark）
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  // エラー状態
  const [error, setError] = useState<string | null>(null);

  // テーマを適用する関数
  const applyTheme = (mode: ThemeMode) => {
    try {
      let theme: 'light' | 'dark' = 'light';

      if (mode === 'light' || mode === 'dark') {
        theme = mode;
      } else if (mode === 'system' || mode === 'auto') {
        // システムのテーマ設定を取得
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = prefersDarkMode ? 'dark' : 'light';
      }

      setCurrentTheme(theme);
      setError(null);
    } catch (err) {
      console.error('テーマの適用に失敗しました', err);
      setError('テーマの適用に失敗しました');
    }
  };

  // テーマの変更を監視し、適用する
  useEffect(() => {
    applyTheme(mode);
  }, [mode, applyTheme]);

  // システムのダークモード設定を監視
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      if (mode === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [mode, applyTheme]);

  // テーマの切り替え
  const toggleTheme = () => {
    if (mode === 'light') {
      setMode('dark');
    } else if (mode === 'dark') {
      setMode('system');
    } else {
      setMode('light');
    }
  };

  // 科目別テーマを設定
  const setSubjectTheme = (subjectId: string, mode: 'light' | 'dark' | 'inherit') => {
    const existingIndex = subjectThemes.findIndex((theme) => theme.subjectId === subjectId);

    if (existingIndex >= 0) {
      const updatedThemes = [...subjectThemes];
      updatedThemes[existingIndex] = { subjectId, mode };
      setSubjectThemes(updatedThemes);
    } else {
      setSubjectThemes([...subjectThemes, { subjectId, mode }]);
    }
  };

  // 科目のテーマを取得
  const getSubjectTheme = (subjectId: string): 'light' | 'dark' => {
    const subjectTheme = subjectThemes.find((theme) => theme.subjectId === subjectId);

    if (!subjectTheme || subjectTheme.mode === 'inherit') {
      return currentTheme;
    }

    return subjectTheme.mode;
  };

  // コンテキスト値の作成
  const contextValue: ThemeContextType = {
    mode,
    currentTheme,
    setMode,
    toggleTheme,
    subjectThemes,
    setSubjectTheme,
    getSubjectTheme,
  };

  // アプリ全体のテーマを適用したThemeProviderでラップ
  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={createAppTheme(currentTheme)}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};

// テーマコンテキストを使用するためのカスタムフック
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a AppThemeProvider');
  }
  return context;
};

// ThemeContextをエクスポート
export { ThemeContext };
