import React from 'react';
import { render } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { ProgressHistory } from '../ProgressHistory';
import { Progress } from '../../../../../domain/models/ProgressModel';

// モックデータ
const mockProgressRecords: Progress[] = [
  {
    id: 'progress-1',
    userId: 'user-1',
    subjectId: 'subject-1',
    startPage: 1,
    endPage: 10,
    pagesRead: 10,
    recordDate: '2023-03-10',
    createdAt: new Date('2023-03-10T10:00:00'),
    updatedAt: new Date('2023-03-10T10:00:00'),
  },
  {
    id: 'progress-2',
    userId: 'user-1',
    subjectId: 'subject-1',
    startPage: 11,
    endPage: 20,
    pagesRead: 10,
    recordDate: '2023-03-11',
    memo: 'テストメモ',
    createdAt: new Date('2023-03-11T10:00:00'),
    updatedAt: new Date('2023-03-11T10:00:00'),
  },
  {
    id: 'progress-3',
    userId: 'user-1',
    subjectId: 'subject-1',
    startPage: 21,
    endPage: 30,
    pagesRead: 10,
    recordDate: '2023-03-12',
    createdAt: new Date('2023-03-12T10:00:00'),
    updatedAt: new Date('2023-03-12T10:00:00'),
  },
];

// モック関数
const mockOnEdit = jest.fn();
const mockOnDelete = jest.fn();
const mockFormatDate = jest.fn((date) =>
  typeof date === 'string' ? date : date.toISOString().split('T')[0]
);

describe('ProgressHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ローディング中の表示', () => {
    render(
      <ProgressHistory
        progressRecords={[]}
        loading={true}
        error={null}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        formatDate={mockFormatDate}
      />
    );

    // CircularProgressが表示されていることを確認
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('エラー時の表示', () => {
    const error = new Error('テストエラー');
    render(
      <ProgressHistory
        progressRecords={[]}
        loading={false}
        error={error}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        formatDate={mockFormatDate}
      />
    );

    // エラーメッセージが表示されていることを確認
    expect(screen.getByText(/テストエラー/)).toBeInTheDocument();
  });

  test('進捗記録なしの表示', () => {
    render(
      <ProgressHistory
        progressRecords={[]}
        loading={false}
        error={null}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        formatDate={mockFormatDate}
      />
    );

    // 進捗なしメッセージが表示されていることを確認
    expect(screen.getByText('まだ進捗記録がありません')).toBeInTheDocument();
  });

  test('進捗記録の表示', () => {
    render(
      <ProgressHistory
        progressRecords={mockProgressRecords}
        loading={false}
        error={null}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        formatDate={mockFormatDate}
      />
    );

    // フィルターボタンが表示されていることを確認
    expect(screen.getByRole('button', { name: '全期間' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '今週' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '今月' })).toBeInTheDocument();

    // 進捗記録が表示されていることを確認
    expect(screen.getByText('1 → 10')).toBeInTheDocument();
    expect(screen.getByText('11 → 20')).toBeInTheDocument();
    expect(screen.getByText('21 → 30')).toBeInTheDocument();

    // メモが表示されていることを確認
    expect(screen.getByText('テストメモ')).toBeInTheDocument();
  });

  test('編集ボタンのクリック', () => {
    render(
      <ProgressHistory
        progressRecords={mockProgressRecords}
        loading={false}
        error={null}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        formatDate={mockFormatDate}
      />
    );

    // 編集ボタンをクリック
    const editButtons = screen.getAllByLabelText('編集');
    fireEvent.click(editButtons[0]);

    // onEditが呼ばれたことを確認
    expect(mockOnEdit).toHaveBeenCalledWith(mockProgressRecords[2]); // 最新のデータが最初に表示される
  });

  test('削除ボタンのクリック', () => {
    render(
      <ProgressHistory
        progressRecords={mockProgressRecords}
        loading={false}
        error={null}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        formatDate={mockFormatDate}
      />
    );

    // 削除ボタンをクリック
    const deleteButtons = screen.getAllByLabelText('削除');
    fireEvent.click(deleteButtons[0]);

    // onDeleteが呼ばれたことを確認
    expect(mockOnDelete).toHaveBeenCalledWith('progress-3'); // 最新のデータが最初に表示される
  });

  test('フィルター切り替え - 今週', () => {
    // 日付をモック
    const originalDate = global.Date;
    const mockDateClass = class extends Date {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super('2023-03-12T12:00:00Z');
        } else {
          // @ts-ignore
          super(...args);
        }
      }

      static now() {
        return new Date('2023-03-12T12:00:00Z').getTime();
      }
    };

    global.Date = mockDateClass as DateConstructor;

    render(
      <ProgressHistory
        progressRecords={mockProgressRecords}
        loading={false}
        error={null}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        formatDate={mockFormatDate}
      />
    );

    // 今週ボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: '今週' }));

    // フィルター後にコンテンツが表示されていることを確認
    expect(screen.queryByText('1 → 10')).not.toBeInTheDocument(); // フィルターされて表示されない

    // 日付のモックを元に戻す
    global.Date = originalDate;
  });
});
