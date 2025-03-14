import { useState, useEffect, useCallback } from 'react';
import { DashboardData, ExamInfo, ReportInfo } from '../../../../domain/entities/Dashboard';
import { RadarChartData } from '../../../../domain/services/visualizationService';
import { addDays } from 'date-fns';

/**
 * ダッシュボードデータを提供するカスタムフック
 */
export const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // データ取得処理
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // サンプルの試験データを生成
      const sampleExams: ExamInfo[] = [
        {
          id: 'exam1',
          subject: '情報処理技術者試験',
          date: addDays(new Date(), 30),
          remainingDays: 30,
          priority: 'high',
        },
        {
          id: 'exam2',
          subject: '英語検定試験',
          date: addDays(new Date(), 45),
          remainingDays: 45,
          priority: 'medium',
        },
      ];

      // サンプルのレポートデータを生成
      const sampleReports: ReportInfo[] = [
        {
          id: 'report1',
          subject: 'プログラミング概論',
          date: addDays(new Date(), 7),
          remainingDays: 7,
          priority: 'high',
        },
        {
          id: 'report2',
          subject: 'データベース設計',
          date: addDays(new Date(), 14),
          remainingDays: 14,
          priority: 'medium',
        },
      ];

      // サンプルのレーダーチャートデータ
      const sampleRadarData: RadarChartData[] = [
        { subject: 'プログラミング', progress: 75 },
        { subject: 'データベース', progress: 60 },
        { subject: 'ネットワーク', progress: 45 },
        { subject: 'セキュリティ', progress: 80 },
        { subject: 'データ構造', progress: 55 },
      ];

      // TODO: 実際のAPIからデータを取得する処理を実装
      // 現在はダミーデータを返す
      const sampleData: DashboardData = {
        userId: 'user123',
        totalSubjects: 12,
        completedSubjects: 5,
        inProgressSubjects: 4,
        notStartedSubjects: 3,
        totalPages: 1250,
        completedPages: 780,
        weeklyProgressData: [
          { date: '2023-01-01', pagesRead: 30, timeSpent: 120 },
          { date: '2023-01-08', pagesRead: 45, timeSpent: 180 },
          { date: '2023-01-15', pagesRead: 25, timeSpent: 90 },
          { date: '2023-01-22', pagesRead: 60, timeSpent: 240 },
          { date: '2023-01-29', pagesRead: 35, timeSpent: 150 },
        ],
        subjects: [],
        recentProgress: [],
        studySessions: [],
        subjectPerformances: [],
        exams: sampleExams,
        reports: sampleReports,
        radarChartData: sampleRadarData,
      };

      // データを設定
      setDashboardData(sampleData);
    } catch (err) {
      console.error('ダッシュボードデータの取得中にエラーが発生しました', err);
      setError('データの読み込みに失敗しました。再度お試しください。');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // コンポーネントのマウント時にデータを取得
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // 日付をフォーマットする関数
  const formatDate = useCallback((date: Date | string | undefined): string => {
    if (!date) return '';

    const d = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  }, []);

  // データを再取得する関数
  const refreshData = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    dashboardData: dashboardData as DashboardData,
    isLoading,
    error,
    formatDate,
    refreshData,
  };
};
