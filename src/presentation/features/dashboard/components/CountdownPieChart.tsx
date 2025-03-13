import React, { useMemo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  useTheme, 
  LinearProgress,
  linearProgressClasses
} from '@mui/material';
import { format } from 'date-fns';
import { CountdownData } from '../../../../domain/services/visualizationService';

interface CountdownPieChartProps {
  data: CountdownData;
}

/**
 * カスタムTooltipコンポーネント
 */
const CustomTooltip = ({ active, payload }: any) => {
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
          {payload[0].name}
        </Typography>
        <Typography variant="body2" color="primary">
          {payload[0].value}%
        </Typography>
      </Box>
    );
  }
  return null;
};

// 進捗状態を計算するコンポーネント
const ProgressStatus = React.memo(({ progress, theme }: { progress: number; theme: any }) => {
  const progressState = useMemo(() => {
    if (progress >= 80) {
      return {
        label: '良好',
        color: theme.palette.success.main
      };
    } else if (progress >= 50) {
      return {
        label: '順調',
        color: theme.palette.primary.main
      };
    } else if (progress >= 30) {
      return {
        label: '注意',
        color: theme.palette.warning.main
      };
    } else {
      return {
        label: '危険',
        color: theme.palette.error.main
      };
    }
  }, [progress, theme]);

  return (
    <Box sx={{ px: 1, mb: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          進捗状況
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: progressState.color,
            fontWeight: 'bold' 
          }}
        >
          {progressState.label}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 6,
          borderRadius: 3,
          [`&.${linearProgressClasses.colorPrimary}`]: {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.12)' 
              : 'rgba(0, 0, 0, 0.05)',
          },
          [`& .${linearProgressClasses.bar}`]: {
            borderRadius: 3,
            backgroundColor: progressState.color,
          },
        }}
      />
    </Box>
  );
});

// 円グラフコンポーネント
const PieChartSection = React.memo(({ data, theme }: { data: any; theme: any }) => {
  const COLORS = [theme.palette.success.main, theme.palette.grey[300]];

  return (
    <>
      <Box sx={{ height: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={36}
              outerRadius={48}
              paddingAngle={5}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ 
          textAlign: 'center', 
          mt: 1, 
          fontSize: '0.75rem',
          fontWeight: 'medium'
        }}
      >
        進捗率: {data[0].value}%
      </Typography>
    </>
  );
});

/**
 * 試験準備カウントダウンウィジェットコンポーネント
 */
const CountdownPieChart: React.FC<CountdownPieChartProps> = React.memo(({ data }) => {
  const theme = useTheme();

  const countdownColor = useMemo(() => {
    if (data.remainingDays <= 7) {
      return theme.palette.error.main;
    } else if (data.remainingDays <= 14) {
      return theme.palette.warning.main;
    }
    return theme.palette.success.main;
  }, [data.remainingDays, theme]);

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      border: '1px solid',
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      borderRadius: 2,
      boxShadow: theme.palette.mode === 'dark' 
        ? '0 4px 12px rgba(0, 0, 0, 0.2)' 
        : '0 4px 12px rgba(0, 0, 0, 0.05)',
      '&:hover': {
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 6px 16px rgba(0, 0, 0, 0.3)' 
          : '0 6px 16px rgba(0, 0, 0, 0.1)',
      }
    }}>
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={7}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" component="div" color={countdownColor} sx={{ 
                textAlign: 'center',
                fontWeight: 600,
                textShadow: theme.palette.mode === 'dark' 
                  ? '0px 2px 4px rgba(0, 0, 0, 0.5)' 
                  : 'none'
              }}>
                {data.remainingDays}
              </Typography>
              <Typography 
                variant="subtitle2" 
                color="text.secondary" 
                sx={{ 
                  textAlign: 'center',
                  mb: 1
                }}
              >
                残り日数
              </Typography>
              
              <ProgressStatus progress={data.progressData[0].value} theme={theme} />
              
              <Typography variant="h6" component="div" sx={{ mt: 2, textAlign: 'center', fontSize: '0.9rem' }}>
                {data.subject}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
                試験日: {format(data.dueDate, 'yyyy/MM/dd')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={5}>
            <PieChartSection data={data.progressData} theme={theme} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
});

export default CountdownPieChart; 