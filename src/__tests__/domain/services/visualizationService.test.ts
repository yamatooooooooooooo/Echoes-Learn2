import { getRadarChartData, getCountdownData } from '../../../domain/services/visualizationService';
import { Subject } from '../../../domain/models/SubjectModel';
import { addDays } from 'date-fns';

describe('visualizationService', () => {
  // テスト用のモックデータ
  const mockSubjects: Subject[] = [
    {
      id: '1',
      name: '数学',
      currentPage: 50,
      totalPages: 100,
      examDate: addDays(new Date(), 10),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: '英語',
      currentPage: 75,
      totalPages: 150,
      examDate: addDays(new Date(), 5),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      name: '物理',
      currentPage: 0,
      totalPages: 200,
      examDate: addDays(new Date(), 20),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  describe('getRadarChartData', () => {
    it('科目データから正しいレーダーチャートデータを生成する', () => {
      const result = getRadarChartData(mockSubjects);
      
      expect(result).toHaveLength(3);
      expect(result[0].subject).toBe('数学');
      expect(result[0].progress).toBe(50); // 50/100 = 50%
      expect(result[1].subject).toBe('英語');
      expect(result[1].progress).toBe(50); // 75/150 = 50%
      expect(result[2].subject).toBe('物理');
      expect(result[2].progress).toBe(0); // 0/200 = 0%
    });

    it('空の配列が渡された場合は空の配列を返す', () => {
      const result = getRadarChartData([]);
      expect(result).toEqual([]);
    });

    it('totalPagesが0または未定義の場合は進捗率を0として扱う', () => {
      const invalidSubjects: Subject[] = [
        {
          id: '4',
          name: 'テスト科目1',
          currentPage: 10,
          totalPages: 0, // 0ページ
          examDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '5',
          name: 'テスト科目2',
          currentPage: 10,
          totalPages: undefined as any, // 未定義
          examDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      const result = getRadarChartData(invalidSubjects);
      
      expect(result).toHaveLength(2);
      expect(result[0].progress).toBe(0);
      expect(result[1].progress).toBe(0);
    });
  });

  describe('getCountdownData', () => {
    it('科目データから正しいカウントダウンデータを生成する', () => {
      const result = getCountdownData(mockSubjects);
      
      expect(result).toHaveLength(3);
      
      // 数学のテスト
      expect(result[0].subject).toBe('数学');
      expect(result[0].remainingDays).toBe(10);
      expect(result[0].progressData).toHaveLength(2);
      expect(result[0].progressData[0].name).toBe('完了');
      expect(result[0].progressData[0].value).toBe(50);
      expect(result[0].progressData[1].name).toBe('未完了');
      expect(result[0].progressData[1].value).toBe(50);
      
      // 英語のテスト
      expect(result[1].subject).toBe('英語');
      expect(result[1].remainingDays).toBe(5);
      
      // 物理のテスト
      expect(result[2].subject).toBe('物理');
      expect(result[2].remainingDays).toBe(20);
      expect(result[2].progressData[0].value).toBe(0);
      expect(result[2].progressData[1].value).toBe(100);
    });

    it('空の配列が渡された場合は空の配列を返す', () => {
      const result = getCountdownData([]);
      expect(result).toEqual([]);
    });

    it('過去の試験日の場合は残り日数を0として扱う', () => {
      const pastExamSubject: Subject[] = [
        {
          id: '6',
          name: '過去の試験',
          currentPage: 100,
          totalPages: 100,
          examDate: addDays(new Date(), -5), // 5日前
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      const result = getCountdownData(pastExamSubject);
      
      expect(result).toHaveLength(1);
      expect(result[0].remainingDays).toBe(0);
    });
  });
}); 