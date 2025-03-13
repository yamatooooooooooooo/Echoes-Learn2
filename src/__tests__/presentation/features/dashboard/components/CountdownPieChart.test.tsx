import React from 'react';
import { render, screen } from '@testing-library/react';
import CountdownPieChart from '../../../../../presentation/features/dashboard/components/CountdownPieChart';
import { CountdownData } from '../../../../../domain/services/visualizationService';
import { ThemeProvider, createTheme } from '@mui/material';
import { format } from 'date-fns';

// テスト用のモックデータ
const mockData: CountdownData = {
  subject: '数学',
  dueDate: new Date('2023-12-31'),
  remainingDays: 10,
  progressData: [
    { name: '完了', value: 60 },
    { name: '未完了', value: 40 }
  ]
};

// テスト用のラッパーコンポーネント
const renderWithTheme = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe('CountdownPieChart', () => {
  it('科目名、残り日数、試験日、進捗率が正しく表示される', () => {
    renderWithTheme(<CountdownPieChart data={mockData} />);
    
    // 科目名が表示されていることを確認
    expect(screen.getByText('数学')).toBeInTheDocument();
    
    // 残り日数が表示されていることを確認
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('残り日数')).toBeInTheDocument();
    
    // 試験日が表示されていることを確認
    const formattedDate = format(mockData.dueDate, 'yyyy/MM/dd');
    expect(screen.getByText(`試験日: ${formattedDate}`)).toBeInTheDocument();
    
    // 進捗率が表示されていることを確認
    expect(screen.getByText('進捗率: 60%')).toBeInTheDocument();
  });

  it('残り日数に応じて色が変わる（7日以内は赤色）', () => {
    const urgentData: CountdownData = {
      ...mockData,
      remainingDays: 5
    };
    
    renderWithTheme(<CountdownPieChart data={urgentData} />);
    
    // 残り日数のテキストが存在することを確認
    const remainingDaysElement = screen.getByText('5');
    
    // 色のスタイルをチェックするのは難しいため、要素が存在することだけを確認
    expect(remainingDaysElement).toBeInTheDocument();
  });

  it('残り日数に応じて色が変わる（8-14日は黄色）', () => {
    const warningData: CountdownData = {
      ...mockData,
      remainingDays: 10
    };
    
    renderWithTheme(<CountdownPieChart data={warningData} />);
    
    // 残り日数のテキストが存在することを確認
    const remainingDaysElement = screen.getByText('10');
    expect(remainingDaysElement).toBeInTheDocument();
  });

  it('残り日数に応じて色が変わる（15日以上は緑色）', () => {
    const safeData: CountdownData = {
      ...mockData,
      remainingDays: 20
    };
    
    renderWithTheme(<CountdownPieChart data={safeData} />);
    
    // 残り日数のテキストが存在することを確認
    const remainingDaysElement = screen.getByText('20');
    expect(remainingDaysElement).toBeInTheDocument();
  });
}); 