import { useState, useEffect, useCallback } from 'react';
import { DashboardData } from '../../../../domain/entities/Dashboard';

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
      
      // TODO: 実際のAPIからデータを取得する処理を実装
      // 現在はダミーデータを返す
      const sampleData: DashboardData = {
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
          { date: '2023-01-29', pagesRead: 35, timeSpent: 150 }
        ],
        subjects: [],
        recentProgress: [],
        studySessions: [],
        subjectPerformances: []
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
      hour: '2-digit',
      minute: '2-digit'
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
    refreshData
  };
}; 