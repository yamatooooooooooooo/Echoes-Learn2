import { renderHook, act } from '@testing-library/react-hooks';
import { useProgressForm } from '../../features/subject/hooks/useProgressForm';
import { Subject } from '../../../domain/models/SubjectModel';
import React from 'react';

// Firebase Contextのモック
jest.mock('../../../contexts/FirebaseContext', () => ({
  useFirebase: () => ({ auth: { currentUser: { uid: 'test-user-id' } } })
}));

// useServicesのモック
jest.mock('../../../hooks/useServices', () => ({
  useServices: () => ({
    progressRepository: {
      addProgress: jest.fn().mockResolvedValue('progress-1')
    },
    subjectRepository: {
      updateSubject: jest.fn().mockResolvedValue(undefined)
    }
  })
}));

describe('useProgressForm', () => {
  const initialSubject: Subject = {
    id: 'subject-1',
    name: 'テスト科目',
    currentPage: 10,
    totalPages: 100,
    examDate: new Date()
  };

  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('初期状態が正しく設定される', () => {
    const { result } = renderHook(() => useProgressForm({
      subject: initialSubject,
      onSuccess: mockOnSuccess
    }));

    expect(result.current.formData).toEqual({
      subjectId: 'subject-1',
      startPage: 10, // 科目の現在のページから始まる
      endPage: 10,
      pagesRead: 0,
      recordDate: expect.any(String),
      studyDuration: 0,
      memo: ''
    });
    expect(result.current.fieldErrors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  test('フォーム入力が正しく更新される', () => {
    const { result } = renderHook(() => useProgressForm({
      subject: initialSubject,
      onSuccess: mockOnSuccess
    }));

    // endPageの更新
    act(() => {
      result.current.handleChange({
        target: { name: 'endPage', value: '20', type: 'number' }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.endPage).toBe(20);
    expect(result.current.formData.pagesRead).toBe(11); // 20 - 10 + 1 = 11

    // startPageの更新
    act(() => {
      result.current.handleChange({
        target: { name: 'startPage', value: '15', type: 'number' }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.startPage).toBe(15);
    expect(result.current.formData.pagesRead).toBe(6); // 20 - 15 + 1 = 6
  });

  test('日付入力が正しく更新される', () => {
    const { result } = renderHook(() => useProgressForm({
      subject: initialSubject,
      onSuccess: mockOnSuccess
    }));

    const newDate = new Date('2023-01-01');
    
    act(() => {
      result.current.handleDateChange(newDate);
    });

    expect(result.current.formData.recordDate).toBe('2023-01-01');
  });

  test('バリデーションが正しく動作する - 有効な入力', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProgressForm({
      subject: initialSubject,
      onSuccess: mockOnSuccess
    }));

    // 有効な入力を設定
    act(() => {
      result.current.handleChange({
        target: { name: 'endPage', value: '20', type: 'number' }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    // フォーム送信
    act(() => {
      result.current.handleSubmit({
        preventDefault: jest.fn()
      } as unknown as React.FormEvent);
    });

    await waitForNextUpdate();

    // エラーがないことを確認
    expect(result.current.error).toBe(null);
    
    // onSuccessが正しく呼ばれたことを確認
    expect(mockOnSuccess).toHaveBeenCalledWith('progress-1');
  });

  test('バリデーションが正しく動作する - 終了ページが開始ページより小さい', () => {
    const { result } = renderHook(() => useProgressForm({
      subject: initialSubject,
      onSuccess: mockOnSuccess
    }));

    // 無効な入力を設定（終了ページが開始ページより小さい）
    act(() => {
      result.current.handleChange({
        target: { name: 'endPage', value: '5', type: 'number' }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    // フォーム送信
    act(() => {
      result.current.handleSubmit({
        preventDefault: jest.fn()
      } as unknown as React.FormEvent);
    });

    // エラーが表示されることを確認
    expect(result.current.fieldErrors.endPage).toBeTruthy();
    
    // onSuccessが呼ばれないことを確認
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  test('送信中フラグが正しく設定される', () => {
    const { result } = renderHook(() => useProgressForm({
      subject: initialSubject,
      onSuccess: mockOnSuccess
    }));

    // 有効な入力を設定
    act(() => {
      result.current.handleChange({
        target: { name: 'endPage', value: '20', type: 'number' }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    // 送信中フラグは直接アクセスできないため、
    // 送信をシミュレートして状態を確認
    act(() => {
      result.current.handleSubmit({
        preventDefault: jest.fn()
      } as unknown as React.FormEvent);
    });

    expect(result.current.isSubmitting).toBe(true);
  });

  test('フォームリセットが正しく動作する', () => {
    const { result } = renderHook(() => useProgressForm({
      subject: initialSubject,
      onSuccess: mockOnSuccess
    }));

    // フォームを変更
    act(() => {
      result.current.handleChange({
        target: { name: 'endPage', value: '20', type: 'number' }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    // リセット
    act(() => {
      result.current.resetForm();
    });

    // 初期値に戻っていることを確認
    expect(result.current.formData).toEqual({
      subjectId: 'subject-1',
      startPage: 10,
      endPage: 10,
      pagesRead: 0,
      recordDate: expect.any(String),
      studyDuration: 0,
      memo: ''
    });
    expect(result.current.fieldErrors).toEqual({});
  });
}); 