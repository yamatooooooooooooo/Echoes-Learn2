import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  useTheme
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
  BarChart,
  Bar
} from 'recharts';
import { Subject } from '../../../../domain/models/SubjectModel';
import { Progress } from '../../../../domain/models/ProgressModel';

interface SubjectWithProgress extends Subject {
  totalPagesRead: number;
  progressHistory: Progress[];
  lastStudyDate: string | null;
}

interface ProgressChartProps {
  subjects: SubjectWithProgress[];
}

// データ表示のためのカスタムツールチップ
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: 'background.paper',
          p: 1,
          border: '1px solid #ccc',
          borderRadius: 1,
        }}
      >
        <Typography variant="body2" color="text.primary">
          {`日付: ${new Date(label).toLocaleDateString('ja-JP')}`}
        </Typography>
        {payload.map((entry: any, index: number) => (
          <Typography key={index} variant="body2" color={entry.color}>
            {`${entry.name}: ${entry.value} ページ`}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

export const ProgressChart: React.FC<ProgressChartProps> = ({ subjects }) => {
  const theme = useTheme();
  const [chartType, setChartType] = useState<'daily' | 'cumulative'>('daily');
  
  const handleChartTypeChange = (event: SelectChangeEvent) => {
    setChartType(event.target.value as 'daily' | 'cumulative');
  };
  
  // 日別のページ数を集計するためのデータ変換
  const prepareChartData = () => {
    if (subjects.length === 0) return [];
    
    // 全進捗データを日付ごとに集計
    const allProgresses: { [key: string]: any } = {};
    
    subjects.forEach(subject => {
      subject.progressHistory.forEach(progress => {
        const date = typeof progress.recordDate === 'string' 
          ? progress.recordDate 
          : new Date(progress.recordDate).toISOString().split('T')[0];
        
        if (!allProgresses[date]) {
          allProgresses[date] = {
            date,
          };
        }
        
        // 科目ごとのページ数を記録
        allProgresses[date][subject.name] = progress.pagesRead;
        
        // 累積ページ数の計算のために合計も記録
        if (!allProgresses[date].total) {
          allProgresses[date].total = 0;
        }
        allProgresses[date].total += progress.pagesRead;
      });
    });
    
    // 日付でソート
    const sortedDates = Object.keys(allProgresses).sort();
    const chartData = sortedDates.map(date => allProgresses[date]);
    
    // 累積データの計算
    if (chartType === 'cumulative') {
      const cumulativeData = [...chartData];
      const subjectCumulative: { [key: string]: number } = {};
      
      subjects.forEach(subject => {
        subjectCumulative[subject.name] = 0;
      });
      
      cumulativeData.forEach((dayData, index) => {
        subjects.forEach(subject => {
          // その日のページ数（存在しない場合は0）
          const todayValue = dayData[subject.name] || 0;
          // 累積ページ数に今日のページ数を加算
          subjectCumulative[subject.name] += todayValue;
          // 累積値で置き換え
          dayData[subject.name] = subjectCumulative[subject.name];
        });
      });
      
      return cumulativeData;
    }
    
    return chartData;
  };
  
  const chartData = prepareChartData();
  
  // チャート表示用の色を生成
  const getLineColors = () => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      '#4caf50',
      '#ff9800',
      '#9c27b0',
      '#f44336'
    ];
    
    return subjects.map((_, index) => colors[index % colors.length]);
  };
  
  if (subjects.length === 0 || chartData.length === 0) {
    return (
      <Typography color="text.secondary">
        表示するデータがありません。
      </Typography>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1">
          {chartType === 'daily' ? '日別学習ページ数' : '累積学習ページ数'}
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>グラフタイプ</InputLabel>
          <Select
            value={chartType}
            onChange={handleChartTypeChange}
            label="グラフタイプ"
          >
            <MenuItem value="daily">日別</MenuItem>
            <MenuItem value="cumulative">累積</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Box sx={{ height: 400, width: '100%' }}>
        <ResponsiveContainer>
          {chartType === 'daily' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
              />
              <YAxis 
                label={{ value: 'ページ数', angle: -90, position: 'insideLeft' }} 
              />
              <Legend />
              {subjects.map((subject, index) => (
                <Bar 
                  key={subject.id}
                  dataKey={subject.name}
                  fill={getLineColors()[index]}
                  stackId="stack"
                />
              ))}
            </BarChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
              />
              <YAxis 
                label={{ value: 'ページ数', angle: -90, position: 'insideLeft' }} 
              />
              <Legend />
              {subjects.map((subject, index) => (
                <Line
                  key={subject.id}
                  type="monotone"
                  dataKey={subject.name}
                  stroke={getLineColors()[index]}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}; 