import { useState, useEffect, useCallback, useMemo } from 'react';
import { Subject } from '../../../../domain/models/SubjectModel';
import {
  getRadarChartData,
  getCountdownData,
  RadarChartData,
  CountdownData,
} from '../../../../domain/services/visualizationService';
import { useAuth } from '../../../../contexts/AuthContext';
import { SubjectRepository } from '../../../../infrastructure/repositories/subjectRepository';
import { useFirebase } from '../../../../contexts/FirebaseContext';

/**
 * データ可視化コンポーネント用のデータを取得するカスタムフック
 */
export const useVisualizationData = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [radarChartData, setRadarChartData] = useState<RadarChartData[]>([]);
  const [countdownData, setCountdownData] = useState<CountdownData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { currentUser: user } = useAuth();
  const { firestore, auth } = useFirebase();

  // メモ化されたデータ処理関数
  const processData = useCallback((fetchedSubjects: Subject[]) => {
    const radarData = getRadarChartData(fetchedSubjects);
    const countdown = getCountdownData(fetchedSubjects);
    return { radarData, countdown };
  }, []);

  // データ取得関数
  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const subjectRepository = new SubjectRepository(firestore, auth);
      const fetchedSubjects = await subjectRepository.getAllSubjects(user.uid);
      setSubjects(fetchedSubjects);

      const { radarData, countdown } = processData(fetchedSubjects);
      setRadarChartData(radarData);
      setCountdownData(countdown);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('データ取得中にエラーが発生しました:', err);
      setError(err instanceof Error ? err : new Error('データ取得中に不明なエラーが発生しました'));
    } finally {
      setLoading(false);
    }
  }, [user, firestore, auth, processData]);

  // 初回マウント時とuser/firestore/authの変更時にデータを取得
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 定期的にデータを更新（5分ごと）
  useEffect(() => {
    const intervalId = setInterval(
      () => {
        fetchData();
      },
      5 * 60 * 1000
    ); // 5分ごとに更新

    return () => clearInterval(intervalId);
  }, [fetchData]);

  // メモ化されたデータを返す
  const data = useMemo(() => {
    return { subjects, radarChartData, countdownData };
  }, [subjects, radarChartData, countdownData]);

  return {
    loading,
    error,
    subjects,
    radarChartData,
    countdownData,
    lastUpdated,
    refreshData: fetchData, // 手動更新のための関数をエクスポート
    // 新しいインターフェース（DashboardScreenで使用）
    data,
    isLoading: loading,
    handleRefresh: fetchData,
  };
};
