import React from 'react';
import { render } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { ProgressDetailDialog } from '../ProgressDetailDialog';
import { Progress } from '../../../../../domain/models/ProgressModel';

// モックデータ
const mockProgress: Progress = {
  id: 'progress-1',
  userId: 'user-1',
  subjectId: 'subject-1',
  startPage: 10,
  endPage: 20,
  pagesRead: 11,
  recordDate: '2023-03-10',
  studyDuration: 60,
  memo: 'テスト用メモです。内容を確認してください。',
  createdAt: new Date('2023-03-10T10:00:00'),
  updatedAt: new Date('2023-03-10T11:00:00'),
};

// モック関数
const mockOnClose = jest.fn();
const mockFormatDate = jest.fn((date) =>
  typeof date === 'string' ? date : date.toISOString().split('T')[0]
);

describe('ProgressDetailDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ダイアログが閉じている場合は何も表示しない', () => {
    const { container } = render(
      <ProgressDetailDialog
        open={false}
        progress={mockProgress}
        onClose={mockOnClose}
        formatDate={mockFormatDate}
      />
    );

    // ダイアログが表示されていないことを確認
    expect(container.firstChild).toBeNull();
  });

  test('progressがnullの場合は何も表示しない', () => {
    const { container } = render(
      <ProgressDetailDialog
        open={true}
        progress={null}
        onClose={mockOnClose}
        formatDate={mockFormatDate}
      />
    );

    // ダイアログが表示されていないことを確認
    expect(container.firstChild).toBeNull();
  });

  test('進捗詳細を正しく表示する', () => {
    render(
      <ProgressDetailDialog
        open={true}
        progress={mockProgress}
        onClose={mockOnClose}
        formatDate={mockFormatDate}
      />
    );

    // ダイアログのタイトルが表示されていることを確認
    expect(screen.getByText('進捗詳細')).toBeInTheDocument();

    // 進捗情報が表示されていることを確認
    expect(screen.getByText('記録日')).toBeInTheDocument();
    expect(screen.getByText('2023-03-10')).toBeInTheDocument();

    expect(screen.getByText('開始ページ')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    expect(screen.getByText('終了ページ')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();

    expect(screen.getByText('読了ページ数')).toBeInTheDocument();
    expect(screen.getByText('11 ページ')).toBeInTheDocument();

    expect(screen.getByText('学習時間')).toBeInTheDocument();
    expect(screen.getByText('60 分')).toBeInTheDocument();

    expect(screen.getByText('メモ')).toBeInTheDocument();
    expect(screen.getByText('テスト用メモです。内容を確認してください。')).toBeInTheDocument();

    expect(screen.getByText('作成日時')).toBeInTheDocument();
    expect(screen.getByText('最終更新日時')).toBeInTheDocument();
  });

  test('閉じるボタンをクリックするとonCloseが呼ばれる', () => {
    render(
      <ProgressDetailDialog
        open={true}
        progress={mockProgress}
        onClose={mockOnClose}
        formatDate={mockFormatDate}
      />
    );

    // 閉じるボタンをクリック
    fireEvent.click(screen.getByText('閉じる'));

    // onCloseが呼ばれたことを確認
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('XボタンをクリックするとonCloseが呼ばれる', () => {
    render(
      <ProgressDetailDialog
        open={true}
        progress={mockProgress}
        onClose={mockOnClose}
        formatDate={mockFormatDate}
      />
    );

    // Xボタンをクリック
    fireEvent.click(screen.getByLabelText('close'));

    // onCloseが呼ばれたことを確認
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
