import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SubjectThemeSelector } from '../SubjectThemeSelector';
import { AppThemeProvider } from '../../../../../contexts/ThemeContext';

// モックの作成
jest.mock('../../../../../contexts/ThemeContext', () => {
  const originalModule = jest.requireActual('../../../../../contexts/ThemeContext');
  
  // モック関数
  const setSubjectThemeMock = jest.fn();
  
  return {
    ...originalModule,
    useTheme: () => ({
      mode: 'light',
      currentTheme: 'light',
      setMode: jest.fn(),
      toggleTheme: jest.fn(),
      subjectThemes: [
        { subjectId: 'test-subject', mode: 'inherit' }
      ],
      setSubjectTheme: setSubjectThemeMock,
      getSubjectTheme: jest.fn(() => 'light')
    })
  };
});

describe('SubjectThemeSelector', () => {
  beforeEach(() => {
    // テスト前にモックをリセット
    jest.clearAllMocks();
  });
  
  it('科目テーマセレクターが正しくレンダリングされる', () => {
    render(
      <AppThemeProvider>
        <SubjectThemeSelector subjectId="test-subject" />
      </AppThemeProvider>
    );
    
    // ヘッダーが表示されていることを確認
    expect(screen.getByText('テーマ設定')).toBeInTheDocument();
    
    // テーマオプションが表示されていることを確認
    expect(screen.getByText('ライト')).toBeInTheDocument();
    expect(screen.getByText('ダーク')).toBeInTheDocument();
    expect(screen.getByText('グローバル')).toBeInTheDocument();
  });
  
  it('テーマオプションをクリックすると適切な関数が呼ばれる', () => {
    const { getByText } = render(
      <AppThemeProvider>
        <SubjectThemeSelector subjectId="test-subject" />
      </AppThemeProvider>
    );
    
    // ライトモードボタンをクリック
    fireEvent.click(getByText('ライト'));
    
    // setSubjectTheme関数が正しく呼ばれることを確認
    const setSubjectThemeMock = require('../../../../../contexts/ThemeContext').useTheme().setSubjectTheme;
    expect(setSubjectThemeMock).toHaveBeenCalledWith('test-subject', 'light');
    
    // ダークモードボタンをクリック
    fireEvent.click(getByText('ダーク'));
    expect(setSubjectThemeMock).toHaveBeenCalledWith('test-subject', 'dark');
    
    // グローバル設定ボタンをクリック
    fireEvent.click(getByText('グローバル'));
    expect(setSubjectThemeMock).toHaveBeenCalledWith('test-subject', 'inherit');
  });
}); 