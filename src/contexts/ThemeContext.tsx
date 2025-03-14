import React, { createContext, useContext, useState, useEffect, FC, ReactNode } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { darkThemeOptions, lightThemeOptions } from '../theme/theme';
import useMediaQuery from '@mui/material/useMediaQuery';

// テーマモードの定義
export type ThemeMode = 'light' | 'dark' | 'system';

// 科目別テーマ設定の型
export interface SubjectTheme {
  id: string;
  name: string;
  color: string;
}

// テーマコンテキストの型定義
export interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  subjectThemes: SubjectTheme[];
  activeSubjectTheme: SubjectTheme | null;
  setActiveSubjectTheme: (theme: SubjectTheme | null) => void;
  addSubjectTheme: (theme: SubjectTheme) => void;
  removeSubjectTheme: (id: string) => void;
  updateSubjectTheme: (id: string, updates: Partial<SubjectTheme>) => void;
}

const defaultSubjectThemes: SubjectTheme[] = [
  { id: 'default', name: 'デフォルト', color: '#4B8AF0' },
  { id: 'green', name: '緑', color: '#10B981' },
  { id: 'purple', name: '紫', color: '#8B5CF6' },
  { id: 'pink', name: 'ピンク', color: '#EC4899' },
  { id: 'yellow', name: '黄色', color: '#F59E0B' },
];

// コンテキストの作成
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// プロバイダーコンポーネントのプロパティ型
interface AppThemeProviderProps {
  children: ReactNode;
}

/**
 * テーマプロバイダーコンポーネント
 * アプリケーション全体でテーマを管理する
 */
export const AppThemeProvider: FC<AppThemeProviderProps> = ({ children }) => {
  // システム設定の検出を強化（初期値としてだけでなく継続的に監視）
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  // 保存されたテーマモードの取得を改善
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    // 有効な値のみ許可（型安全性を確保）
    if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system') {
      return savedMode as ThemeMode;
    }
    return 'system'; // デフォルト値
  });
  
  // 実際の表示テーマの計算（'system'の場合はシステム設定に従う）
  const actualTheme = mode === 'system' 
    ? (prefersDarkMode ? 'dark' : 'light')
    : mode;
  
  // テーマ状態をウィンドウオブジェクトに公開
  useEffect(() => {
    // グローバル変数としてテーマモードを公開
    (window as any).echoesLearnTheme = {
      mode: actualTheme,
      isDark: actualTheme === 'dark'
    };
    
    // カスタムイベントを発行してフッターに通知
    const themeChangeEvent = new CustomEvent('themeChange', { 
      detail: { mode: actualTheme, isDark: actualTheme === 'dark' } 
    });
    window.dispatchEvent(themeChangeEvent);
    
    // デバッグログ
    console.log(`Theme mode updated: ${actualTheme}`);
  }, [actualTheme]);
  
  // サブジェクトテーマの状態管理を改善
  const [subjectThemes, setSubjectThemes] = useState<SubjectTheme[]>(() => {
    const savedThemes = localStorage.getItem('subjectThemes');
    if (savedThemes) {
      try {
        return JSON.parse(savedThemes);
      } catch (e) {
        console.error('Failed to parse saved subject themes:', e);
        return defaultSubjectThemes;
      }
    }
    return defaultSubjectThemes;
  });
  
  const [activeSubjectTheme, setActiveSubjectThemeState] = useState<SubjectTheme | null>(() => {
    const savedActiveTheme = localStorage.getItem('activeSubjectTheme');
    if (savedActiveTheme) {
      try {
        return JSON.parse(savedActiveTheme);
      } catch (e) {
        console.error('Failed to parse saved active subject theme:', e);
        return null;
      }
    }
    return null;
  });

  // モードの変更時にローカルストレージを更新
  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('themeMode', newMode);
    console.log(`Theme mode set to: ${newMode}`); // デバッグログ追加
  };

  // モードの切り替え機能
  const toggleMode = () => {
    setModeState(prevMode => {
      if (prevMode === 'light') return 'dark';
      if (prevMode === 'dark') return 'system';
      return 'light';
    });
  };

  // アクティブなサブジェクトテーマの設定
  const setActiveSubjectTheme = (theme: SubjectTheme | null) => {
    setActiveSubjectThemeState(theme);
    localStorage.setItem('activeSubjectTheme', theme ? JSON.stringify(theme) : '');
    console.log(`Active subject theme set to:`, theme); // デバッグログ追加
  };

  // サブジェクトテーマの追加
  const addSubjectTheme = (theme: SubjectTheme) => {
    setSubjectThemes(prev => {
      const updated = [...prev, theme];
      localStorage.setItem('subjectThemes', JSON.stringify(updated));
      return updated;
    });
  };

  // サブジェクトテーマの削除
  const removeSubjectTheme = (id: string) => {
    setSubjectThemes(prev => {
      const updated = prev.filter(theme => theme.id !== id);
      localStorage.setItem('subjectThemes', JSON.stringify(updated));
      return updated;
    });
    
    // 削除されたテーマが現在アクティブな場合、アクティブテーマをリセット
    if (activeSubjectTheme?.id === id) {
      setActiveSubjectTheme(null);
    }
  };

  // サブジェクトテーマの更新
  const updateSubjectTheme = (id: string, updates: Partial<SubjectTheme>) => {
    setSubjectThemes(prev => {
      const updated = prev.map(theme => 
        theme.id === id ? { ...theme, ...updates } : theme
      );
      localStorage.setItem('subjectThemes', JSON.stringify(updated));
      return updated;
    });
    
    // 更新されたテーマが現在アクティブな場合、アクティブテーマも更新
    if (activeSubjectTheme?.id === id) {
      setActiveSubjectTheme({ ...activeSubjectTheme, ...updates });
    }
  };

  // システム設定の変更を監視し、'system'モードの場合は自動的にテーマを更新
  useEffect(() => {
    if (mode === 'system') {
      // システム設定が変更された場合、コンポーネントを再レンダリングするためのダミー更新
      setModeState('system');
      console.log(`System preference changed to: ${prefersDarkMode ? 'dark' : 'light'}`); // デバッグログ追加
    }
  }, [prefersDarkMode, mode]);

  // テーマの作成 - 選択されたモードとアクティブなサブジェクトテーマに基づく
  const theme = React.useMemo(() => {
    // ベースとなるテーマオプションを選択
    const baseThemeOptions = actualTheme === 'dark' ? darkThemeOptions : lightThemeOptions;
    
    // アクティブなサブジェクトテーマがある場合、primary colorをカスタマイズ
    if (activeSubjectTheme) {
      return createTheme({
        ...baseThemeOptions,
        palette: {
          ...baseThemeOptions.palette,
          primary: {
            main: activeSubjectTheme.color,
            ...(baseThemeOptions.palette?.primary || {})
          }
        }
      });
    }
    
    return createTheme(baseThemeOptions);
  }, [actualTheme, activeSubjectTheme]);

  // コンテキスト値の構築
  const contextValue: ThemeContextType = {
    mode,
    setMode,
    toggleMode,
    subjectThemes,
    activeSubjectTheme,
    setActiveSubjectTheme,
    addSubjectTheme,
    removeSubjectTheme,
    updateSubjectTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

// テーマコンテキストを使用するためのカスタムフック
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within an AppThemeProvider');
  }
  return context;
};

// ThemeContextをエクスポート
export { ThemeContext };
