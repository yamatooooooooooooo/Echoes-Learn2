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
  TooltipProps,
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
  Grid,
} from '@mui/material';
import {
  AnalysisResult,
  AnalysisPeriod,
  AnalysisMetric,
  ChartDataPoint,
  AnalysisSummary,
} from '../domain/models/LearningAnalyticsModel';
import { useServices } from '../contexts/ServicesContext';
import { useAuth } from '../contexts/AuthContext';
import { format, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Theme } from '@mui/material/styles';

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
const LearningAnalysis = React.memo<LearningAnalysisProps>(({ subjectId }) => {
  const theme = useTheme<Theme>();
  const { learningAnalyticsRepository } = useServices();
  const { currentUser } = useAuth();

  const [period, setPeriod] = useState<AnalysisPeriod>('weekly');
  const [selectedMetric, setSelectedMetric] = useState<AnalysisMetric>('studyTime');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // メトリックの単位を取得する関数
  const getMetricUnit = useCallback((metric: AnalysisMetric): string => {
    switch (metric) {
      case 'studyTime':
        return '分';
      case 'pagesRead':
        return 'ページ';
      case 'frequency':
        return '%';
      case 'satisfaction':
        return '/ 3';
      default:
        return '';
    }
  }, []);

  // 学習アドバイスをメモ化
  const learningAdvice = useMemo(() => {
    if (!analysisResult || !analysisResult.chartData || analysisResult.chartData.length === 0) {
      return 'データがありません。学習を記録して分析を活用しましょう。';
    }

    const summary = analysisResult.summary;

    // メトリックに基づいたアドバイスの生成
    switch (selectedMetric) {
      case 'studyTime':
        return summary.averageStudyTime < 30
          ? '学習時間が少なめです。毎日少しずつでも時間を確保しましょう。'
          : '素晴らしい学習時間です。継続して学習習慣を維持しましょう。';
      case 'pagesRead':
        return summary.averagePagesPerDay < 5
          ? 'ページ数を増やすことで、学習効果が向上します。小さな目標から始めましょう。'
          : '多くのページを読んでいます。理解度もしっかり確認しましょう。';
      case 'frequency':
        return summary.studyFrequency < 0.5
          ? '学習頻度が低めです。短時間でも毎日継続することで効果が上がります。'
          : '高い学習頻度を維持しています。素晴らしい習慣です。';
      case 'satisfaction':
        return summary.averageSatisfaction < 2
          ? '学習の満足度が低めです。より興味のある教材や方法を試してみましょう。'
          : '学習に満足感を得られています。この調子で続けましょう。';
      default:
        return '定期的な学習を続けることが成功への鍵です。';
    }
  }, [analysisResult, selectedMetric]);

  // 期間変更ハンドラをメモ化
  const handlePeriodChange = useCallback((event: SelectChangeEvent) => {
    setPeriod(event.target.value as AnalysisPeriod);
  }, []);

  // メトリック変更ハンドラをメモ化
  const handleMetricChange = useCallback((event: SelectChangeEvent) => {
    setSelectedMetric(event.target.value as AnalysisMetric);
  }, []);

  // データ取得ロジックを副作用として実装
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!currentUser) return;

      setLoading(true);
      setError(null);

      try {
        // リポジトリから学習分析データを取得
        const result = await learningAnalyticsRepository.getLearningAnalytics(
          currentUser.uid,
          period,
          selectedMetric,
          subjectId
        );

        if (isMounted) {
          setAnalysisResult(result);
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
  }, [currentUser, period, selectedMetric, subjectId, learningAnalyticsRepository]);

  // チャートの設定をメモ化
  const chartConfig = useMemo(() => {
    const metricLabels: Record<AnalysisMetric, string> = {
      studyTime: '学習時間 (分)',
      pagesRead: 'ページ数',
      frequency: '学習頻度',
      satisfaction: '満足度',
    };

    const metricColors: Record<AnalysisMetric, string> = {
      studyTime: '#2196f3',
      pagesRead: '#4caf50',
      frequency: '#ff9800',
      satisfaction: '#f44336',
    };

    return {
      label: metricLabels[selectedMetric],
      color: metricColors[selectedMetric],
    };
  }, [selectedMetric]);

  // チャートの共通プロパティをメモ化
  const chartCommonProps = useMemo(
    () => ({
      margin: { top: 10, right: 30, left: 20, bottom: 40 },
    }),
    []
  );

  // カスタムツールチップコンポーネントをメモ化
  const CustomTooltip = React.memo(({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1, boxShadow: 2 }}>
          <Typography variant="body2" color="textPrimary">
            {label}
          </Typography>
          <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>
            {payload[0].value} {getMetricUnit(selectedMetric)}
          </Typography>
        </Paper>
      );
    }
    return null;
  });

  // displayNameを設定
  CustomTooltip.displayName = 'CustomTooltip';

  // サマリーセクションをメモ化してレンダリング
  const renderSummary = useMemo(() => {
    if (loading || !analysisResult) {
      return <Typography>データ読み込み中...</Typography>;
    }

    const summary = analysisResult.summary;

    return (
      <Box mt={2}>
        <Typography variant="h6" gutterBottom>
          学習サマリー
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              合計学習時間
            </Typography>
            <Typography variant="h6">{summary.totalStudyTime.toFixed(1)}分</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              平均学習時間
            </Typography>
            <Typography variant="h6">{summary.averageStudyTime.toFixed(1)}分/日</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              総ページ数
            </Typography>
            <Typography variant="h6">{summary.totalPages}ページ</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              最長連続学習
            </Typography>
            <Typography variant="h6">{summary.longestStreak}日</Typography>
          </Grid>
        </Grid>
      </Box>
    );
  }, [analysisResult, loading]);

  // アドバイスセクションをメモ化してレンダリング
  const renderAdvice = useMemo(() => {
    if (loading || !analysisResult) return null;

    return (
      <Box mt={3}>
        <Typography variant="h6" gutterBottom>
          学習アドバイス
        </Typography>
        <Paper elevation={0} sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
          <Typography variant="body1">{learningAdvice}</Typography>
        </Paper>
      </Box>
    );
  }, [analysisResult, loading, learningAdvice, theme]);

  // チャートセクションをメモ化してレンダリング
  const renderChart = useMemo(() => {
    if (loading || !analysisResult || !analysisResult.chartData) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <CircularProgress />
        </Box>
      );
    }

    if (analysisResult.chartData.length === 0) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <Alert severity="info">表示するデータがありません</Alert>
        </Box>
      );
    }

    return (
      <Box mt={4} height={300}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={analysisResult.chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey={selectedMetric}
              name={chartConfig.label}
              fill={chartConfig.color}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  }, [analysisResult, loading, selectedMetric, chartConfig]);

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h5" gutterBottom>
        学習進捗分析
        {subjectId && ' (特定科目)'}
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>期間</InputLabel>
          <Select value={period} label="期間" onChange={handlePeriodChange}>
            <MenuItem value="daily">日次</MenuItem>
            <MenuItem value="weekly">週次</MenuItem>
            <MenuItem value="monthly">月次</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>指標</InputLabel>
          <Select value={selectedMetric} label="指標" onChange={handleMetricChange}>
            <MenuItem value="studyTime">学習時間</MenuItem>
            <MenuItem value="pagesRead">ページ数</MenuItem>
            <MenuItem value="frequency">頻度</MenuItem>
            <MenuItem value="satisfaction">満足度</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {renderChart}
      {renderSummary}
      {renderAdvice}
    </Paper>
  );
});

// コンポーネントのdisplayNameを設定
LearningAnalysis.displayName = 'LearningAnalysis';

export default LearningAnalysis;
