import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgressCharts } from '../ProgressCharts';
import { Progress } from '../../../../../domain/models/ProgressModel';
import { Subject } from '../../../../../domain/models/SubjectModel';

// モックデータ
const mockSubject: Subject = {
  id: 'subject-1',
  name: 'テスト科目',
  currentPage: 50,
  totalPages: 300,
  examDate: new Date('2023-12-31'),
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
};

const mockProgressRecords: Progress[] = [
  {
    id: 'progress-1',
    userId: 'user-1',
    subjectId: 'subject-1',
    startPage: 1,
    endPage: 20,
    pagesRead: 20,
    recordDate: '2023-01-05',
    createdAt: new Date('2023-01-05'),
    updatedAt: new Date('2023-01-05'),
  },
  {
    id: 'progress-2',
    userId: 'user-1',
    subjectId: 'subject-1',
    startPage: 21,
    endPage: 50,
    pagesRead: 30,
    recordDate: '2023-01-10',
    createdAt: new Date('2023-01-10'),
    updatedAt: new Date('2023-01-10'),
  },
];

describe('ProgressCharts', () => {
  it('ローディング中状態を表示する', () => {
    render(
      <ProgressCharts progressRecords={[]} subject={mockSubject} loading={true} error={null} />
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('エラー状態を表示する', () => {
    const mockError = new Error('テストエラー');

    render(
      <ProgressCharts
        progressRecords={[]}
        subject={mockSubject}
        loading={false}
        error={mockError}
      />
    );

    expect(screen.getByText(/テストエラー/)).toBeInTheDocument();
  });

  it('進捗記録がない場合のメッセージを表示する', () => {
    render(
      <ProgressCharts progressRecords={[]} subject={mockSubject} loading={false} error={null} />
    );

    expect(screen.getByText('まだ進捗記録がありません')).toBeInTheDocument();
  });

  it('グラフとフィルターを表示する', () => {
    render(
      <ProgressCharts
        progressRecords={mockProgressRecords}
        subject={mockSubject}
        loading={false}
        error={null}
      />
    );

    // フィルターボタンが表示されているか
    expect(screen.getByRole('button', { name: '1週間' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1ヶ月' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '全期間' })).toBeInTheDocument();

    // グラフタイトルが表示されているか
    expect(screen.getByText('日次学習量')).toBeInTheDocument();
    expect(screen.getByText('累積学習曲線')).toBeInTheDocument();
  });
});
