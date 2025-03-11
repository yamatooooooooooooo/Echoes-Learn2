import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Grid,
  CircularProgress,
  Tooltip,
  Divider,
  Card,
  useTheme,
  Chip
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip as RechartsTooltip
} from 'recharts';
import { 
  CalendarToday as CalendarTodayIcon,
  Timeline as TimelineIcon,
  MenuBook as MenuBookIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Alarm as AlarmIcon,
  DateRange as DateRangeIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { NotionStyleCard } from '../../../components/common/NotionStyleCard';
import { ICONS } from '../../../../config/appIcons';
import { DataDisplay } from '../../../components/common/HierarchicalContent';
import { calculateDaysRemaining } from '../../../features/subject/utils/subjectUtils';
import { DailyQuota, WeeklyQuota } from '../../../../domain/models/QuotaModel';

export interface WeeklyProgressEntry {
  date: string;
  pagesRead: number;
  progressRate: number;
}

export interface StatsOverviewCardProps {
  totalSubjects: number;
  completedSubjects: number;
  totalPages: number;
  completedPages: number;
  inProgressSubjects: number;
  notStartedSubjects: number;
  weeklyProgressData: WeeklyProgressEntry[];
  dailyQuotas?: DailyQuota[]; // デイリーノルマ情報
  weeklyQuotas?: WeeklyQuota[]; // ウィークリーノルマ情報
  isLoading: boolean;
}

/**
 * 学習統計カード - 改善版
 * 学習状況を視覚的に表示し、必要な情報のみを効率的に伝える
 */
export const StatsOverviewCard: React.FC<StatsOverviewCardProps> = ({
  totalSubjects = 0,
  completedSubjects = 0,
  totalPages = 0,
  completedPages = 0,
  inProgressSubjects = 0,
  notStartedSubjects = 0,
  weeklyProgressData = [],
  dailyQuotas = [],
  weeklyQuotas = [],
  isLoading
}) => {
  const theme = useTheme();

  // 今日の日付をuseMemoでラップ
  const today = useMemo(() => new Date(), []);
  
  // 進捗率の計算
  const pageCompletionRate = useMemo(() => 
    totalPages > 0 ? Math.round((completedPages / totalPages) * 100) : 0
  , [totalPages, completedPages]);
  
  // 残りページ数
  const remainingPages = totalPages - completedPages;
  
  // 今日の日付の表示形式
  const formattedToday = useMemo(() => {
    return today.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'short'
    });
  }, [today]);
  
  // 週次データの処理と整形
  const formattedWeeklyData = useMemo(() => {
    if (!Array.isArray(weeklyProgressData) || weeklyProgressData.length === 0) {
      // データがない場合は過去7日間のダミーデータを作成
      return Array(7).fill(0).map((_, i) => {
        const date = new Date(today);  // todayを複製して使用
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' }),
          ページ数: 0
        };
      });
    }
    
    return weeklyProgressData.map(entry => {
      let dateObj;
      try {
        dateObj = new Date(entry.date);
        if (isNaN(dateObj.getTime())) {
          dateObj = new Date(today);  // todayを複製して使用
        }
      } catch (e) {
        dateObj = new Date(today);  // todayを複製して使用
      }
      
      return {
        date: dateObj.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' }),
        ページ数: entry.pagesRead || 0
      };
    });
  }, [weeklyProgressData, today]);
  
  // 科目状態の円グラフデータ
  const subjectStatusData = useMemo(() => [
    { name: '完了', value: completedSubjects, color: theme.palette.success.main },
    { name: '進行中', value: inProgressSubjects, color: theme.palette.primary.main },
    { name: '未開始', value: notStartedSubjects, color: theme.palette.grey[400] }
  ], [completedSubjects, inProgressSubjects, notStartedSubjects, theme]);
  
  // 1日あたりの必要ページ数（推定）
  const pagesPerDay = useMemo(() => {
    if (remainingPages <= 0) return 0;
    
    // 今日のノルマの合計ページ数を計算（データがあれば）
    if (Array.isArray(dailyQuotas) && dailyQuotas.length > 0) {
      // 各科目のノルマページ数を合計
      return dailyQuotas.reduce((sum, quota) => sum + (quota.pages || 0), 0);
    }
    
    // ノルマデータがない場合は残りページの1/7を目安とする（1週間で完了と仮定）
    return Math.ceil(remainingPages / 7);
  }, [remainingPages, dailyQuotas]);
  
  // デイリーノルマの達成状況
  const dailyQuotaStats = useMemo(() => {
    if (!Array.isArray(dailyQuotas) || dailyQuotas.length === 0) return { total: 0, completed: 0, rate: 0 };
    
    const total = dailyQuotas.length;
    const completed = dailyQuotas.filter(quota => quota.isCompleted).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, rate };
  }, [dailyQuotas]);

  // ウィークリーノルマの達成状況
  const weeklyQuotaStats = useMemo(() => {
    if (!Array.isArray(weeklyQuotas) || weeklyQuotas.length === 0) return { total: 0, completed: 0, rate: 0 };
    
    const total = weeklyQuotas.length;
    const completed = weeklyQuotas.filter(quota => quota.isCompleted).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, rate };
  }, [weeklyQuotas]);
  
  // 科目の進捗状態のラベル取得
  const getSubjectStatusLabel = (completed: number, total: number) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    if (percentage === 100) return '完了';
    if (percentage >= 75) return '順調';
    if (percentage >= 50) return '進行中';
    if (percentage >= 25) return '開始済み';
    if (percentage > 0) return '初期段階';
    return '未開始';
  };
  
  // 進捗率に応じた色
  const getProgressColor = (progress: number) => {
    if (progress >= 100) return theme.palette.success.main;
    if (progress >= 75) return theme.palette.success.light;
    if (progress >= 50) return theme.palette.primary.main;
    if (progress >= 25) return theme.palette.primary.light;
    if (progress > 0) return theme.palette.warning.main;
    return theme.palette.grey[400];
  };
  
  // ローディング中表示
  if (isLoading) {
    return (
      <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
        <Box display="flex" alignItems="center" justifyContent="center" p={3} minHeight={300}>
          <CircularProgress />
        </Box>
      </Card>
    );
  }

  return (
    <NotionStyleCard title="学習統計">
      <Grid container spacing={3}>
        {/* 左側カラム：科目と進捗率の概要 */}
        <Grid item xs={12} md={6}>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* 現在の日付表示 */}
            <Box>
              <Box display="flex" alignItems="center" mb={2}>
                <CalendarTodayIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="500">
                  {formattedToday}
                </Typography>
              </Box>
            </Box>
          
            {/* ページ進捗の概要 */}
            <Box>
              <Box display="flex" alignItems="center" mb={1}>
                <MenuBookIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="500">ページ進捗</Typography>
              </Box>
              
              <Box display="flex" mb={1}>
                <Box width="100%" pr={2}>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    学習済み / 全体
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {completedPages} / {totalPages}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold" 
                      color={getProgressColor(pageCompletionRate)}
                      mr={1}
                    >
                      {pageCompletionRate}%
                    </Typography>
                    <Tooltip title={`残り ${remainingPages} ページ`}>
                      <Box width="100%">
                        <LinearProgress 
                          variant="determinate" 
                          value={pageCompletionRate} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            backgroundColor: theme.palette.grey[200],
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getProgressColor(pageCompletionRate),
                              borderRadius: 4
                            }
                          }}
                        />
                      </Box>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            </Box>
            
            {/* ノルマ達成状況 */}
            <Box mt={3}>
              <Box display="flex" alignItems="center" mb={1}>
                <DateRangeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="500">ノルマ達成状況</Typography>
              </Box>
              
              <Grid container spacing={2}>
                {/* デイリーノルマ */}
                <Grid item xs={6}>
                  <Box 
                    p={2} 
                    bgcolor="background.default" 
                    borderRadius={2}
                    border="1px solid"
                    borderColor="divider"
                    height="100%"
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      今日のノルマ
                    </Typography>
                    <Box display="flex" alignItems="baseline" mb={1}>
                      <Typography variant="h5" fontWeight="bold" color={getProgressColor(dailyQuotaStats.rate)}>
                        {dailyQuotaStats.completed}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" ml={0.5}>
                        / {dailyQuotaStats.total} 科目
                      </Typography>
                    </Box>
                    
                    {pagesPerDay > 0 && (
                      <Box mt={1} mb={1.5}>
                        <Typography variant="body2" color="text.secondary">
                          今日のノルマページ数: <strong>{pagesPerDay}</strong> ページ
                        </Typography>
                      </Box>
                    )}
                    
                    <LinearProgress 
                      variant="determinate" 
                      value={dailyQuotaStats.rate} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getProgressColor(dailyQuotaStats.rate),
                          borderRadius: 3
                        }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" display="block" mt={0.5} textAlign="right">
                      {dailyQuotaStats.rate}% 達成
                    </Typography>
                  </Box>
                </Grid>
                
                {/* ウィークリーノルマ */}
                <Grid item xs={6}>
                  <Box 
                    p={2} 
                    bgcolor="background.default" 
                    borderRadius={2}
                    border="1px solid"
                    borderColor="divider"
                    height="100%"
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      今週のノルマ
                    </Typography>
                    <Box display="flex" alignItems="baseline" mb={1}>
                      <Typography variant="h5" fontWeight="bold" color={getProgressColor(weeklyQuotaStats.rate)}>
                        {weeklyQuotaStats.completed}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" ml={0.5}>
                        / {weeklyQuotaStats.total} 科目
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={weeklyQuotaStats.rate} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getProgressColor(weeklyQuotaStats.rate),
                          borderRadius: 3
                        }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" display="block" mt={0.5} textAlign="right">
                      {weeklyQuotaStats.rate}% 達成
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
            
            {/* 科目の状態 */}
            <Box>
              <Box display="flex" alignItems="center" mb={1}>
                <AssessmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="500">科目状態</Typography>
              </Box>
              
              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="space-between"
                mb={2}
              >
                <Typography variant="body1">
                  全 {totalSubjects} 科目
                </Typography>
                <Box>
                  <Chip 
                    icon={<CheckCircleIcon fontSize="small" />} 
                    label={`${getSubjectStatusLabel(completedPages, totalPages)}`} 
                    size="small"
                    sx={{ 
                      fontWeight: 'medium', 
                      bgcolor: getProgressColor(pageCompletionRate),
                      color: 'white'
                    }}
                  />
                </Box>
              </Box>
              
              <Box height={180}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      labelLine={false}
                      label={({ name, value, percent }) => 
                        percent > 0.05 ? `${name} ${value}科目` : ''
                      }
                    >
                      {subjectStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value, name) => [`${value}科目`, name]}
                      contentStyle={{ 
                        borderRadius: 8, 
                        border: 'none', 
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Box>
        </Grid>
        
        {/* 右側カラム：週間学習進捗グラフ */}
        <Grid item xs={12} md={6}>
          <Box display="flex" flexDirection="column" height="100%">
            <Box display="flex" alignItems="center" mb={1}>
              <TimelineIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="500">週間学習進捗</Typography>
            </Box>
            
            <Box 
              flex={1} 
              display="flex" 
              flexDirection="column" 
              justifyContent="space-between"
              minHeight={300}
            >
              <Box height="100%" mt={2}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formattedWeeklyData} margin={{ top: 20, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                      tickLine={false}
                      axisLine={{ stroke: theme.palette.divider }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                      tickLine={false}
                      axisLine={{ stroke: theme.palette.divider }}
                      label={{ 
                        value: 'ページ数', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { 
                          textAnchor: 'middle',
                          fill: theme.palette.text.secondary,
                          fontSize: 12
                        }
                      }}
                    />
                    <RechartsTooltip 
                      formatter={(value) => [`${value} ページ`, '学習量']}
                      contentStyle={{ 
                        borderRadius: 8, 
                        border: 'none', 
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
                      }}
                    />
                    <Bar 
                      dataKey="ページ数" 
                      fill={theme.palette.primary.main}
                      radius={[4, 4, 0, 0]}
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              
              <Box 
                mt={2} 
                p={2} 
                bgcolor="background.default" 
                borderRadius={2}
                border="1px solid"
                borderColor="divider"
              >
                <Box display="flex" alignItems="center" mb={1}>
                  <TrendingUpIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
                  <Typography variant="subtitle2" fontWeight="medium" color="text.primary">
                    効率的な学習のヒント
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {completedPages > 0 && pageCompletionRate < 50
                    ? '残りページ数が多いので、毎日少しずつコンスタントに学習しましょう。'
                    : pageCompletionRate >= 50 && pageCompletionRate < 90
                      ? 'ここまで順調に進んでいます。このペースを維持しましょう！'
                      : pageCompletionRate >= 90 && pageCompletionRate < 100
                        ? 'もう少しで完了です！最後まで集中して仕上げましょう。'
                        : pageCompletionRate === 100
                          ? '全課題完了おめでとうございます！復習も大切です。'
                          : '学習を始めましょう。小さな一歩から大きな成果につながります。'
                  }
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </NotionStyleCard>
  );
}; 