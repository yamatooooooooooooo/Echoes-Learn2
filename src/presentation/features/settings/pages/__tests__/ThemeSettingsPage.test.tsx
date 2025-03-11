import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeSettingsPage } from '../ThemeSettingsPage';
import { AppThemeProvider } from '../../../../../contexts/ThemeContext';

// モックの作成
jest.mock('../../../../../contexts/ThemeContext', () => {
  const originalModule = jest.requireActual('../../../../../contexts/ThemeContext');
  
  return {
    ...originalModule,
    useTheme: () => ({
      mode: 'light',
      currentTheme: 'light',
      setMode: jest.fn(),
      toggleTheme: jest.fn(),
      subjectThemes: [],
      setSubjectTheme: jest.fn(),
      getSubjectTheme: jest.fn(() => 'light')
    })
  };
});

describe('ThemeSettingsPage', () => {
  beforeEach(() => {
    // テスト前にモックをリセット
    jest.clearAllMocks();
  });
  
  it('テーマ設定画面が正しくレンダリングされる', () => {
    render(
      <AppThemeProvider>
        <ThemeSettingsPage />
      </AppThemeProvider>
    );
    
    // ヘッダーが表示されていることを確認
    expect(screen.getByText('テーマ設定')).toBeInTheDocument();
    
    // テーマオプションが表示されていることを確認
    expect(screen.getByText('ライトモード')).toBeInTheDocument();
    expect(screen.getByText('ダークモード')).toBeInTheDocument();
    
    // 自動設定オプションが表示されていることを確認
    expect(screen.getByText('システム設定に従う')).toBeInTheDocument();
    expect(screen.getByText('時間帯で自動切替')).toBeInTheDocument();
  });
  
  it('情報アイコンをクリックすると説明が表示される', () => {
    render(
      <AppThemeProvider>
        <ThemeSettingsPage />
      </AppThemeProvider>
    );
    
    // 最初は説明が表示されていないことを確認
    expect(screen.queryByText(/アプリケーションの表示モードを選択できます/)).not.toBeInTheDocument();
    
    // 情報アイコンをクリック
    const infoButton = screen.getByRole('button', { name: /info/i });
    fireEvent.click(infoButton);
    
    // 説明が表示されることを確認
    expect(screen.getByText(/アプリケーションの表示モードを選択できます/)).toBeInTheDocument();
  });
}); 