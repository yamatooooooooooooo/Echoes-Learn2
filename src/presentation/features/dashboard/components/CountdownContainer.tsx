import React, { useMemo, useCallback, useState } from 'react';
import { Box, Grid, Typography, Card, CardContent, useTheme, Chip, Tabs, Tab, Paper, Divider, LinearProgress, IconButton, Collapse } from '@mui/material';
import { Assignment as AssignmentIcon, Event as EventIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import CountdownPieChart from './CountdownPieChart';
import { CountdownData } from '../../../../domain/services/visualizationService';
import { Subject } from '../../../../domain/models/SubjectModel';
import { differenceInDays, format } from 'date-fns';

interface CountdownContainerProps {
  data?: CountdownData[];
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
  const [expanded, setExpanded] = useState(items.length <= 3 || items.some(item => item.remainingDays <= 3));
  
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

  // 科目リストの折りたたみを切り替え
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

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
      overflow: 'hidden',
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
      
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
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
        <Divider sx={{ mb: 1 }} />
        <Box>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 1 
          }}>
            <Typography variant="subtitle2">
              科目 ({items.length})
            </Typography>
            {items.length > 3 && (
              <IconButton 
                size="small" 
                onClick={toggleExpanded}
                sx={{ 
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}
              >
                <ExpandMoreIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          
          <Box sx={{ maxHeight: expanded ? '300px' : '150px', overflowY: 'auto', pr: 1 }}>
            {(expanded ? items : items.slice(0, 3)).map((item, idx) => (
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
            {!expanded && items.length > 3 && (
              <Box sx={{ 
                textAlign: 'center',
                mt: 1,
                pt: 1,
                borderTop: `1px dashed ${theme.palette.divider}`,
                color: theme.palette.text.secondary
              }}>
                <Typography variant="caption">
                  他 {items.length - 3} 件...
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
});

/**
 * 複数の試験準備カウントダウンウィジェットを表示するコンテナコンポーネント
 */
const CountdownContainer = React.memo(({ data, title = "カウントダウン", includeReportDeadlines = false, subjects = [] }: CountdownContainerProps) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  // データを生成
  const generatedData = useMemo(() => {
    if (data) return data;
    
    if (includeReportDeadlines) {
      return createReportDeadlineCountdownData(subjects);
    } else {
      // 試験日カウントダウンのデータを生成
      if (!subjects || subjects.length === 0) return [];
  
      const today = new Date();
      const result: CountdownData[] = [];
      
      subjects.forEach(subject => {
        // 試験日がある科目のみ処理
        if (subject.examDate) {
          const dueDate = new Date(subject.examDate);
          const remainingDays = Math.max(0, differenceInDays(dueDate, today));
          
          // 進捗率を計算
          const progress = subject.totalPages > 0 
            ? Math.round((subject.currentPage / subject.totalPages) * 100) 
            : 0;
          
          result.push({
            subject: subject.name,
            dueDate,
            remainingDays,
            progressData: [
              { name: '完了', value: progress },
              { name: '未完了', value: 100 - progress }
            ]
          });
        }
      });
      
      return result;
    }
  }, [data, subjects, includeReportDeadlines]);

  // ソート済みデータ
  const sortedData = useMemo(() => {
    if (!generatedData || generatedData.length === 0) return [];
    return [...generatedData].sort((a, b) => a.remainingDays - b.remainingDays);
  }, [generatedData]);

  // タブの切り替え処理
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 表示するデータ（タブに応じて切り替え）
  const displayData = useMemo(() => {
    return tabValue === 0 ? sortedData : sortedData.filter(item => item.isReport);
  }, [tabValue, sortedData]);

  // 同じ日付のアイテムをグループ化
  const groupedData = useMemo(() => {
    const groups = new Map<string, CountdownData[]>();
    
    displayData.forEach(item => {
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
  }, [displayData]);

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
      {includeReportDeadlines && subjects && subjects.length > 0 && (
        <Paper 
          elevation={0} 
          sx={{ 
            mt: 1,
            borderRadius: 16,
            overflow: 'hidden',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            border: '1px solid',
            borderColor: theme.palette.divider
          }}
        >
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{
              minHeight: '36px',
              '.MuiTab-root': { 
                minHeight: '36px',
                py: 0.5,
                px: 2
              }
            }}
          >
            <Tab 
              icon={<EventIcon fontSize="small" />} 
              label="試験" 
              iconPosition="start"
              sx={{ 
                borderRadius: 16,
                fontSize: '0.825rem',
                fontWeight: tabValue === 0 ? 'bold' : 'normal',
              }}
            />
            <Tab 
              icon={<AssignmentIcon fontSize="small" />} 
              label="レポート" 
              iconPosition="start"
              sx={{ 
                borderRadius: 16,
                fontSize: '0.825rem',
                fontWeight: tabValue === 1 ? 'bold' : 'normal',
              }}
            />
          </Tabs>
        </Paper>
      )}
    </Box>
  ), [sortedData, theme, title, tabValue, handleTabChange, includeReportDeadlines, subjects]);

  // メモ化されたフッター部分
  const FooterSection = useMemo(() => (
    <Box sx={{ px: 2, py: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
      </Typography>
    </Box>
  ), [theme.palette.divider, tabValue]);

  // データがない場合のメッセージを表示
  if (!sortedData || sortedData.length === 0) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" color="text.secondary" textAlign="center">
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {HeaderSection}
      
      <Box sx={{ flexGrow: 1, px: 2, pb: 2, overflowY: 'auto' }}>
        <Grid container spacing={3}>
          {groupedData.map((group, index) => (
            <Grid item xs={12} sm={6} md={4} lg={4} key={`countdown-group-${index}`}>
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