import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  Paper,
  CircularProgress,
  Alert,
  Stack,
  useTheme,
  alpha,
  Grid
} from '@mui/material';
import { AnalysisResult, AnalysisPeriod, AnalysisMetric, ChartDataPoint, AnalysisSummary, generateLearningAdvice, LearningAdvice } from '../domain/models/LearningAnalyticsModel';
import { useServices } from '../hooks/useServices';
import { useAuth } from '../contexts/AuthContext';
import { format, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Theme } from '@mui/material/styles';
import { getLearningAnalytics } from '../infrastructure/repositories/learningAnalyticsRepository';
import { LearningAnalyticsData, LearningMetric } from '../domain/models/LearningAnalyticsModel';
import { LEARNING_CONFIG } from '../config';

interface LearningAnalysisProps {
  subjectId?: string;
}

// カスタムツールチッププロパティの型定義
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name?: string;
  }>;
  label?: string;
}

/**
 * パフォーマンス最適化された学習進捗分析コンポーネント
 * 学習データの分析とアドバイスを提供します。
 */
const LearningAnalysis: React.FC<LearningAnalysisProps> = ({ subjectId }) => {
  const theme = useTheme<Theme>();
  const { learningAnalyticsRepository } = useServices();
  const { currentUser } = useAuth();
  
  const [period, setPeriod] = useState<string>('week');
  const [selectedMetric, setSelectedMetric] = useState<LearningMetric>('studyTime');
  const [analyticsData, setAnalyticsData] = useState<LearningAnalyticsData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 日付範囲の設定（デフォルトは過去3ヶ月）
  const [startDate] = useState<Date>(subMonths(new Date(), 3));
  const [endDate] = useState<Date>(new Date());
  
  // 学習アドバイスをメモ化
  const learningAdvice = useMemo(() => {
    if (analyticsData.length === 0) return '';

    const averageValue = analyticsData.reduce((sum, item) => sum + (item[selectedMetric] as number), 0) / analyticsData.length;
    
    // メトリックに基づいたアドバイスの生成
    switch (selectedMetric) {
      case 'studyTime':
        return averageValue < 30 
          ? '学習時間が少なめです。毎日少しずつでも時間を確保しましょう。' 
          : '素晴らしい学習時間です。継続して学習習慣を維持しましょう。';
      case 'completedTasks':
        return averageValue < 3 
          ? 'タスク完了数を増やすことで、学習効果が向上します。小さなタスクに分けて取り組みましょう。' 
          : '多くのタスクをこなしています。学習の質も意識してみましょう。';
      case 'frequency':
        return averageValue < 3 
          ? '学習頻度が低めです。短時間でも毎日継続することで効果が上がります。' 
          : '高い学習頻度を維持しています。素晴らしい習慣です。';
      case 'satisfaction':
        return averageValue < 2 
          ? '学習の満足度が低めです。より興味のある教材や方法を試してみましょう。' 
          : '学習に満足感を得られています。この調子で続けましょう。';
      default:
        return '定期的な学習を続けることが成功への鍵です。';
    }
  }, [analyticsData, selectedMetric]);
  
  // 期間変更ハンドラをメモ化
  const handlePeriodChange = useCallback((event: SelectChangeEvent) => {
    setPeriod(event.target.value);
  }, []);
  
  // メトリック変更ハンドラをメモ化
  const handleMetricChange = useCallback((event: SelectChangeEvent) => {
    setSelectedMetric(event.target.value as LearningMetric);
  }, []);
  
  // データ取得ロジックを副作用として実装
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getLearningAnalytics(currentUser.uid, period as 'day' | 'week' | 'month');
        if (isMounted) {
          setAnalyticsData(data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch learning analytics:', error);
        if (isMounted) {
          setError('データの取得中にエラーが発生しました。再度お試しください。');
          setLoading(false);
        }
      }
    };

    fetchData();
    
    // クリーンアップ関数でアンマウント時のステート更新を防止
    return () => {
      isMounted = false;
    };
  }, [currentUser, period]);
  
  // チャートの設定をメモ化
  const chartConfig = useMemo(() => {
    const metricLabels: Record<LearningMetric, string> = {
      studyTime: '学習時間 (分)',
      completedTasks: '完了タスク数',
      frequency: '学習頻度 (日/週)',
      satisfaction: '満足度 (1-3)'
    };
    
    const metricColors: Record<LearningMetric, string> = {
      studyTime: '#2196f3',
      completedTasks: '#4caf50',
      frequency: '#ff9800',
      satisfaction: '#f44336'
    };
    
    return {
      label: metricLabels[selectedMetric],
      color: metricColors[selectedMetric]
    };
  }, [selectedMetric]);
  
  // チャートの共通プロパティをメモ化
  const chartCommonProps = useMemo(() => ({
    margin: { top: 10, right: 30, left: 20, bottom: 40 },
  }), []);
  
  // カスタムツールチップコンポーネントをメモ化
  const CustomTooltip = React.memo(({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1, boxShadow: 2 }}>
          <Typography variant="body2" color="textPrimary">
            {`${label}: ${payload[0].value}`}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {chartConfig.label}
          </Typography>
        </Paper>
      );
    }
    return null;
  });
  
  // サマリーセクションをメモ化してレンダリング
  const renderSummary = useMemo(() => {
    if (loading || analyticsData.length === 0) {
      return <Typography>データ読み込み中...</Typography>;
    }
    
    const totalValue = analyticsData.reduce((sum, item) => sum + (item[selectedMetric] as number), 0);
    const averageValue = totalValue / analyticsData.length;
    
    return (
      <Box mt={2}>
        <Typography variant="h6" gutterBottom>学習サマリー</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">合計</Typography>
            <Typography variant="h6">{totalValue.toFixed(1)}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">平均</Typography>
            <Typography variant="h6">{averageValue.toFixed(1)}</Typography>
          </Grid>
        </Grid>
      </Box>
    );
  }, [analyticsData, loading, selectedMetric]);
  
  // アドバイスセクションをメモ化してレンダリング
  const renderAdvice = useMemo(() => {
    if (loading || analyticsData.length === 0) return null;
    
    return (
      <Box mt={3}>
        <Typography variant="h6" gutterBottom>学習アドバイス</Typography>
        <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
          <Typography variant="body1">{learningAdvice}</Typography>
        </Paper>
      </Box>
    );
  }, [analyticsData, loading, learningAdvice]);
  
  // チャートセクションをメモ化してレンダリング
  const renderChart = useMemo(() => {
    return (
      <Box mt={4} height={300}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={analyticsData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey={selectedMetric} 
              name={chartConfig.label}
              fill={chartConfig.color} 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  }, [analyticsData, selectedMetric, chartConfig, CustomTooltip]);
  
  // メインコンテンツのスタイルをメモ化
  const paperStyle = useMemo(() => ({
    p: 3,
    borderRadius: 2,
    border: `1px solid ${theme.palette.divider}`,
    bgcolor: theme.palette.background.paper,
  }), [theme.palette.divider, theme.palette.background.paper]);
  
  // フォームコントロールスタイルをメモ化
  const formControlStyle = useMemo(() => ({
    minWidth: 120
  }), []);

  return (
    <Paper
      elevation={0}
      sx={paperStyle}
    >
      <Typography variant="h5" gutterBottom>
        学習進捗分析
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <FormControl fullWidth size="small">
            <InputLabel>期間</InputLabel>
            <Select value={period} label="期間" onChange={handlePeriodChange}>
              <MenuItem value="day">日</MenuItem>
              <MenuItem value="week">週</MenuItem>
              <MenuItem value="month">月</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth size="small">
            <InputLabel>メトリック</InputLabel>
            <Select value={selectedMetric} label="メトリック" onChange={handleMetricChange}>
              <MenuItem value="studyTime">学習時間</MenuItem>
              <MenuItem value="completedTasks">完了タスク</MenuItem>
              <MenuItem value="frequency">頻度</MenuItem>
              <MenuItem value="satisfaction">満足度</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {renderChart}
          {renderSummary}
          {renderAdvice}
        </>
      )}
    </Paper>
  );
};

export default React.memo(LearningAnalysis); 