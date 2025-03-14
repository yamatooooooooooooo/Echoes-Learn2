import { ProgressService } from '../ProgressService';
import { IProgressRepository } from '../../interfaces/repositories/IProgressRepository';
import { ISubjectRepository } from '../../interfaces/repositories/ISubjectRepository';
import { Subject } from '../../models/SubjectModel';
import { Progress, ProgressCreateInput } from '../../models/ProgressModel';
import { ProgressError } from '../../errors/ProgressError';

// モックリポジトリの作成
const mockProgressRepository = {
  addProgress: jest.fn(),
  getProgress: jest.fn(),
  getAllProgress: jest.fn(),
  getSubjectProgress: jest.fn(),
  updateProgress: jest.fn(),
  deleteProgress: jest.fn(),
} as jest.Mocked<IProgressRepository>;

const mockSubjectRepository = {
  getAllSubjects: jest.fn(),
  getSubject: jest.fn(),
  addSubject: jest.fn(),
  updateSubject: jest.fn(),
  deleteSubject: jest.fn(),
} as jest.Mocked<ISubjectRepository>;

describe('ProgressService', () => {
  let progressService: ProgressService;

  beforeEach(() => {
    // モックをリセット
    jest.clearAllMocks();
    // テスト対象のサービスを作成
    progressService = new ProgressService(mockProgressRepository, mockSubjectRepository);
  });

  describe('recordProgress', () => {
    const userId = 'test-user-id';
    const mockSubject: Subject = {
      id: 'subject-1',
      name: 'テスト科目',
      currentPage: 10,
      totalPages: 100,
      examDate: new Date(),
    };

    test('有効な進捗を記録する', async () => {
      // モックの戻り値を設定
      mockSubjectRepository.getSubject.mockResolvedValue(mockSubject);
      mockProgressRepository.addProgress.mockResolvedValue('progress-1');

      const progressData: ProgressCreateInput = {
        subjectId: 'subject-1',
        startPage: 11,
        endPage: 20,
        pagesRead: 10,
        recordDate: new Date(),
      };

      const result = await progressService.recordProgress(userId, progressData);

      // 結果の検証
      expect(result).toBe('progress-1');
      expect(mockSubjectRepository.getSubject).toHaveBeenCalledWith('subject-1');
      expect(mockProgressRepository.addProgress).toHaveBeenCalledWith(userId, progressData);
      expect(mockSubjectRepository.updateSubject).toHaveBeenCalledWith(
        'subject-1',
        expect.objectContaining({
          currentPage: 20,
        })
      );
    });

    test('科目が存在しない場合はエラーをスローする', async () => {
      // 科目が見つからないケース
      mockSubjectRepository.getSubject.mockResolvedValue(null);

      const progressData: ProgressCreateInput = {
        subjectId: 'non-existent-subject',
        startPage: 1,
        endPage: 10,
        pagesRead: 10,
        recordDate: new Date(),
      };

      // メソッド実行時にエラーが発生することを確認
      await expect(progressService.recordProgress(userId, progressData)).rejects.toThrow(
        ProgressError
      );

      // モックが適切に呼ばれていることを確認
      expect(mockSubjectRepository.getSubject).toHaveBeenCalledWith('non-existent-subject');
      expect(mockProgressRepository.addProgress).not.toHaveBeenCalled();
      expect(mockSubjectRepository.updateSubject).not.toHaveBeenCalled();
    });

    test('終了ページが総ページ数を超える場合はエラーをスローする', async () => {
      mockSubjectRepository.getSubject.mockResolvedValue(mockSubject);

      const progressData: ProgressCreateInput = {
        subjectId: 'subject-1',
        startPage: 90,
        endPage: 110, // 総ページ数(100)を超えている
        pagesRead: 21,
        recordDate: new Date(),
      };

      await expect(progressService.recordProgress(userId, progressData)).rejects.toThrow(
        ProgressError
      );

      expect(mockSubjectRepository.getSubject).toHaveBeenCalledWith('subject-1');
      expect(mockProgressRepository.addProgress).not.toHaveBeenCalled();
      expect(mockSubjectRepository.updateSubject).not.toHaveBeenCalled();
    });

    test('開始ページが終了ページより大きい場合はエラーをスローする', async () => {
      const progressData: ProgressCreateInput = {
        subjectId: 'subject-1',
        startPage: 20,
        endPage: 10, // 開始ページより小さい
        pagesRead: 0,
        recordDate: new Date(),
      };

      await expect(progressService.recordProgress(userId, progressData)).rejects.toThrow(
        ProgressError
      );

      expect(mockSubjectRepository.getSubject).not.toHaveBeenCalled();
      expect(mockProgressRepository.addProgress).not.toHaveBeenCalled();
      expect(mockSubjectRepository.updateSubject).not.toHaveBeenCalled();
    });
  });

  describe('getSubjectProgress', () => {
    test('特定の科目の進捗記録を取得する', async () => {
      const userId = 'test-user-id';
      const subjectId = 'subject-1';
      const mockProgressList: Progress[] = [
        {
          id: 'progress-1',
          userId,
          subjectId,
          startPage: 1,
          endPage: 10,
          pagesRead: 10,
          recordDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'progress-2',
          userId,
          subjectId,
          startPage: 11,
          endPage: 20,
          pagesRead: 10,
          recordDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockProgressRepository.getSubjectProgress.mockResolvedValue(mockProgressList);

      const result = await progressService.getSubjectProgress(userId, subjectId);

      expect(result).toEqual(mockProgressList);
      expect(mockProgressRepository.getSubjectProgress).toHaveBeenCalledWith(userId, subjectId);
    });

    test('エラーが発生した場合はProgressErrorをスローする', async () => {
      const userId = 'test-user-id';
      const subjectId = 'subject-1';

      mockProgressRepository.getSubjectProgress.mockRejectedValue(new Error('DB error'));

      await expect(progressService.getSubjectProgress(userId, subjectId)).rejects.toThrow(
        ProgressError
      );

      expect(mockProgressRepository.getSubjectProgress).toHaveBeenCalledWith(userId, subjectId);
    });
  });
});
