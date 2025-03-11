import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProgressForm } from '../ProgressForm';
import { Subject } from '../../../../../domain/models/SubjectModel';
import { Progress } from '../../../../../domain/models/ProgressModel';

// モック
jest.mock('../../hooks/useProgressForm', () => ({
  useProgressForm: () => ({
    formData: {
      startPage: 30,
      endPage: 40,
      pagesRead: 11,
      recordDate: '2023-01-01',
      studyDuration: 60,
      memo: 'テストメモ'
    },
    isSubmitting: false,
    error: null,
    fieldErrors: {},
    handleChange: jest.fn(),
    handleDateChange: jest.fn(),
    handleSubmit: jest.fn(),
    resetForm: jest.fn(),
    setFormDataFromProgress: jest.fn()
  })
}));

describe('ProgressForm', () => {
  const mockSubject: Subject = {
    id: 'subject-id-1',
    name: 'テスト科目',
    totalPages: 100,
    currentPage: 30,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockProgress: Progress = {
    id: 'progress-id-1',
    userId: 'user-id-1',
    subjectId: 'subject-id-1',
    startPage: 30,
    endPage: 40,
    pagesRead: 11,
    recordDate: '2023-01-01',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly in create mode', () => {
    render(
      <ProgressForm
        subject={mockSubject}
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('進捗記録')).toBeInTheDocument();
    expect(screen.getByText(`科目名: ${mockSubject.name}`)).toBeInTheDocument();
    expect(screen.getByText(`現在のページ: ${mockSubject.currentPage} / ${mockSubject.totalPages} ページ`)).toBeInTheDocument();
    expect(screen.getByText('記録する')).toBeInTheDocument();
  });

  it('renders correctly in edit mode', () => {
    render(
      <ProgressForm
        subject={mockSubject}
        progress={mockProgress}
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        isEditMode={true}
      />
    );

    expect(screen.getByText('進捗記録の編集')).toBeInTheDocument();
    expect(screen.getByText(`科目名: ${mockSubject.name}`)).toBeInTheDocument();
    expect(screen.getByText('更新する')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <ProgressForm
        subject={mockSubject}
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.click(screen.getByText('キャンセル'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders without subject info when subject is not provided', () => {
    render(
      <ProgressForm
        progress={mockProgress}
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        isEditMode={true}
      />
    );

    expect(screen.queryByText(/科目名:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/現在のページ:/)).not.toBeInTheDocument();
  });

  it('displays form fields correctly', () => {
    render(
      <ProgressForm
        subject={mockSubject}
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByLabelText('開始ページ')).toBeInTheDocument();
    expect(screen.getByLabelText('終了ページ')).toBeInTheDocument();
    expect(screen.getByLabelText('学習時間（分）')).toBeInTheDocument();
    expect(screen.getByLabelText('メモ')).toBeInTheDocument();
    expect(screen.getByText('読んだページ数: 11 ページ')).toBeInTheDocument();
  });
});