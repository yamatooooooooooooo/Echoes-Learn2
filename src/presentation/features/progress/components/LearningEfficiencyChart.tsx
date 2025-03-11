import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Slider,
  FormControlLabel,
  Switch
} from '@mui/material';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Subject } from '../../../../domain/models/SubjectModel';
import { Progress } from '../../../../domain/models/ProgressModel';
import { StudySession, SubjectPerformance } from '../../../../domain/models/StudyAnalyticsModel';

interface LearningEfficiencyChartProps {
  progressData: Progress[];
  studySessions: StudySession[];
  subjectPerformances: SubjectPerformance[];
  subjects: Subject[];
}

/**
 * 学習効率チャートコンポーネント
 */
export const LearningEfficiencyChart: React.FC<LearningEfficiencyChartProps> = ({ 
  progressData, 
  studySessions, 
  subjectPerformances,
  subjects
}) => {
  const theme = useTheme();
  const [timeRangeInDays, setTimeRangeInDays] = useState<number>(30);
  const [selectedMetric, setSelectedMetric] = useState<'pages' | 'minutes' | 'efficiency'>('efficiency');
  const [showTrendline, setShowTrendline] = useState<boolean>(true);
  
  // 時間範囲の変更ハンドラー
  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRangeInDays(Number(event.target.value));
  };
  
  // メトリック選択の変更ハンドラー
  const handleMetricChange = (event: SelectChangeEvent) => {
    setSelectedMetric(event.target.value as 'pages' | 'minutes' | 'efficiency');
  };
  
  // トレンドライン表示の切り替えハンドラー
  const handleTrendlineToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowTrendline(event.target.checked);
  };

  // フィルタリングされたセッションデータ
  const filteredSessions = useMemo(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeRangeInDays);
    cutoffDate.setHours(0, 0, 0, 0);
    
    return studySessions
      .filter(s => {
        const sessionDate = new Date(s.date);
        return sessionDate >= cutoffDate;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [studySessions, timeRangeInDays]);
  
  // セッションデータを日付ごとにグループ化
  const dailySessionData = useMemo(() => {
    const dailyData: { [key: string]: { date: string, pages: number, minutes: number, efficiency: number, sessions: number } } = {};
    
    filteredSessions.forEach(session => {
      const date = session.date;
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          pages: 0,
          minutes: 0,
          efficiency: 0,
          sessions: 0
        };
      }
      
      dailyData[date].pages += session.pagesCompleted || 0;
      dailyData[date].minutes += session.duration || 0;
      dailyData[date].sessions += 1;
    });
    
    // 効率の計算 (ページ数 * 5分 / 実際に掛かった時間)
    Object.keys(dailyData).forEach(date => {
      const data = dailyData[date];
      
      if (data.minutes > 0) {
        data.efficiency = Math.round((data.pages * 5) / data.minutes * 100);
      }
    });
    
    // 日付でソートされた配列に変換
    return Object.values(dailyData).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [filteredSessions]);

  // 科目パフォーマンスデータの準備
  const performanceData = useMemo(() => {
    const subjectMap = new Map<string, string>();
    subjects.forEach(s => {
      subjectMap.set(s.id, s.name);
    });
    
    return subjectPerformances.map(perf => ({
      name: subjectMap.get(perf.subjectId) || perf.name,
      subjectId: perf.subjectId,
      efficiency: perf.efficiency,
      progress: perf.progress,
      recommendedStudyTime: perf.recommendedStudyTime,
      lastStudied: perf.lastStudied,
      strengths: perf.strengths,
      weaknesses: perf.weaknesses
    }));
  }, [subjectPerformances, subjects]);
  
  // 日次学習効率チャート
  const renderEfficiencyTrendChart = () => {
    if (dailySessionData.length < 2) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            十分なデータがありません。学習セッションを記録して再度確認してください。
          </Typography>
        </Box>
      );
    }
    
    // 移動平均の計算（トレンドライン）
    const movingAverageData = [];
    const windowSize = Math.min(7, Math.floor(dailySessionData.length / 2)); // 7日または半分の日数
    
    if (windowSize > 1 && showTrendline) {
      for (let i = 0; i < dailySessionData.length; i++) {
        const startIdx = Math.max(0, i - Math.floor(windowSize / 2));
        const endIdx = Math.min(dailySessionData.length - 1, i + Math.floor(windowSize / 2));
        
        let sum = 0;
        let count = 0;
        
        for (let j = startIdx; j <= endIdx; j++) {
          const value = dailySessionData[j][selectedMetric];
          if (value != null && !isNaN(value)) {
            sum += value;
            count++;
          }
        }
        
        const average = count > 0 ? sum / count : null;
        
        movingAverageData.push({
          date: dailySessionData[i].date,
          value: average
        });
      }
    }
    
    // Y軸ラベルとチャートタイトルの設定
    let yAxisLabel: string, chartTitle: string;
    switch (selectedMetric) {
      case 'pages':
        yAxisLabel = 'ページ数';
        chartTitle = '日別学習ページ数の推移';
        break;
      case 'minutes':
        yAxisLabel = '学習時間 (分)';
        chartTitle = '日別学習時間の推移';
        break;
      case 'efficiency':
        yAxisLabel = '効率スコア';
        chartTitle = '日別学習効率の推移';
        break;
    }
    
    // 日付フォーマット
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    };
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {chartTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            時間経過に伴う学習パフォーマンスの変化を確認できます。持続的な改善の指標として活用してください。
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer>
              <LineChart data={dailySessionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} 
                />
                <Tooltip 
                  formatter={(value) => [value, yAxisLabel]}
                  labelFormatter={(label) => `日付: ${new Date(label).toLocaleDateString('ja-JP')}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  name={yAxisLabel} 
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                {showTrendline && movingAverageData.length > 0 && (
                  <Line
                    type="monotone"
                    dataKey="value"
                    data={movingAverageData}
                    name={`${yAxisLabel}（トレンド）`}
                    stroke={theme.palette.secondary.main}
                    strokeWidth={2}
                    dot={false}
                    activeDot={false}
                    strokeDasharray="5 5"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              分析結果
            </Typography>
            <Typography variant="body2">
              {determineEfficiencyTrendInsight()}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    );
  };
  
  // 科目別パフォーマンスレーダーチャート
  const renderSubjectPerformanceChart = () => {
    if (performanceData.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            科目パフォーマンスデータがありません。学習を進めて再度確認してください。
          </Typography>
        </Box>
      );
    }
    
    // レーダーチャート用のデータ準備
    const radarChartData = performanceData.map(perf => {
      // 最後の学習日からの経過日数（新鮮度）の計算
      const lastStudiedDate = new Date(perf.lastStudied);
      const today = new Date();
      const daysSinceLastStudy = Math.round((today.getTime() - lastStudiedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // 新鮮度スコア（最近学習したほど高い、最大30日）
      const freshnessScore = Math.max(0, 100 - Math.min(daysSinceLastStudy, 30) * 3);
      
      return {
        subject: perf.name,
        efficiency: perf.efficiency || 0,
        progress: perf.progress || 0,
        freshness: freshnessScore,
        balance: 100 - Math.abs(50 - perf.progress) // 進捗が50%に近いほど高いスコア
      };
    });
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            科目別パフォーマンス分析
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            各科目の学習効率、進捗、バランス、新鮮度（最後の学習からの経過）を多角的に評価します。
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer>
              <RadarChart outerRadius={150} data={radarChartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="効率"
                  dataKey="efficiency"
                  stroke={theme.palette.primary.main}
                  fill={theme.palette.primary.main}
                  fillOpacity={0.6}
                />
                <Radar
                  name="進捗"
                  dataKey="progress"
                  stroke={theme.palette.secondary.main}
                  fill={theme.palette.secondary.main}
                  fillOpacity={0.6}
                />
                <Radar
                  name="新鮮度"
                  dataKey="freshness"
                  stroke="#4caf50"
                  fill="#4caf50"
                  fillOpacity={0.6}
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer>
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid />
                <XAxis type="number" dataKey="progress" name="進捗率" unit="%" />
                <YAxis type="number" dataKey="efficiency" name="効率スコア" unit="" />
                <ZAxis type="number" dataKey="freshness" range={[100, 500]} name="新鮮度" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter
                  name="科目パフォーマンス"
                  data={radarChartData}
                  fill={theme.palette.primary.main}
                  shape="circle"
                  legendType="circle"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              分析結果
            </Typography>
            <Typography variant="body2">
              {determineSubjectPerformanceInsight()}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    );
  };
  
  // 効率トレンドの分析結果テキストを生成
  const determineEfficiencyTrendInsight = (): string => {
    if (dailySessionData.length < 2) {
      return '十分なデータがありません。しばらく学習を記録してから再度確認してください。';
    }
    
    const metricData = dailySessionData.map(d => d[selectedMetric]);
    
    // 平均値の計算
    const average = metricData.reduce((sum, val) => sum + val, 0) / metricData.length;
    
    // 最初と最後のデータポイントを比較してトレンドを判断
    const firstWeekAvg = metricData.slice(0, Math.min(7, Math.floor(metricData.length / 3)))
      .reduce((sum, val) => sum + val, 0) / Math.min(7, Math.floor(metricData.length / 3));
    
    const lastWeekAvg = metricData.slice(-Math.min(7, Math.floor(metricData.length / 3)))
      .reduce((sum, val) => sum + val, 0) / Math.min(7, Math.floor(metricData.length / 3));
    
    const changePercent = Math.round((lastWeekAvg - firstWeekAvg) / firstWeekAvg * 100);
    
    let insight = '';
    
    switch (selectedMetric) {
      case 'efficiency':
        insight = `平均学習効率スコアは${Math.round(average)}です。`;
        if (changePercent > 10) {
          insight += ` 効率は${Math.abs(changePercent)}%向上しており、学習方法の改善が見られます。`;
        } else if (changePercent < -10) {
          insight += ` 効率は${Math.abs(changePercent)}%低下しています。集中力や学習環境の見直しを検討してください。`;
        } else {
          insight += ' 効率は安定しています。';
        }
        break;
      
      case 'pages':
        insight = `1日あたりの平均学習ページ数は${Math.round(average)}ページです。`;
        if (changePercent > 10) {
          insight += ` 学習量は${Math.abs(changePercent)}%増加しており、継続的な努力が見られます。`;
        } else if (changePercent < -10) {
          insight += ` 学習量は${Math.abs(changePercent)}%減少しています。学習スケジュールの見直しを検討してください。`;
        } else {
          insight += ' 学習量は安定しています。';
        }
        break;
      
      case 'minutes':
        insight = `1日あたりの平均学習時間は${Math.floor(average / 60)}時間${Math.round(average % 60)}分です。`;
        if (changePercent > 10) {
          insight += ` 学習時間は${Math.abs(changePercent)}%増加しており、学習への取り組みが強化されています。`;
        } else if (changePercent < -10) {
          insight += ` 学習時間は${Math.abs(changePercent)}%減少しています。時間管理の見直しを検討してください。`;
        } else {
          insight += ' 学習時間は安定しています。';
        }
        break;
    }
    
    return insight;
  };
  
  // 科目パフォーマンスの分析結果テキストを生成
  const determineSubjectPerformanceInsight = (): string => {
    if (performanceData.length === 0) {
      return '十分なデータがありません。しばらく学習を記録してから再度確認してください。';
    }
    
    // 効率スコアが最も高い科目
    const highestEfficiency = performanceData.reduce((a, b) => 
      (a.efficiency || 0) > (b.efficiency || 0) ? a : b);
    
    // 効率スコアが最も低い科目（0より大きい場合）
    const nonZeroPerformances = performanceData.filter(p => (p.efficiency || 0) > 0);
    const lowestEfficiency = nonZeroPerformances.length > 0 
      ? nonZeroPerformances.reduce((a, b) => (a.efficiency || 0) < (b.efficiency || 0) ? a : b)
      : null;
    
    // 進捗が最も進んでいる科目
    const highestProgress = performanceData.reduce((a, b) => 
      (a.progress || 0) > (b.progress || 0) ? a : b);
    
    // 最も最近学習した科目
    const mostRecent = performanceData.reduce((a, b) => {
      const dateA = new Date(a.lastStudied || '1970-01-01');
      const dateB = new Date(b.lastStudied || '1970-01-01');
      return dateA > dateB ? a : b;
    });
    
    let insight = '';
    
    if (highestEfficiency) {
      insight += `最も効率的に学習できている科目は「${highestEfficiency.name}」（効率スコア: ${highestEfficiency.efficiency}）です。`;
      
      if (highestEfficiency.strengths && highestEfficiency.strengths.length > 0) {
        insight += ` この科目の強みは「${highestEfficiency.strengths.join(', ')}」です。`;
      }
    }
    
    if (lowestEfficiency && lowestEfficiency.name !== highestEfficiency.name) {
      insight += ` 一方、「${lowestEfficiency.name}」（効率スコア: ${lowestEfficiency.efficiency}）は効率を改善する余地があります。`;
      
      if (lowestEfficiency.weaknesses && lowestEfficiency.weaknesses.length > 0) {
        insight += ` 特に「${lowestEfficiency.weaknesses.join(', ')}」の部分に注意してください。`;
      }
    }
    
    if (highestProgress && highestProgress.name !== highestEfficiency.name) {
      insight += ` 最も進捗している科目は「${highestProgress.name}」（${highestProgress.progress}%完了）です。`;
    }
    
    if (mostRecent && new Date(mostRecent.lastStudied) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      insight += ` 最近は「${mostRecent.name}」を中心に学習されています。`;
    }
    
    return insight || '科目別のパフォーマンスデータを分析中です。より多くのデータが蓄積されるとより詳細な分析が可能になります。';
  };

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>期間</InputLabel>
            <Select
              value={timeRangeInDays.toString()}
              onChange={handleTimeRangeChange}
              label="期間"
            >
              <MenuItem value="7">直近1週間</MenuItem>
              <MenuItem value="30">直近1ヶ月</MenuItem>
              <MenuItem value="90">直近3ヶ月</MenuItem>
              <MenuItem value="180">直近6ヶ月</MenuItem>
              <MenuItem value="365">直近1年</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>表示メトリック</InputLabel>
            <Select
              value={selectedMetric}
              onChange={handleMetricChange}
              label="表示メトリック"
            >
              <MenuItem value="efficiency">学習効率</MenuItem>
              <MenuItem value="pages">学習ページ数</MenuItem>
              <MenuItem value="minutes">学習時間</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControlLabel
            control={
              <Switch
                checked={showTrendline}
                onChange={handleTrendlineToggle}
                color="primary"
              />
            }
            label="トレンドライン表示"
          />
        </Grid>
      </Grid>

      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 4,
          borderRadius: 2, 
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper
        }}
      >
        {renderEfficiencyTrendChart()}
      </Paper>
      
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          borderRadius: 2, 
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper
        }}
      >
        {renderSubjectPerformanceChart()}
      </Paper>
    </Box>
  );
}; 