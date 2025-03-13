import React, { useMemo, useCallback, useState } from 'react';
import { Box, Grid, Typography, Card, CardContent, useTheme, Chip, Tabs, Tab, Paper, Divider, LinearProgress } from '@mui/material';
import { Assignment as AssignmentIcon, Event as EventIcon } from '@mui/icons-material';
import CountdownPieChart from './CountdownPieChart';
import { CountdownData } from '../../../../domain/services/visualizationService';
import { Subject } from '../../../../domain/models/SubjectModel';
import { differenceInDays, format } from 'date-fns';

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

// グループ化されたカウントダウンアイテムをメモ化
const GroupedCountdownItem = React.memo(({ 
  date, 
  items 
}: { 
  date: Date; 
  items: CountdownData[] 
}) => {
  const theme = useTheme();
  const isReport = items[0].isReport;
  
  // 日付のフォーマット
  const formattedDate = format(date, 'yyyy/MM/dd');
  
  // 残り日数（すべてのアイテムで同じはず）
  const remainingDays = items[0].remainingDays;
  
  // 残り日数に基づいた色を決定
  const countdownColor = useMemo(() => {
    if (remainingDays <= 7) {
      return theme.palette.error.main;
    } else if (remainingDays <= 14) {
      return theme.palette.warning.main;
    }
    return theme.palette.success.main;
  }, [remainingDays, theme]);

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
      },
      position: 'relative',
    }}>
      {/* 締切タイプチップ */}
      {isReport ? 
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
        /> : 
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
      }
      
      <CardContent>
        {/* 日付と残り日数 */}
        <Box sx={{ mb: 2, mt: 1 }}>
          <Typography variant="h6" component="div" gutterBottom>
            {formattedDate}
          </Typography>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              color: countdownColor
            }}
          >
            {remainingDays === 0 ? "今日" : `あと${remainingDays}日`}
          </Typography>
        </Box>
        
        {/* 科目リスト */}
        <Divider sx={{ mb: 2 }} />
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            科目：
          </Typography>
          {items.map((item, idx) => (
            <Box key={`${item.subject}-${idx}`} sx={{ mb: 1, pl: 1 }}>
              <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.subject}</span>
                <span>{item.progressData[0].value}%</span>
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={item.progressData[0].value} 
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  mt: 0.5,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    bgcolor: isReport ? 
                      (item.progressData[0].value === 100 ? theme.palette.success.main : theme.palette.secondary.main) :
                      theme.palette.primary.main
                  }
                }}
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
});

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
  const [tabValue, setTabValue] = useState(0);

  // タブの切り替え処理
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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

  // 試験データとレポートデータを分離
  const examData = useMemo(() => {
    return combinedData.filter(item => !item.isReport);
  }, [combinedData]);

  const reportData = useMemo(() => {
    return combinedData.filter(item => item.isReport);
  }, [combinedData]);

  // 表示するデータ（タブに応じて切り替え）
  const displayData = useMemo(() => {
    return tabValue === 0 ? examData : reportData;
  }, [tabValue, examData, reportData]);

  // 締切日が近い順にソート
  const sortedData = useMemo(() => {
    if (!displayData || displayData.length === 0) return [];
    return [...displayData].sort((a, b) => a.remainingDays - b.remainingDays);
  }, [displayData]);

  // 同じ日付のアイテムをグループ化
  const groupedData = useMemo(() => {
    const groups = new Map<string, CountdownData[]>();
    
    sortedData.forEach(item => {
      const dateKey = format(item.dueDate, 'yyyy-MM-dd');
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(item);
    });
    
    return Array.from(groups.entries())
      .map(([dateKey, items]) => ({
        date: new Date(dateKey),
        items
      }))
      .sort((a, b) => a.items[0].remainingDays - b.items[0].remainingDays);
  }, [sortedData]);

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
      
      {/* タブ切り替え */}
      <Paper 
        elevation={0} 
        sx={{ 
          mt: 1,
          borderRadius: 2,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab 
            icon={<EventIcon />} 
            label="試験" 
            iconPosition="start"
            sx={{ borderRadius: 2 }}
          />
          <Tab 
            icon={<AssignmentIcon />} 
            label="レポート" 
            iconPosition="start"
            sx={{ borderRadius: 2 }}
          />
        </Tabs>
      </Paper>
    </Box>
  ), [sortedData, theme, title, tabValue]);

  // メモ化されたフッター部分
  const FooterSection = useMemo(() => (
    <Box sx={{ px: 2, py: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
        このウィジェットは各科目の{tabValue === 0 ? '試験日' : 'レポート締切日'}までの残り日数と進捗状況を表示しています。
        残り日数が7日以内の場合は赤色、8～14日の場合は黄色で表示されます。
      </Typography>
    </Box>
  ), [theme.palette.divider, tabValue]);

  // データがない場合のメッセージを表示
  if (!sortedData || sortedData.length === 0) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            表示するデータがありません。<br />
            科目を追加して{tabValue === 0 ? '試験日' : 'レポート締切日'}を設定しましょう。
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
          {groupedData.map((group, index) => (
            <Grid item xs={12} sm={12} md={6} key={`countdown-group-${index}`}>
              <GroupedCountdownItem date={group.date} items={group.items} />
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {FooterSection}
    </Box>
  );
});

export default CountdownContainer; 