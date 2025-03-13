import React, { useMemo } from 'react';
import { Box, Grid, Typography, Card, CardContent, useTheme } from '@mui/material';
import CountdownPieChart from './CountdownPieChart';
import { CountdownData } from '../../../../domain/services/visualizationService';

interface CountdownContainerProps {
  data: CountdownData[];
  title?: string;
}

// 統計情報コンポーネント
const Statistics = React.memo(({ data, theme }: { data: CountdownData[]; theme: any }) => {
  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalSubjects: 0,
        averageProgress: 0,
        closestExam: null,
        urgentCount: 0
      };
    }

    const totalSubjects = data.length;
    const totalProgress = data.reduce((sum, item) => sum + item.progressData[0].value, 0);
    const averageProgress = Math.round(totalProgress / totalSubjects);
    const sortedByDate = [...data].sort((a, b) => a.remainingDays - b.remainingDays);
    const closestExam = sortedByDate[0];
    const urgentCount = data.filter(item => item.remainingDays <= 7).length;
    
    return {
      totalSubjects,
      averageProgress,
      closestExam,
      urgentCount
    };
  }, [data]);

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid item xs={6} sm={3}>
        <Box sx={{ 
          p: 1, 
          borderRadius: 1, 
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
        }}>
          <Typography variant="caption" color="text.secondary">平均進捗率</Typography>
          <Typography variant="h6">{stats.averageProgress}%</Typography>
        </Box>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Box sx={{ 
          p: 1, 
          borderRadius: 1, 
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
        }}>
          <Typography variant="caption" color="text.secondary">最短試験</Typography>
          <Typography variant="h6">
            {stats.closestExam ? `${stats.closestExam.remainingDays}日` : '-'}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Box sx={{ 
          p: 1, 
          borderRadius: 1, 
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
        }}>
          <Typography variant="caption" color="text.secondary">科目数</Typography>
          <Typography variant="h6">{stats.totalSubjects}</Typography>
        </Box>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Box sx={{ 
          p: 1, 
          borderRadius: 1, 
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          ...(stats.urgentCount > 0 && {
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 50, 50, 0.2)' : 'rgba(255, 50, 50, 0.1)',
          })
        }}>
          <Typography variant="caption" color="text.secondary">7日以内</Typography>
          <Typography variant="h6" color={stats.urgentCount > 0 ? 'error' : 'text.primary'}>
            {stats.urgentCount}科目
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
});

/**
 * 複数の試験準備カウントダウンウィジェットを表示するコンテナコンポーネント
 */
const CountdownContainer: React.FC<CountdownContainerProps> = React.memo(({ 
  data,
  title = '試験準備カウントダウン'
}) => {
  const theme = useTheme();

  // 試験日が近い順にソート
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data].sort((a, b) => a.remainingDays - b.remainingDays);
  }, [data]);

  // データがない場合のメッセージを表示
  if (!data || data.length === 0) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            表示するデータがありません。<br />
            科目を追加して試験日を設定しましょう。
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {`${data.length}科目`}
          </Typography>
        </Box>
        
        <Statistics data={data} theme={theme} />
      </Box>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2, pb: 2 }}>
        <Grid container spacing={2}>
          {sortedData.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <CountdownPieChart data={item} />
            </Grid>
          ))}
        </Grid>
      </Box>
      
      <Box sx={{ px: 2, py: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
          このウィジェットは各科目の試験日までの残り日数と進捗状況を表示しています。
          残り日数が7日以内の場合は赤色、8～14日の場合は黄色で表示されます。
        </Typography>
      </Box>
    </Box>
  );
});

export default CountdownContainer; 