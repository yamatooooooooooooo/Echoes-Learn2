import React, { useMemo, useCallback } from 'react';
import { Box, Grid, Typography, Card, CardContent, useTheme, Chip } from '@mui/material';
import { Assignment as AssignmentIcon, Event as EventIcon } from '@mui/icons-material';
import CountdownPieChart from './CountdownPieChart';
import { CountdownData } from '../../../../domain/services/visualizationService';
import { Subject } from '../../../../domain/models/SubjectModel';
import { differenceInDays } from 'date-fns';

interface CountdownContainerProps {
  data: CountdownData[];
  title?: string;
  includeReportDeadlines?: boolean;
  subjects?: Subject[];
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
          <Typography variant="caption" color="text.secondary">最短締切</Typography>
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
          <Typography variant="caption" color="text.secondary">項目数</Typography>
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
            {stats.urgentCount}件
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
});

/**
 * リポート締め切りデータをCountdownData形式に変換する関数
 */
const createReportDeadlineCountdownData = (subjects: Subject[]): CountdownData[] => {
  if (!subjects || subjects.length === 0) return [];
  
  const today = new Date();
  const result: CountdownData[] = [];
  
  subjects.forEach(subject => {
    // リポート締め切りがある科目のみ処理
    if (subject.reportDeadline) {
      const dueDate = new Date(subject.reportDeadline);
      const remainingDays = Math.max(0, differenceInDays(dueDate, today));
      
      // 進捗率（レポートは完了か未完了の二択とする）
      const progress = subject.reportSubmitted ? 100 : 0;
      
      result.push({
        subject: subject.name,
        dueDate,
        remainingDays,
        progressData: [
          { name: '完了', value: progress },
          { name: '未完了', value: 100 - progress }
        ],
        isReport: true // レポート用のフラグを追加
      });
    }
  });
  
  return result;
};

// チップコンポーネントをメモ化
const ExamChip = React.memo(() => (
  <Chip
    icon={<EventIcon />}
    label="試験"
    size="small"
    color="primary"
    sx={{
      position: 'absolute',
      top: 10,
      right: 10,
      fontWeight: 'bold',
      boxShadow: 1
    }}
  />
));

// チップコンポーネントをメモ化
const ReportChip = React.memo(() => (
  <Chip
    icon={<AssignmentIcon />}
    label="レポート"
    size="small"
    color="secondary"
    sx={{
      position: 'absolute',
      top: 10,
      right: 10,
      fontWeight: 'bold',
      boxShadow: 1
    }}
  />
));

// カウントダウンアイテムをメモ化
const CountdownItem = React.memo(({ item }: { item: CountdownData }) => (
  <Box sx={{ position: 'relative' }}>
    <CountdownPieChart data={item} />
    {item.isReport ? <ReportChip /> : <ExamChip />}
  </Box>
));

/**
 * 複数の試験準備カウントダウンウィジェットを表示するコンテナコンポーネント
 */
const CountdownContainer: React.FC<CountdownContainerProps> = React.memo(({ 
  data,
  title = '締切カウントダウン',
  includeReportDeadlines = false,
  subjects = []
}) => {
  const theme = useTheme();

  // リポート締め切りデータ生成関数をメモ化
  const getReportData = useCallback((subs: Subject[]) => {
    return createReportDeadlineCountdownData(subs);
  }, []);

  // リポート締め切りデータを生成し、試験データと結合
  const combinedData = useMemo(() => {
    if (!includeReportDeadlines || !subjects || subjects.length === 0) {
      return data;
    }
    
    const reportData = getReportData(subjects);
    return [...data, ...reportData];
  }, [data, includeReportDeadlines, subjects, getReportData]);

  // 締切日が近い順にソート
  const sortedData = useMemo(() => {
    if (!combinedData || combinedData.length === 0) return [];
    return [...combinedData].sort((a, b) => a.remainingDays - b.remainingDays);
  }, [combinedData]);

  // メモ化されたヘッダー部分
  const HeaderSection = useMemo(() => (
    <Box sx={{ px: 2, pt: 2, pb: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {`${sortedData.length}件`}
        </Typography>
      </Box>
      
      <Statistics data={sortedData} theme={theme} />
    </Box>
  ), [sortedData, theme, title]);

  // メモ化されたフッター部分
  const FooterSection = useMemo(() => (
    <Box sx={{ px: 2, py: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
        このウィジェットは各科目の試験日およびレポート締切日までの残り日数と進捗状況を表示しています。
        残り日数が7日以内の場合は赤色、8～14日の場合は黄色で表示されます。
      </Typography>
    </Box>
  ), [theme.palette.divider]);

  // データがない場合のメッセージを表示
  if (!sortedData || sortedData.length === 0) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            表示するデータがありません。<br />
            科目を追加して試験日やレポート締切日を設定しましょう。
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {HeaderSection}
      
      <Box sx={{ flexGrow: 1, px: 2, pb: 2, maxHeight: '450px' }}>
        <Grid container spacing={2} sx={{ maxHeight: '420px', overflow: 'auto' }}>
          {sortedData.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={`countdown-${item.subject}-${index}`}>
              <CountdownItem item={item} />
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {FooterSection}
    </Box>
  );
});

export default CountdownContainer; 