import { renderHook, act } from '@testing-library/react-hooks';
import { useSubjectProgress } from '../useSubjectProgress';
import { Subject } from '../../../../../domain/models/SubjectModel';
import { Progress } from '../../../../../domain/models/ProgressModel';
import { useServices } from '../../../../../hooks/useServices';
import { useFirebase } from '../../../../../contexts/FirebaseContext';

// モック
jest.mock('../../../../../hooks/useServices', () => ({
  useServices: () => ({
    progressRepository: {
      addProgress: jest.fn().mockResolvedValue('progress-id-1'),
      updateProgress: jest.fn().mockResolvedValue(undefined),
      deleteProgress: jest.fn().mockResolvedValue(undefined),
    },
    subjectRepository: {
      updateSubject: jest.fn().mockResolvedValue(undefined),
    },
  }),
}));

jest.mock('../../../../../contexts/FirebaseContext', () => ({
  useFirebase: () => ({
    auth: {
      currentUser: { uid: 'user-id-1' },
    },
  }),
}));

describe('useSubjectProgress', () => {
  const mockSubject: Subject = {
    id: 'subject-id-1',
    name: 'テスト科目',
    totalPages: 100,
    currentPage: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
    examDate: new Date(),
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
    updatedAt: new Date(),
  };

  const mockOnProgressAdded = jest.fn();
  const mockOnSubjectUpdated = jest.fn();
  const mockOnProgressUpdated = jest.fn();
  const mockOnProgressDeleted = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSubjectProgress(mockSubject));

    expect(result.current.isAdding).toBe(false);
    expect(result.current.isEditing).toBe(false);
    expect(result.current.isDeleteDialogOpen).toBe(false);
    expect(result.current.progressToDelete).toBeNull();
  });

  it('should toggle progress form', () => {
    const { result } = renderHook(() => useSubjectProgress(mockSubject));

    act(() => {
      result.current.toggleProgressForm();
    });

    expect(result.current.isAdding).toBe(true);

    act(() => {
      result.current.toggleProgressForm();
    });

    expect(result.current.isAdding).toBe(false);
  });

  it('should start editing progress', () => {
    const { result } = renderHook(() => useSubjectProgress(mockSubject));

    act(() => {
      result.current.startEditing(mockProgress);
    });

    expect(result.current.isEditing).toBe(true);
    expect(result.current.isAdding).toBe(true);
    expect(result.current.progressForm.startPage).toBe(mockProgress.startPage);
    expect(result.current.progressForm.endPage).toBe(mockProgress.endPage);
    expect(result.current.progressForm.pagesRead).toBe(mockProgress.pagesRead);
  });

  it('should open and close delete dialog', () => {
    const { result } = renderHook(() => useSubjectProgress(mockSubject));

    act(() => {
      result.current.openDeleteDialog('progress-id-1');
    });

    expect(result.current.isDeleteDialogOpen).toBe(true);
    expect(result.current.progressToDelete).toBe('progress-id-1');

    act(() => {
      result.current.closeDeleteDialog();
    });

    expect(result.current.isDeleteDialogOpen).toBe(false);
    expect(result.current.progressToDelete).toBeNull();
  });

  it('should handle progress change', () => {
    const { result } = renderHook(() => useSubjectProgress(mockSubject));

    act(() => {
      result.current.handleProgressChange({
        target: { name: 'startPage', value: '20' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.progressForm.startPage).toBe('20');

    act(() => {
      result.current.handleProgressChange({
        target: { name: 'endPage', value: '30' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.progressForm.endPage).toBe('30');
    expect(result.current.progressForm.pagesRead).toBe(11); // 30 - 20 + 1
  });

  it('should save progress (new record)', async () => {
    const { result } = renderHook(() =>
      useSubjectProgress(mockSubject, mockOnProgressAdded, mockOnSubjectUpdated)
    );

    // フォームデータを設定
    act(() => {
      result.current.handleProgressChange({
        target: { name: 'startPage', value: '30' },
      } as React.ChangeEvent<HTMLInputElement>);

      result.current.handleProgressChange({
        target: { name: 'endPage', value: '40' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    await act(async () => {
      await result.current.handleSaveProgress();
    });

    expect(mockOnProgressAdded).toHaveBeenCalled();
    expect(mockOnSubjectUpdated).toHaveBeenCalledWith(
      expect.objectContaining({
        currentPage: 40,
      })
    );
  });

  it('should delete progress', async () => {
    const { result } = renderHook(() =>
      useSubjectProgress(
        mockSubject,
        mockOnProgressAdded,
        mockOnSubjectUpdated,
        mockOnProgressUpdated,
        mockOnProgressDeleted
      )
    );

    act(() => {
      result.current.openDeleteDialog('progress-id-1');
    });

    await act(async () => {
      await result.current.deleteProgress();
    });

    expect(mockOnProgressDeleted).toHaveBeenCalled();
    expect(result.current.isDeleteDialogOpen).toBe(false);
  });

  it('進捗レコードを取得する', async () => {
    // レポジトリのモック
    const mockProgressRepository = {
      getSubjectProgress: jest.fn().mockResolvedValue([
        { id: 'progress1', subjectId: 'subject1', userId: 'user1' },
        { id: 'progress2', subjectId: 'subject1', userId: 'user1' },
      ]),
      addProgress: jest.fn(),
      updateProgress: jest.fn(),
      deleteProgress: jest.fn(),
    };

    const mockSubjectRepository = {
      /* モックの実装 */
    };

    // useServicesのモック
    (useServices as jest.Mock).mockReturnValue({
      progressRepository: mockProgressRepository,
      subjectRepository: mockSubjectRepository,
    });

    // useFirebaseのモック
    (useFirebase as jest.Mock).mockReturnValue({
      auth: { currentUser: { uid: 'user1' } },
    });

    const mockSubject = {
      id: 'subject1',
      name: 'テスト科目',
      currentPage: 0,
      totalPages: 100,
      examDate: new Date(),
    } as Subject;

    const { result, waitForNextUpdate } = renderHook(() => useSubjectProgress(mockSubject));

    // 初期状態では空の配列
    expect(result.current.progressRecords).toEqual([]);
    expect(result.current.loadingProgressRecords).toBe(true);

    // 非同期処理の完了を待つ
    await waitForNextUpdate();

    // データが取得されていることを確認
    expect(mockProgressRepository.getSubjectProgress).toHaveBeenCalledWith('user1', 'subject1');
    expect(result.current.progressRecords).toHaveLength(2);
    expect(result.current.loadingProgressRecords).toBe(false);
  });
});
