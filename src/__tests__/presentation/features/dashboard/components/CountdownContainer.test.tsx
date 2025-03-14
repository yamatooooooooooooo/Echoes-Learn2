import React from 'react';
import { render, screen } from '@testing-library/react';
import CountdownContainer from '../../../../../presentation/features/dashboard/components/CountdownContainer';
import { CountdownData } from '../../../../../domain/services/visualizationService';
import { ThemeProvider, createTheme } from '@mui/material';

// テスト用のモックデータ
const mockData: CountdownData[] = [
  {
    subject: '数学',
    dueDate: new Date('2023-12-31'),
    remainingDays: 10,
    progressData: [
      { name: '完了', value: 60 },
      { name: '未完了', value: 40 },
    ],
  },
  {
    subject: '英語',
    dueDate: new Date('2023-12-15'),
    remainingDays: 5,
    progressData: [
      { name: '完了', value: 75 },
      { name: '未完了', value: 25 },
    ],
  },
  {
    subject: '物理',
    dueDate: new Date('2024-01-15'),
    remainingDays: 20,
    progressData: [
      { name: '完了', value: 30 },
      { name: '未完了', value: 70 },
    ],
  },
];

// テスト用のラッパーコンポーネント
const renderWithTheme = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

// CountdownPieChartコンポーネントをモック
jest.mock('../../../../../presentation/features/dashboard/components/CountdownPieChart', () => {
  return function MockCountdownPieChart({ data }: { data: CountdownData }) {
    return (
      <div data-testid="countdown-pie-chart">
        <div data-testid="subject">{data.subject}</div>
        <div data-testid="remaining-days">{data.remainingDays}</div>
      </div>
    );
  };
});

describe('CountdownContainer', () => {
  it('タイトルが正しく表示される', () => {
    renderWithTheme(<CountdownContainer data={mockData} />);

    expect(screen.getByText('試験準備カウントダウン')).toBeInTheDocument();
  });

  it('カスタムタイトルが指定された場合、そのタイトルが表示される', () => {
    const customTitle = 'カスタムカウントダウン';
    renderWithTheme(<CountdownContainer data={mockData} title={customTitle} />);

    expect(screen.getByText(customTitle)).toBeInTheDocument();
  });

  it('データが空の場合、メッセージが表示される', () => {
    renderWithTheme(<CountdownContainer data={[]} />);

    expect(screen.getByText('表示するデータがありません。')).toBeInTheDocument();
    expect(screen.getByText('科目を追加して試験日を設定しましょう。')).toBeInTheDocument();
  });

  it('データがnullの場合、メッセージが表示される', () => {
    renderWithTheme(<CountdownContainer data={null as any} />);

    expect(screen.getByText('表示するデータがありません。')).toBeInTheDocument();
  });

  it('試験日が近い順にソートされる', () => {
    renderWithTheme(<CountdownContainer data={mockData} />);

    const subjects = screen.getAllByTestId('subject');
    const remainingDays = screen.getAllByTestId('remaining-days');

    // 残り日数が少ない順（英語、数学、物理）
    expect(subjects[0].textContent).toBe('英語');
    expect(remainingDays[0].textContent).toBe('5');

    expect(subjects[1].textContent).toBe('数学');
    expect(remainingDays[1].textContent).toBe('10');

    expect(subjects[2].textContent).toBe('物理');
    expect(remainingDays[2].textContent).toBe('20');
  });
});
