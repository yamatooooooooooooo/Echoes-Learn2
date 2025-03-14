import React, { useMemo } from 'react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Box, Card, CardContent, Typography, useTheme, Theme } from '@mui/material';
import { RadarChartData } from '../../../../domain/services/visualizationService';

interface ProgressRadarChartProps {
  data: RadarChartData[];
  title?: string;
}

// 型定義の改善
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      subject: string;
    };
  }>;
}

/**
 * カスタムTooltipコンポーネント
 */
const CustomTooltip = React.memo(({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: 'background.paper',
          p: 2,
          boxShadow: 3,
          borderRadius: 1,
        }}
      >
        <Typography variant="subtitle2" color="text.primary">
          {payload[0].payload.subject}
        </Typography>
        <Typography variant="body2" color="primary">
          進捗率: {payload[0].value}%
        </Typography>
      </Box>
    );
  }
  return null;
});

// 型定義の改善
interface CustomLegendProps {
  payload?: Array<{
    color: string;
  }>;
  theme: Theme;
}

/**
 * カスタム凡例コンポーネント
 */
const CustomLegend = React.memo(({ payload, theme }: CustomLegendProps) => {
  if (!payload) return null;
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 1,
        mt: 2
      }}
    >
      {payload.map((entry, index) => (
        <Box 
          key={`legend-${index}`}
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            p: 0.5,
            px: 1,
            borderRadius: 1,
          }}
        >
          <Box 
            sx={{ 
              width: 10, 
              height: 10, 
              backgroundColor: entry.color,
              mr: 1,
              borderRadius: '50%'
            }}
          />
          <Typography variant="caption" color="text.secondary">
            進捗率
          </Typography>
        </Box>
      ))}
    </Box>
  );
});

// データがない場合に表示するコンポーネント
const EmptyChartMessage = React.memo(() => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <CardContent sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="body1" color="text.secondary" textAlign="center">
      </Typography>
    </CardContent>
  </Card>
));

// チャートの説明文
const ChartDescription = React.memo(({ dividerColor }: { dividerColor: string }) => (
  <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${dividerColor}` }}>
    <Typography variant="body2" color="text.secondary">
    </Typography>
  </Box>
));

// データ処理のためのカスタムフック
const useRadarChartData = (data: RadarChartData[] | undefined) => {
  return useMemo(() => {
    if (!data || data.length === 0) {
      return {
        isDataAvailable: false,
        dataCountText: '0科目の進捗を表示',
      };
    }
    
    return {
      isDataAvailable: true,
      dataCountText: `${data.length}科目の進捗を表示`,
    };
  }, [data]);
};

/**
 * 学習進捗レーダーチャートコンポーネント
 */
const ProgressRadarChart: React.FC<ProgressRadarChartProps> = React.memo(({ 
  data = [],
  title = '学習進捗レーダーチャート'
}) => {
  const theme = useTheme();
  const { isDataAvailable, dataCountText } = useRadarChartData(data);

  // ヘッダー部分をメモ化
  const HeaderSection = useMemo(() => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h6" component="div">
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {dataCountText}
      </Typography>
    </Box>
  ), [title, dataCountText]);

  // レーダーチャート部分をメモ化
  const ChartSection = useMemo(() => (
    <Box sx={{ height: 300, mt: 2 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke={theme.palette.divider} />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tickCount={5}
            tick={{ fill: theme.palette.text.secondary, fontSize: 10 }}
            stroke={theme.palette.divider}
            tickFormatter={(value) => `${value}%`}
          />
          <Radar
            name="進捗率"
            dataKey="progress"
            stroke={theme.palette.primary.main}
            fill={theme.palette.primary.main}
            fillOpacity={0.6}
            animationBegin={0}
            animationDuration={800}
            animationEasing="ease-out"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend theme={theme} />} />
        </RadarChart>
      </ResponsiveContainer>
    </Box>
  ), [data, theme]);

  // データがない場合のメッセージを表示
  if (!isDataAvailable) {
    return <EmptyChartMessage />;
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        {HeaderSection}
        {ChartSection}
        <ChartDescription dividerColor={theme.palette.divider} />
      </CardContent>
    </Card>
  );
});

export default ProgressRadarChart; 