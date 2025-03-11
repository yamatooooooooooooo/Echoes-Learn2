import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Paper,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  Card,
  CardHeader,
  CardContent,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { NotionStyleCard } from '../../../components/common/NotionStyleCard';
import { ICONS } from '../../../../config/appIcons';
import { InfoSection } from '../../../components/common/HierarchicalContent';
import { StudySession, SubjectPerformance } from '../../../../domain/models/StudyAnalyticsModel';
import { 
  touchFriendlyStyles, 
  responsiveTextStyles
} from '../../../styles/responsiveStyles';

// タブパネルコンポーネント
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// 分析カードのプロパティ
interface LearningAnalyticsCardProps {
  studySessions: StudySession[];
  subjectPerformances: SubjectPerformance[];
  isLoading: boolean;
}

const TIME_OF_DAY = ['朝 (5-9時)', '午前 (9-12時)', '午後 (12-17時)', '夕方 (17-20時)', '夜 (20-24時)', '深夜 (0-5時)'];

// オブジェクト指定の型エラーを回避するため、定数として定義
const CHART_MARGIN = { top: 5, right: 30, left: 20, bottom: 5 };
const SAFARI_CHART_MARGIN = { top: 5, right: 40, left: 10, bottom: 5 };

const CHART_HEIGHT = { height: 250, width: '100%' };

/**
 * 学習分析ダッシュボードカード
 */
