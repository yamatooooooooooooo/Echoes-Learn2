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
} from '@mui/material';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Subject } from '../../../../domain/models/SubjectModel';
import { Progress } from '../../../../domain/models/ProgressModel';
import { StudySession } from '../../../../domain/models/StudyAnalyticsModel';

interface StudyHabitAnalysisProps {
  progressData: Progress[];
  studySessions: StudySession[];
  subjects: Subject[];
}

/**
 * 学習習慣分析コンポーネント
 */
export const StudyHabitAnalysis: React.FC<StudyHabitAnalysisProps> = ({ 
  progressData, 
  studySessions, 
  subjects 
}) => {
  const theme = useTheme();
  const [timeRangeInDays, setTimeRangeInDays] = useState<number>(30);
  const [chartType, setChartType] = useState<'weekly' | 'timeOfDay' | 'subjectDistribution'>('weekly');

  // 時間範囲の変更ハンドラー
  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRangeInDays(Number(event.target.value));
  };

  // チャートタイプの変更ハンドラー
  const handleChartTypeChange = (event: SelectChangeEvent) => {
    setChartType(event.target.value as 'weekly' | 'timeOfDay' | 'subjectDistribution');
  };

  // 時間範囲に基づいてフィルタリングされたデータ
  const filteredData = useMemo(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeRangeInDays);
    
    return progressData.filter(p => {
      const progressDate = new Date(p.recordDate || p.createdAt || new Date());
      return progressDate >= cutoffDate;
    });
  }, [progressData, timeRangeInDays]);

  // フィルタリングされたセッションデータ
  const filteredSessions = useMemo(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeRangeInDays);
    cutoffDate.setHours(0, 0, 0, 0);
    
    return studySessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate >= cutoffDate;
    });
  }, [studySessions, timeRangeInDays]);

  // 曜日別学習ページ数データの生成
  const weekdayData = useMemo(() => {
    const weekdayStats: { [key: string]: { pages: number, minutes: number, count: number } } = {
      '月曜日': { pages: 0, minutes: 0, count: 0 },
      '火曜日': { pages: 0, minutes: 0, count: 0 },
      '水曜日': { pages: 0, minutes: 0, count: 0 },
      '木曜日': { pages: 0, minutes: 0, count: 0 },
      '金曜日': { pages: 0, minutes: 0, count: 0 },
      '土曜日': { pages: 0, minutes: 0, count: 0 },
      '日曜日': { pages: 0, minutes: 0, count: 0 }
    };
    
    // 曜日名の配列
    const weekdays = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
    
    // 進捗データから曜日別統計を集計
    filteredData.forEach(p => {
      const date = new Date(p.recordDate || p.createdAt || new Date());
      const weekday = weekdays[date.getDay()];
      
      weekdayStats[weekday].pages += p.pagesRead || 0;
      weekdayStats[weekday].count += 1;
    });
    
    // セッションデータから時間情報を追加
    filteredSessions.forEach(s => {
      const date = new Date(s.date);
      const weekday = weekdays[date.getDay()];
      
      weekdayStats[weekday].minutes += s.duration || 0;
    });
    
    // チャート用のデータ形式に変換
    return Object.keys(weekdayStats).map(day => ({
      day,
      pages: weekdayStats[day].pages,
      minutes: weekdayStats[day].minutes,
      pagesPerSession: weekdayStats[day].count > 0 
        ? Math.round(weekdayStats[day].pages / weekdayStats[day].count) 
        : 0,
      efficiency: weekdayStats[day].minutes > 0 
        ? Math.round((weekdayStats[day].pages * 5) / weekdayStats[day].minutes * 100) 
        : 0
    }));
  }, [filteredData, filteredSessions]);

  // 時間帯別学習データの生成
  const timeOfDayData = useMemo(() => {
    const timeOfDayStats: { [key: string]: { sessions: number, minutes: number, pages: number } } = {
      '朝 (5-9時)': { sessions: 0, minutes: 0, pages: 0 },
      '午前 (9-12時)': { sessions: 0, minutes: 0, pages: 0 },
      '午後 (12-17時)': { sessions: 0, minutes: 0, pages: 0 },
      '夕方 (17-20時)': { sessions: 0, minutes: 0, pages: 0 },
      '夜 (20-24時)': { sessions: 0, minutes: 0, pages: 0 },
      '深夜 (0-5時)': { sessions: 0, minutes: 0, pages: 0 }
    };
    
    // セッションデータから時間帯別統計を集計
    filteredSessions.forEach(s => {
      if (s.timeOfDay && timeOfDayStats[s.timeOfDay]) {
        timeOfDayStats[s.timeOfDay].sessions += 1;
        timeOfDayStats[s.timeOfDay].minutes += s.duration || 0;
        timeOfDayStats[s.timeOfDay].pages += s.pagesCompleted || 0;
      }
    });
    
    // チャート用のデータ形式に変換
    return Object.keys(timeOfDayStats).map(time => ({
      timeOfDay: time,
      sessions: timeOfDayStats[time].sessions,
      minutes: timeOfDayStats[time].minutes,
      pages: timeOfDayStats[time].pages,
      efficiency: timeOfDayStats[time].minutes > 0 
        ? Math.round((timeOfDayStats[time].pages * 5) / timeOfDayStats[time].minutes * 100) 
        : 0
    }));
  }, [filteredSessions]);

  // 科目別学習時間・ページ数の分布データ
  const subjectDistributionData = useMemo(() => {
    const subjectStats: { [key: string]: { minutes: number, pages: number, name: string } } = {};
    
    // 科目名のマッピングを作成
    const subjectNameMap = new Map<string, string>();
    subjects.forEach(s => {
      subjectNameMap.set(s.id, s.name);
      subjectStats[s.id] = { minutes: 0, pages: 0, name: s.name };
    });
    
    // セッションデータから科目別統計を集計
    filteredSessions.forEach(s => {
      if (s.subjectId && subjectStats[s.subjectId]) {
        subjectStats[s.subjectId].minutes += s.duration || 0;
        subjectStats[s.subjectId].pages += s.pagesCompleted || 0;
      }
    });
    
    // 進捗データから科目別統計を補完
    filteredData.forEach(p => {
      if (p.subjectId && subjectStats[p.subjectId]) {
        subjectStats[p.subjectId].pages += p.pagesRead || 0;
      }
    });
    
    // チャート用のデータ形式に変換
    return Object.keys(subjectStats)
      .filter(id => subjectStats[id].pages > 0 || subjectStats[id].minutes > 0)
      .map(id => ({
        subjectId: id,
        name: subjectStats[id].name,
        minutes: subjectStats[id].minutes,
        pages: subjectStats[id].pages,
        hoursString: `${Math.floor(subjectStats[id].minutes / 60)}h ${subjectStats[id].minutes % 60}m`
      }));
  }, [filteredSessions, filteredData, subjects]);

  // チャートの色を取得
  const getChartColors = () => {
    return [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      '#4caf50',
      '#ff9800',
      '#9c27b0',
      '#f44336',
      '#2196f3'
    ];
  };

  // 曜日別学習習慣チャート
  const renderWeekdayChart = () => {
    // データを月曜日から日曜日の順に並べ替え
    const orderedWeekdays = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'];
    const orderedData = orderedWeekdays.map(day => {
      return weekdayData.find(item => item.day === day) || { day, pages: 0, minutes: 0, pagesPerSession: 0, efficiency: 0 };
    });
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            曜日別学習パターン
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            どの曜日に最も効率的に学習できているかを分析します。学習ページ数と所要時間の関係から効率を判断します。
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={orderedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" orientation="left" label={{ value: 'ページ数', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: '時間 (分)', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="pages" name="読んだページ数" fill={theme.palette.primary.main} />
                <Bar yAxisId="right" dataKey="minutes" name="学習時間 (分)" fill={theme.palette.secondary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ height: 350 }}>
            <ResponsiveContainer>
              <LineChart data={orderedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="efficiency" name="効率スコア" stroke="#4caf50" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="pagesPerSession" name="セッションあたりページ数" stroke="#ff9800" strokeWidth={2} dot={{ r: 4 }} />
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
              {determineWeekdayInsight(orderedData)}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    );
  };

  // 時間帯別学習習慣チャート
  const renderTimeOfDayChart = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            時間帯別学習効率
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            一日のうちどの時間帯に最も効率的に学習できるかを分析します。
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={timeOfDayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timeOfDay" />
                <YAxis yAxisId="left" orientation="left" label={{ value: '時間 (分)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'セッション数', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="minutes" name="学習時間 (分)" fill={theme.palette.primary.main} />
                <Bar yAxisId="right" dataKey="sessions" name="セッション数" fill={theme.palette.secondary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={timeOfDayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timeOfDay" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="efficiency" name="効率スコア" fill="#4caf50" />
                <Bar dataKey="pages" name="読んだページ数" fill="#ff9800" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              分析結果
            </Typography>
            <Typography variant="body2">
              {determineTimeOfDayInsight(timeOfDayData)}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    );
  };

  // 科目別学習時間分布チャート
  const renderSubjectDistributionChart = () => {
    const colors = getChartColors();
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            科目別学習時間分布
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            各科目にどれだけ時間を費やしているかを分析します。時間配分の偏りを確認できます。
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ height: 350 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={subjectDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="minutes"
                  nameKey="name"
                  label={(entry) => `${entry.name}: ${entry.hoursString}`}
                >
                  {subjectDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${Math.floor(Number(value) / 60)}時間 ${Number(value) % 60}分`, props.payload.name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={subjectDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'ページ数', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="pages" name="読んだページ数" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              分析結果
            </Typography>
            <Typography variant="body2">
              {determineSubjectDistributionInsight(subjectDistributionData)}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    );
  };

  // 曜日別学習習慣の分析結果テキストを生成
  const determineWeekdayInsight = (data: any[]): string => {
    if (data.length === 0 || data.every(d => d.pages === 0)) {
      return '十分なデータがありません。しばらく学習を記録してから再度確認してください。';
    }
    
    // 最も学習量が多い曜日
    const maxPagesDay = data.reduce((a, b) => a.pages > b.pages ? a : b);
    
    // 最も効率が良い曜日
    const maxEfficiencyDay = data.reduce((a, b) => a.efficiency > b.efficiency ? a : b);
    
    let insight = `最も学習量が多いのは${maxPagesDay.day}（${maxPagesDay.pages}ページ）です。`;
    
    if (maxEfficiencyDay.efficiency > 0) {
      insight += ` 効率スコアが最も高いのは${maxEfficiencyDay.day}（${maxEfficiencyDay.efficiency}ポイント）です。`;
      
      if (maxPagesDay.day !== maxEfficiencyDay.day) {
        insight += ` ${maxEfficiencyDay.day}に集中して学習することで、より効率的に進められる可能性があります。`;
      } else {
        insight += ' 学習量と効率が一致しており、良いパターンが確立されています。';
      }
    }
    
    return insight;
  };

  // 時間帯別学習習慣の分析結果テキストを生成
  const determineTimeOfDayInsight = (data: any[]): string => {
    if (data.length === 0 || data.every(d => d.minutes === 0)) {
      return '十分なデータがありません。しばらく学習を記録してから再度確認してください。';
    }
    
    // 最も学習時間が長い時間帯
    const maxMinutesTime = data.reduce((a, b) => a.minutes > b.minutes ? a : b);
    
    // 最も効率が良い時間帯
    const maxEfficiencyTime = data.filter(d => d.minutes > 0)
      .reduce((a, b) => a.efficiency > b.efficiency ? a : b, { efficiency: 0, timeOfDay: '' });
    
    let insight = `最も学習時間が長いのは${maxMinutesTime.timeOfDay}（${Math.floor(maxMinutesTime.minutes / 60)}時間${maxMinutesTime.minutes % 60}分）です。`;
    
    if (maxEfficiencyTime.efficiency > 0) {
      insight += ` 効率スコアが最も高いのは${maxEfficiencyTime.timeOfDay}（${maxEfficiencyTime.efficiency}ポイント）です。`;
      
      if (maxMinutesTime.timeOfDay !== maxEfficiencyTime.timeOfDay) {
        insight += ` ${maxEfficiencyTime.timeOfDay}に学習時間をシフトすることで、より効率的に進められる可能性があります。`;
      } else {
        insight += ' 学習時間と効率が一致しており、最適な時間帯に学習できています。';
      }
    }
    
    return insight;
  };

  // 科目別学習時間分布の分析結果テキストを生成
  const determineSubjectDistributionInsight = (data: any[]): string => {
    if (data.length === 0) {
      return '十分なデータがありません。しばらく学習を記録してから再度確認してください。';
    }
    
    // 総学習時間
    const totalMinutes = data.reduce((sum, item) => sum + item.minutes, 0);
    
    // 最も学習時間が長い科目
    const maxMinutesSubject = data.reduce((a, b) => a.minutes > b.minutes ? a : b);
    const maxMinutesPercentage = Math.round((maxMinutesSubject.minutes / totalMinutes) * 100);
    
    // 学習時間が最も短い科目（0分の科目は除外）
    const minMinutesSubject = data
      .filter(item => item.minutes > 0)
      .reduce((a, b) => a.minutes < b.minutes ? a : b, maxMinutesSubject);
    const minMinutesPercentage = Math.round((minMinutesSubject.minutes / totalMinutes) * 100);
    
    let insight = '';
    
    if (data.length === 1) {
      insight = `現在は「${data[0].name}」のみ学習されています。他の科目も追加して学習状況をトラッキングしましょう。`;
    } else {
      insight = `最も時間を費やしている科目は「${maxMinutesSubject.name}」で、全体の${maxMinutesPercentage}%（${Math.floor(maxMinutesSubject.minutes / 60)}時間${maxMinutesSubject.minutes % 60}分）を占めています。`;
      
      if (maxMinutesPercentage > 50) {
        insight += ' この科目に集中することは効果的ですが、他の科目とのバランスも検討すると良いでしょう。';
      }
      
      if (minMinutesSubject.minutes > 0 && minMinutesSubject.name !== maxMinutesSubject.name) {
        insight += ` 一方、「${minMinutesSubject.name}」には全体の${minMinutesPercentage}%しか時間を費やしていません。`;
        
        if (minMinutesPercentage < 10) {
          insight += ' この科目にも十分な時間を確保することを検討してください。';
        }
      }
    }
    
    return insight;
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
            <InputLabel>分析グラフ</InputLabel>
            <Select
              value={chartType}
              onChange={handleChartTypeChange}
              label="分析グラフ"
            >
              <MenuItem value="weekly">曜日別学習パターン</MenuItem>
              <MenuItem value="timeOfDay">時間帯別学習効率</MenuItem>
              <MenuItem value="subjectDistribution">科目別学習時間分布</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          borderRadius: 2, 
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper
        }}
      >
        {chartType === 'weekly' && renderWeekdayChart()}
        {chartType === 'timeOfDay' && renderTimeOfDayChart()}
        {chartType === 'subjectDistribution' && renderSubjectDistributionChart()}
      </Paper>
    </Box>
  );
}; 