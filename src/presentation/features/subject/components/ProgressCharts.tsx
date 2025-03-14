import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  useTheme,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format, parseISO, isValid, subDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Progress } from '../../../../domain/models/ProgressModel';
import { Subject } from '../../../../domain/models/SubjectModel';

// フィルタータイプの定義
type FilterType = 'week' | 'month' | 'all';

interface ProgressChartsProps {
  progressRecords: Progress[];
  subject: Subject;
  loading: boolean;
  error: Error | null;
}

/**
 * 進捗データを可視化するグラフコンポーネント
 */
export const ProgressCharts: React.FC<ProgressChartsProps> = ({
  progressRecords,
  subject,
  loading,
  error,
}) => {
  const theme = useTheme();
  const [filter, setFilter] = React.useState<FilterType>('week');

  // フィルター変更ハンドラー
  const handleFilterChange = (
    _event: React.MouseEvent<HTMLElement>,
    newFilter: FilterType | null
  ) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  // 日付でフィルタリングされたデータを計算
  const filteredData = useMemo(() => {
    if (!progressRecords.length) return [];

    let records = [...progressRecords];

    // 日付でソート（古い順）
    records = records.sort((a, b) => {
      const dateA = new Date(a.recordDate).getTime();
      const dateB = new Date(b.recordDate).getTime();
      return dateA - dateB;
    });

    // フィルタリング
    if (filter === 'week') {
      const today = new Date();
      const oneWeekAgo = subDays(today, 7);
      records = records.filter((record) => {
        const recordDate = new Date(record.recordDate);
        return recordDate >= oneWeekAgo;
      });
    } else if (filter === 'month') {
      const today = new Date();
      const oneMonthAgo = subDays(today, 30);
      records = records.filter((record) => {
        const recordDate = new Date(record.recordDate);
        return recordDate >= oneMonthAgo;
      });
    }

    return records;
  }, [progressRecords, filter]);

  // 日次学習量データの準備
  const dailyProgressData = useMemo(() => {
    // 日付ごとにグループ化
    const dailyMap = new Map<string, number>();

    filteredData.forEach((record) => {
      const dateStr =
        typeof record.recordDate === 'string'
          ? record.recordDate.split('T')[0]
          : format(record.recordDate, 'yyyy-MM-dd');

      const currentValue = dailyMap.get(dateStr) || 0;
      dailyMap.set(dateStr, currentValue + record.pagesRead);
    });

    // Map を配列に変換
    return Array.from(dailyMap.entries()).map(([date, pagesRead]) => ({
      date,
      pagesRead,
    }));
  }, [filteredData]);

  // 累積学習曲線データの準備
  const cumulativeProgressData = useMemo(() => {
    // 累積ページ数を計算
    let cumulativePages = 0;
    // startPageは存在しないので、0を使用
    const startPage = 0;
    const totalPages = subject.totalPages || 0;
    const totalDaysFromStart = subject.examDate
      ? Math.ceil(
          (new Date(subject.examDate).getTime() -
            new Date(subject.createdAt || new Date()).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

    // 日付ごとに累積を計算
    const result = filteredData.map((record) => {
      cumulativePages += record.pagesRead;
      const date =
        typeof record.recordDate === 'string'
          ? record.recordDate.split('T')[0]
          : format(record.recordDate, 'yyyy-MM-dd');

      // 理想的な進捗ライン
      const recordDaysFromStart = subject.createdAt
        ? Math.ceil(
            (new Date(record.recordDate).getTime() - new Date(subject.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0;

      const idealProgress =
        totalDaysFromStart > 0
          ? startPage + (totalPages - startPage) * (recordDaysFromStart / totalDaysFromStart)
          : 0;

      return {
        date,
        cumulativePages: startPage + cumulativePages,
        idealProgress: Math.round(idealProgress),
      };
    });

    return result;
  }, [filteredData, subject]);

  // 日付フォーマッター
  const formatDateTick = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return isValid(date) ? format(date, 'M/d', { locale: ja }) : dateStr;
    } catch {
      return dateStr;
    }
  };

  // 読み込み中表示
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  // エラー表示
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        進捗記録の取得中にエラーが発生しました: {error.message}
      </Alert>
    );
  }

  // 進捗記録なし
  if (!progressRecords || progressRecords.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          まだ進捗記録がありません
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* フィルターUI */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={handleFilterChange}
          size="small"
          aria-label="期間フィルター"
        >
          <ToggleButton value="week" aria-label="1週間">
            1週間
          </ToggleButton>
          <ToggleButton value="month" aria-label="1ヶ月">
            1ヶ月
          </ToggleButton>
          <ToggleButton value="all" aria-label="全期間">
            全期間
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* グラフコンテナ */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" component="h3" gutterBottom>
          日次学習量
        </Typography>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dailyProgressData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatDateTick} tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(value) => `${value}P`} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: any) => [`${value}ページ`, '読了ページ数']}
              labelFormatter={(label) => `${formatDateTick(label.toString())}`}
            />
            <Bar
              dataKey="pagesRead"
              name="読了ページ数"
              fill={theme.palette.primary.main}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6" component="h3" gutterBottom>
          累積学習曲線
        </Typography>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={cumulativeProgressData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatDateTick} tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(value) => `${value}P`} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: any) => [`${value}ページ`, '']}
              labelFormatter={(label) => `${formatDateTick(label.toString())}`}
            />
            <Legend verticalAlign="top" height={36} />
            <Line
              type="monotone"
              dataKey="cumulativePages"
              name="実績ページ数"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="idealProgress"
              name="目標ライン"
              stroke={theme.palette.secondary.main}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
            {subject.totalPages && (
              <ReferenceLine
                y={subject.totalPages}
                label="総ページ数"
                stroke="#ff7300"
                strokeDasharray="3 3"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};
