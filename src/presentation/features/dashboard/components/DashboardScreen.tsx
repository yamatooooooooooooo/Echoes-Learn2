import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import SimpleDailyQuotaCard from './SimpleDailyQuotaCard';
import SimpleWeeklyQuotaCard from './SimpleWeeklyQuotaCard';
import SimpleProgressBarCard from './SimpleProgressBarCard';
import { Subject } from '../../../../domain/models/SubjectModel';

// モックデータ - 実際の環境では適切なデータソースから取得する
const MOCK_SUBJECTS: Subject[] = [
  {
    id: '1',
    name: '数学',
    currentPage: 120,
    totalPages: 300,
    examDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // 30日後
    textbookName: '微分積分学',
    bufferDays: 7,
    priority: 'high'
  },
  {
    id: '2',
    name: '物理',
    currentPage: 50,
    totalPages: 200,
    examDate: new Date(new Date().getTime() + 45 * 24 * 60 * 60 * 1000), // 45日後
    textbookName: '力学入門',
    bufferDays: 5,
    priority: 'medium'
  },
  {
    id: '3',
    name: '英語',
    currentPage: 80,
    totalPages: 150,
    examDate: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000), // 15日後
    textbookName: 'TOEIC対策',
    bufferDays: 3,
    priority: 'high'
  }
];

// モックデータ取得関数 - 実際の環境では適切なAPIやFirebaseからデータを取得する
const fetchSubjects = async (): Promise<Subject[]> => {
  // シンプルな実装のためモックデータを返す
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_SUBJECTS), 1000);
  });
};

/**
 * シンプルなダッシュボード画面
 */
const DashboardScreen: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // データ取得関数
  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchSubjects();
      setSubjects(data);
      setError(null);
    } catch (err) {
      console.error('データ取得エラー:', err);
      setError('データの取得に失敗しました。後でもう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };
  
  // コンポーネントマウント時にデータを取得
  useEffect(() => {
    loadData();
  }, []);
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%', maxWidth: '1000px', mx: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        学習ダッシュボード
      </Typography>
      
      <SimpleDailyQuotaCard subjects={subjects} />
      <SimpleWeeklyQuotaCard subjects={subjects} />
      <SimpleProgressBarCard subjects={subjects} />
    </Box>
  );
};

export default DashboardScreen; 