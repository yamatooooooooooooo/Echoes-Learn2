import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgressRadarChart from '../../../../../presentation/features/dashboard/components/ProgressRadarChart';
import { RadarChartData } from '../../../../../domain/services/visualizationService';
import { ThemeProvider, createTheme } from '@mui/material';

// テスト用のモックデータ
const mockData: RadarChartData[] = [
  { subject: '数学', progress: 50 },
  { subject: '英語', progress: 75 },
  { subject: '物理', progress: 30 }
];

// テスト用のラッパーコンポーネント
const renderWithTheme = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe('ProgressRadarChart', () => {
  it('データがある場合、タイトルとチャートが表示される', () => {
    renderWithTheme(<ProgressRadarChart data={mockData} />);
    
    // タイトルが表示されていることを確認
    expect(screen.getByText('学習進捗レーダーチャート')).toBeInTheDocument();
    
    // 各科目名が表示されていることを確認
    expect(screen.getByText('数学')).toBeInTheDocument();
    expect(screen.getByText('英語')).toBeInTheDocument();
    expect(screen.getByText('物理')).toBeInTheDocument();
  });

  it('カスタムタイトルが指定された場合、そのタイトルが表示される', () => {
    const customTitle = 'カスタムチャートタイトル';
    renderWithTheme(<ProgressRadarChart data={mockData} title={customTitle} />);
    
    expect(screen.getByText(customTitle)).toBeInTheDocument();
  });

  it('データが空の場合、メッセージが表示される', () => {
    renderWithTheme(<ProgressRadarChart data={[]} />);
    
    expect(screen.getByText('表示するデータがありません。')).toBeInTheDocument();
    expect(screen.getByText('科目を追加して学習を開始しましょう。')).toBeInTheDocument();
  });

  it('データがnullの場合、メッセージが表示される', () => {
    renderWithTheme(<ProgressRadarChart data={null as any} />);
    
    expect(screen.getByText('表示するデータがありません。')).toBeInTheDocument();
  });
}); 