import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProgressDeleteDialog } from '../ProgressDeleteDialog';

describe('ProgressDeleteDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(
      <ProgressDeleteDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isDeleting={false}
      />
    );

    expect(screen.getByText('進捗記録の削除')).toBeInTheDocument();
    expect(screen.getByText(/この進捗記録を削除してもよろしいですか？/)).toBeInTheDocument();
    expect(screen.getByText('キャンセル')).toBeInTheDocument();
    expect(screen.getByText('削除する')).toBeInTheDocument();
  });

  it('does not render when not open', () => {
    render(
      <ProgressDeleteDialog
        open={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isDeleting={false}
      />
    );

    expect(screen.queryByText('進捗記録の削除')).not.toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <ProgressDeleteDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isDeleting={false}
      />
    );

    fireEvent.click(screen.getByText('キャンセル'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when delete button is clicked', () => {
    render(
      <ProgressDeleteDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isDeleting={false}
      />
    );

    fireEvent.click(screen.getByText('削除する'));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when isDeleting is true', () => {
    render(
      <ProgressDeleteDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isDeleting={true}
      />
    );

    expect(screen.getByText('キャンセル')).toBeDisabled();
    expect(screen.getByText('削除する')).toBeDisabled();
  });
});