export const LearningAnalyticsCard: React.FC<LearningAnalyticsCardProps> = ({
  studySessions = [],
  subjectPerformances = [],
  isLoading
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  // Safariとモバイルの検出
  const [isSafariOrIOS, setIsSafariOrIOS] = useState(false);

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase();
      const isSafari = ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      setIsSafariOrIOS(isSafari || isIOS);
    }
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    // タッチデバイスでの操作性向上のため、イベント伝播を停止
    if (_event) {
      _event.stopPropagation();
    }
    
    // レンダリングの優先度を上げるため、非同期でタブ切り替えを実行
    setTimeout(() => {
      setActiveTab(newValue);
    }, 0);
  };

  // 時間帯別効率の計算
  const timeOfDayEfficiency = useMemo(() => {
    return TIME_OF_DAY.map((timeSlot, index) => {
      const sessionsInTimeSlot = studySessions.filter(session => {
        const hour = new Date(session.startTime).getHours();
        if (index === 0) return hour >= 5 && hour < 9;
        if (index === 1) return hour >= 9 && hour < 12;
        if (index === 2) return hour >= 12 && hour < 17;
        if (index === 3) return hour >= 17 && hour < 20;
        if (index === 4) return hour >= 20 && hour < 24;
        return hour >= 0 && hour < 5;
      });
      
      const averageEfficiency = sessionsInTimeSlot.length > 0
        ? Math.round(sessionsInTimeSlot.reduce((sum, session) => sum + session.efficiency, 0) / sessionsInTimeSlot.length)
        : 0;
      
      return {
        name: timeSlot,
        効率: averageEfficiency
      };
    });
  }, [studySessions]);

  // 総学習時間の計算（時間単位）
  const totalHours = useMemo(() => {
    const totalMinutes = studySessions.reduce((sum, session) => {
      return sum + session.duration;
    }, 0);
    
    return Math.round(totalMinutes / 60);
  }, [studySessions]);

  // ブラウザに応じたチャートマージン
  const getChartMargin = useMemo(() => {
    return isSafariOrIOS ? SAFARI_CHART_MARGIN : CHART_MARGIN;
  }, [isSafariOrIOS]);

  // 科目別の効率と進捗
  const subjectEfficiency = useMemo(() => {
    return subjectPerformances.map(subject => ({
      name: subject.name,
      効率: subject.efficiency,
      進捗: subject.progress
    }));
  }, [subjectPerformances]);

  // 弱点と強みの抽出
  const strengthsAndWeaknesses = useMemo(() => {
    const strengths: { name: string; count: number }[] = [];
    const weaknesses: { name: string; count: number }[] = [];
    
    // 強みと弱点を集計
    subjectPerformances.forEach(subject => {
      subject.strengths.forEach(strength => {
        const existing = strengths.find(s => s.name === strength);
        if (existing) {
          existing.count += 1;
        } else {
          strengths.push({ name: strength, count: 1 });
        }
      });
      
      subject.weaknesses.forEach(weakness => {
        const existing = weaknesses.find(w => w.name === weakness);
        if (existing) {
          existing.count += 1;
        } else {
          weaknesses.push({ name: weakness, count: 1 });
        }
      });
    });
    
    // 出現回数でソート
    return {
      strengths: strengths.sort((a, b) => b.count - a.count).slice(0, 5),
      weaknesses: weaknesses.sort((a, b) => b.count - a.count).slice(0, 5)
    };
  }, [subjectPerformances]);

  // 最適な学習時間帯を算出
  const optimalStudyTimes = useMemo(() => {
    const sortedTimes = [...timeOfDayEfficiency].sort((a, b) => b.効率 - a.効率);
    return sortedTimes.filter(time => time.効率 > 0).slice(0, 3).map(time => time.name);
  }, [timeOfDayEfficiency]);

  // 学習推奨事項の生成
  const recommendations = useMemo(() => {
    const recs = [];
    
    // 最適な時間帯の提案
    if (optimalStudyTimes.length > 0) {
      recs.push(`最も効率が良いのは ${optimalStudyTimes[0]} です。可能であればこの時間帯に学習を集中させましょう。`);
    }
    
    // 弱点科目に関する提案
    if (subjectPerformances.length > 0) {
      const weakestSubject = [...subjectPerformances].sort((a, b) => a.efficiency - b.efficiency)[0];
      if (weakestSubject) {
        recs.push(`${weakestSubject.name} の効率が最も低くなっています。この科目により多くの時間を割きましょう。`);
      }
      
      // 長期間学習していない科目
      const neglectedSubjects = subjectPerformances.filter(s => {
        try {
          const lastStudied = new Date(s.lastStudied);
          const now = new Date();
          const daysSinceLastStudy = Math.floor((now.getTime() - lastStudied.getTime()) / (1000 * 60 * 60 * 24));
          return daysSinceLastStudy > 7; // 1週間以上学習していない
        } catch (e) {
          return false;
        }
      });
      
      if (neglectedSubjects.length > 0) {
        recs.push(`${neglectedSubjects.map(s => s.name).join('、')} は1週間以上学習していません。復習を推奨します。`);
      }
    }
    
    // 弱点に関する提案
    if (strengthsAndWeaknesses.weaknesses.length > 0) {
      recs.push(`最も改善が必要な分野: ${strengthsAndWeaknesses.weaknesses.slice(0, 3).map(w => w.name).join('、')}`);
    }
    
    return recs;
  }, [optimalStudyTimes, subjectPerformances, strengthsAndWeaknesses]);

  // ローディング中
  if (isLoading) {
    return (
      <NotionStyleCard title="学習分析">
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      </NotionStyleCard>
    );
  }

  // データが無い場合
  if (studySessions.length === 0 && subjectPerformances.length === 0) {
    return (
      <NotionStyleCard title="学習分析">
        <Box p={3} textAlign="center">
          <Typography color="textSecondary" gutterBottom>
            分析に必要なデータがまだ十分にありません
          </Typography>
          <Typography variant="body2" color="textSecondary">
            学習を記録して、より詳細な分析を見ることができます
          </Typography>
        </Box>
      </NotionStyleCard>
    );
  }

  // 学習分析カードのメインレイアウト
  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      borderRadius: 2,
      boxShadow: (theme) => theme.shadows[3]
    }}>
      <CardHeader
        title="学習分析"
        subheader="あなたの学習データから分析した統計情報"
        action={
          <IconButton aria-label="設定" size="large" sx={touchFriendlyStyles.mobileActionButton}>
            <SettingsIcon />
          </IconButton>
        }
      />
      <Divider />
      <CardContent sx={{ 
        flexGrow: 1, 
        padding: { xs: 1, sm: 2, md: 3 },
        overflow: 'auto'
      }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{
            mb: 2,
            '& .MuiTab-root': touchFriendlyStyles.touchableTab
          }}
        >
          <Tab label="概要" />
          <Tab label="詳細" />
        </Tabs>

        {activeTab === 0 ? (
          <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} alignItems="stretch">
            {/* 総学習時間 */}
            <Grid item xs={12} sm={6} md={3}>
              <InfoSection
                title="総学習時間"
                icon={ICONS.time}
                importance="primary"
              >
                <Typography variant="h4" sx={{
                  ...responsiveTextStyles.header,
                  fontWeight: 'bold',
                  color: theme.palette.primary.main
                }}>
                  {totalHours}時間
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  過去30日間
                </Typography>
              </InfoSection>
            </Grid>

            {/* 時間帯別効率グラフ */}
            <Grid item xs={12} sm={6} md={3}>
              <InfoSection 
                title="時間帯別学習効率" 
                icon={ICONS.schedule}
                bordered
                importance="primary"
              >
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  どの時間帯に最も効率よく学習できているかを示しています
                </Typography>
                <Box sx={CHART_HEIGHT}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={timeOfDayEfficiency}
                      margin={getChartMargin}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis 
                        dataKey="name"
                        tick={{ 
                          fontSize: isSafariOrIOS ? 9 : 11,
                          fill: theme.palette.text.secondary 
                        }}
                        tickMargin={isSafariOrIOS ? 8 : 5}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        tick={{ fontSize: isSafariOrIOS ? 10 : 12 }}
                      />
                      <RechartsTooltip 
                        formatter={(value) => [`${value}%`, '効率']}
                        // Safariでのツールチップ位置調整
                        offset={isSafariOrIOS ? 10 : 5}
                      />
                      <Bar 
                        dataKey="効率" 
                        fill={theme.palette.primary.main} 
                        // Safariでのアニメーションを調整
                        animationDuration={isSafariOrIOS ? 500 : 300}
                        animationBegin={isSafariOrIOS ? 100 : 0}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  最適な学習時間帯: {optimalStudyTimes.length > 0 ? optimalStudyTimes.join('、') : 'データ不足'}
                </Typography>
              </InfoSection>
            </Grid>

            {/* 科目別効率 */}
            <Grid item xs={12} sm={6} md={3}>
              <InfoSection 
                title="科目別効率・進捗" 
                icon={ICONS.subject}
                bordered
                importance="primary"
              >
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  各科目の効率と進捗状況の比較
                </Typography>
                <Box sx={CHART_HEIGHT}>
                  {subjectEfficiency.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart 
                        outerRadius={90} 
                        data={subjectEfficiency}
                        margin={getChartMargin}
                      >
                        <PolarGrid stroke={theme.palette.divider} />
                        <PolarAngleAxis 
                          dataKey="name" 
                          tick={{ 
                            fontSize: isSafariOrIOS ? 9 : 11,
                            fill: theme.palette.text.secondary 
                          }} 
                        />
                        <PolarRadiusAxis domain={[0, 100]} />
                        <Radar 
                          name="効率" 
                          dataKey="効率" 
                          stroke={theme.palette.primary.main} 
                          fill={theme.palette.primary.main} 
                          fillOpacity={0.6} 
                        />
                        <Radar 
                          name="進捗" 
                          dataKey="進捗" 
                          stroke={theme.palette.secondary.main} 
                          fill={theme.palette.secondary.main} 
                          fillOpacity={0.6} 
                        />
                        <Legend 
                          iconSize={10} 
                          wrapperStyle={{ fontSize: isSafariOrIOS ? 10 : 12 }} 
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'text.secondary',
                        border: '1px dashed',
                        borderColor: 'divider',
                        borderRadius: 1
                      }}
                    >
                      <Typography variant="body2">
                        表示するデータがありません
                      </Typography>
                    </Box>
                  )}
                </Box>
              </InfoSection>
            </Grid>

            {/* 弱点と強み */}
            <Grid item xs={12} sm={6} md={3}>
              <InfoSection 
                title="強み・弱点" 
                icon={ICONS.strength}
                bordered
                importance="primary"
              >
                <List dense>
                  {strengthsAndWeaknesses.strengths.map((strength, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <TrendingUpIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={strength.name} 
                        secondary={`${strength.count}つの科目で強みと評価されています`} 
                      />
                    </ListItem>
                  ))}
                  {strengthsAndWeaknesses.strengths.length === 0 && (
                    <ListItem>
                      <ListItemText primary="まだデータが十分ではありません" />
                    </ListItem>
                  )}
                </List>
              </InfoSection>
            </Grid>

            {/* 弱点と強み */}
            <Grid item xs={12} sm={6} md={3}>
              <InfoSection 
                title="強み・弱点" 
                icon={ICONS.weakness}
                bordered
                importance="primary"
              >
                <List dense>
                  {strengthsAndWeaknesses.weaknesses.map((weakness, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <TrendingDownIcon color="error" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={weakness.name} 
                        secondary={`${weakness.count}つの科目で弱点と評価されています`} 
                      />
                    </ListItem>
                  ))}
                  {strengthsAndWeaknesses.weaknesses.length === 0 && (
                    <ListItem>
                      <ListItemText primary="まだデータが十分ではありません" />
                    </ListItem>
                  )}
                </List>
              </InfoSection>
            </Grid>
          </Grid>
        ) : (
          // タブレット向けにレイアウトを最適化
          <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} alignItems="stretch">
            <Grid item xs={12}>
              <InfoSection
                title="時間帯別詳細データ"
                icon={ICONS.details}
                bordered
                importance="secondary"
              >
                <TableContainer 
                  component={Paper} 
                  sx={{ 
                    maxHeight: { xs: 300, sm: 400, md: 500 },
                    overflowY: 'auto',
                    '& .MuiTableCell-root': {
                      padding: { xs: '8px 6px', sm: '16px 8px', md: '16px' }
                    }
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>時間帯</TableCell>
                        <TableCell>学習時間</TableCell>
                        <TableCell>効率</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {timeOfDayEfficiency.map((data, index) => (
                        <TableRow key={index}>
                          <TableCell>{data.name}</TableCell>
                          <TableCell>{data.効率}%</TableCell>
                          <TableCell>{data.効率}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </InfoSection>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}; 