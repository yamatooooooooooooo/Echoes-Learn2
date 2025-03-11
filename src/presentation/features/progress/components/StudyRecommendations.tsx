import React, { useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  useTheme,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Chip,
  Alert,
  Link,
  LinearProgress
} from '@mui/material';
import AlarmIcon from '@mui/icons-material/Alarm';
import TimerIcon from '@mui/icons-material/Timer';
import DateRangeIcon from '@mui/icons-material/DateRange';
import TodayIcon from '@mui/icons-material/Today';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SpeedIcon from '@mui/icons-material/Speed';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SchoolIcon from '@mui/icons-material/School';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import { Subject } from '../../../../domain/models/SubjectModel';
import { Progress } from '../../../../domain/models/ProgressModel';
import { SubjectPerformance } from '../../../../domain/models/StudyAnalyticsModel';

interface StudyRecommendationsProps {
  subjectPerformances: SubjectPerformance[];
  subjects: Subject[];
  progressData: Progress[];
}

/**
 * 学習レコメンデーションコンポーネント
 */
export const StudyRecommendations: React.FC<StudyRecommendationsProps> = ({ 
  subjectPerformances, 
  subjects, 
  progressData 
}) => {
  const theme = useTheme();
  
  // 科目ごとのパフォーマンスデータの準備
  const subjectData = useMemo(() => {
    // 科目IDをキーにしたマップを作成
    const subjectMap = new Map<string, Subject>();
    subjects.forEach(subject => {
      subjectMap.set(subject.id, subject);
    });
    
    // 性能データを科目情報と組み合わせる
    return subjectPerformances.map(perf => {
      const subject = subjectMap.get(perf.subjectId);
      
      // 試験日までの残り日数を計算
      let remainingDays = 0;
      let timeUntilDeadline = '';
      if (subject?.examDate) {
        const examDate = new Date(subject.examDate);
        const today = new Date();
        const diffTime = examDate.getTime() - today.getTime();
        remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (remainingDays > 30) {
          timeUntilDeadline = `${Math.floor(remainingDays / 30)}ヶ月${remainingDays % 30}日`;
        } else if (remainingDays > 0) {
          timeUntilDeadline = `${remainingDays}日`;
        } else {
          timeUntilDeadline = '期限切れ';
        }
      }
      
      // 残りページ数と学習ペースを計算
      const totalPages = subject?.totalPages || 0;
      const currentPage = subject?.currentPage || 0;
      const remainingPages = Math.max(0, totalPages - currentPage);
      
      let recommendedPagesPerDay = 0;
      if (remainingDays > 0 && remainingPages > 0) {
        recommendedPagesPerDay = Math.ceil(remainingPages / remainingDays);
      }
      
      return {
        ...perf,
        subjectName: subject?.name || perf.name,
        examDate: subject?.examDate,
        remainingDays,
        timeUntilDeadline,
        totalPages,
        currentPage,
        remainingPages,
        recommendedPagesPerDay,
        dailyStudyTime: perf.recommendedStudyTime || 0,
        priority: calculatePriority(remainingDays, perf.progress || 0)
      };
    });
  }, [subjectPerformances, subjects]);
  
  // 優先度の高い科目（試験日が近く、進捗が低い）
  const prioritySubjects = useMemo(() => {
    return [...subjectData]
      .filter(s => s.remainingDays > 0) // 試験日がある科目のみ
      .sort((a, b) => {
        // 優先度が高い順、同じ場合は残り日数が少ない順
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return a.remainingDays - b.remainingDays;
      })
      .slice(0, 3); // 上位3つ
  }, [subjectData]);
  
  // 進捗が遅れている科目
  const behindScheduleSubjects = useMemo(() => {
    return subjectData
      .filter(s => {
        // 進捗率と経過期間の比率で判断
        if (!s.examDate) return false;
        
        const examDate = new Date(s.examDate);
        const today = new Date();
        const originalTimespan = examDate.getTime() - new Date(s.lastStudied).getTime();
        const elapsedTimespan = today.getTime() - new Date(s.lastStudied).getTime();
        
        if (originalTimespan <= 0) return false;
        
        // 時間の経過率
        const timeElapsedRatio = elapsedTimespan / originalTimespan;
        // 理想的な進捗率
        const idealProgress = Math.min(100, timeElapsedRatio * 100);
        
        return (s.progress || 0) < idealProgress - 10; // 10%以上遅れている場合
      })
      .slice(0, 3);
  }, [subjectData]);
  
  // 今日の学習推奨
  const todayRecommendations = useMemo(() => {
    if (prioritySubjects.length === 0) {
      return [
        {
          subject: '科目を追加',
          pages: 0,
          time: 0,
          reason: '科目と試験日を設定して、最適な学習計画を立てましょう'
        }
      ];
    }
    
    return prioritySubjects
      .slice(0, 3)
      .map(subject => ({
        subject: subject.subjectName,
        pages: subject.recommendedPagesPerDay,
        time: subject.dailyStudyTime,
        reason: getPriorityReason(subject)
      }));
  }, [prioritySubjects]);
  
  // 総合学習推奨時間
  const totalRecommendedTime = useMemo(() => {
    return todayRecommendations.reduce((sum, rec) => sum + rec.time, 0);
  }, [todayRecommendations]);
  
  // 最適な時間帯
  // 実際のデータから学習効率が高い時間帯を特定するロジックを実装できます
  const optimalTimeOfDay = useMemo(() => {
    // 仮のロジック：朝か夕方を推奨
    const now = new Date();
    const hour = now.getHours();
    
    if (hour < 12) {
      return {
        name: '午前中 (9-12時)',
        reason: '朝は集中力が高まりやすく、新しい情報の吸収に最適な時間帯です。',
        icon: <WatchLaterIcon />
      };
    } else if (hour < 17) {
      return {
        name: '夕方 (17-20時)',
        reason: '一日の業務や授業が終わった後のリラックスした時間帯に学習すると定着率が高まります。',
        icon: <WatchLaterIcon />
      };
    } else {
      return {
        name: '午後 (12-17時)',
        reason: '午後は情報の整理と復習に適した時間帯です。',
        icon: <WatchLaterIcon />
      };
    }
  }, []);
  
  // 学習テクニック提案
  const studyTechniques = useMemo(() => {
    // 進捗状況や学習パターンに基づいて異なる技術を提案
    return [
      {
        title: 'ポモドーロテクニック',
        description: '25分の集中学習と5分の休憩を交互に行い、4セット後に長めの休憩を取ります。',
        icon: <TimerIcon />
      },
      {
        title: 'アクティブリコール',
        description: '読んだ内容について、本を閉じて思い出しながらノートを取ることで記憶の定着率が向上します。',
        icon: <MenuBookIcon />
      },
      {
        title: 'スペーシング効果',
        description: '同じ内容を時間をおいて複数回学習することで、長期記憶への定着率が高まります。',
        icon: <DateRangeIcon />
      }
    ];
  }, []);
  
  // 優先度の計算（0-10のスケール）
  function calculatePriority(remainingDays: number, progress: number): number {
    if (remainingDays <= 0) return 0; // 期限切れは優先度0
    
    // 残り日数が少ないほど優先度が高い
    let daysFactor = 0;
    if (remainingDays <= 7) {
      daysFactor = 5; // 一週間以内は最大
    } else if (remainingDays <= 14) {
      daysFactor = 4;
    } else if (remainingDays <= 30) {
      daysFactor = 3;
    } else if (remainingDays <= 60) {
      daysFactor = 2;
    } else {
      daysFactor = 1;
    }
    
    // 進捗が少ないほど優先度が高い
    let progressFactor = 0;
    if (progress < 20) {
      progressFactor = 5; // 進捗20%未満は最大
    } else if (progress < 40) {
      progressFactor = 4;
    } else if (progress < 60) {
      progressFactor = 3;
    } else if (progress < 80) {
      progressFactor = 2;
    } else {
      progressFactor = 1;
    }
    
    return daysFactor + progressFactor;
  }
  
  // 優先理由の取得
  function getPriorityReason(subject: any): string {
    if (subject.remainingDays <= 7) {
      return `試験まで残り${subject.timeUntilDeadline}しかありません。`;
    }
    
    if ((subject.progress || 0) < 30) {
      return `進捗率が${subject.progress || 0}%と低く、残り${subject.remainingPages}ページあります。`;
    }
    
    if (subject.recommendedPagesPerDay > 20) {
      return `試験に間に合わせるには1日${subject.recommendedPagesPerDay}ページの学習が必要です。`;
    }
    
    return `最適な学習ペースを維持するために推奨されています。`;
  }
  
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 2, 
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              mb: { xs: 3, md: 0 }
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <TodayIcon sx={{ mr: 1 }} />
              今日の学習推奨
            </Typography>
            
            {prioritySubjects.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                科目と試験日を設定すると、個別の学習推奨が表示されます。
              </Alert>
            ) : (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" paragraph>
                  あなたの学習の進捗状況と試験日までの期間に基づいた今日の推奨学習計画です。
                </Typography>
              </Box>
            )}
            
            <List>
              {todayRecommendations.map((rec, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      <MenuBookIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1" component="span">
                            {rec.subject}
                          </Typography>
                          {rec.pages > 0 && (
                            <Chip
                              size="small"
                              label={`${rec.pages}ページ`}
                              color="primary"
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          )}
                          {rec.time > 0 && (
                            <Chip
                              size="small"
                              label={`${rec.time}分`}
                              color="secondary"
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {rec.reason}
                        </Typography>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
            
            {prioritySubjects.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AlarmIcon color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">
                    最適な学習時間帯
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                  <Box sx={{ mr: 2 }}>
                    {optimalTimeOfDay.icon}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2">
                      {optimalTimeOfDay.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {optimalTimeOfDay.reason}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SpeedIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">
                    推奨総学習時間: {totalRecommendedTime}分
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<CheckCircleOutlineIcon />}
                    size="small"
                  >
                    学習開始
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<ScheduleIcon />}
                    size="small"
                  >
                    カレンダーに追加
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 2, 
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              mb: 3
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon sx={{ mr: 1 }} />
              注意が必要な科目
            </Typography>
            
            {behindScheduleSubjects.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                現在、進捗が遅れている科目はありません。
              </Typography>
            ) : (
              <List>
                {behindScheduleSubjects.map((subject, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <SchoolIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={subject.subjectName}
                      secondary={
                        <>
                          <Typography variant="body2" component="span" color="text.secondary">
                            進捗: {subject.progress || 0}% / 残り: {subject.timeUntilDeadline}
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={subject.progress || 0} 
                            sx={{ 
                              mt: 1, 
                              height: 4, 
                              borderRadius: 2 
                            }} 
                            color="warning"
                          />
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
          
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 2, 
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <LightbulbIcon sx={{ mr: 1 }} />
              効果的な学習テクニック
            </Typography>
            
            <List>
              {studyTechniques.map((technique, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemIcon>
                      {technique.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2">
                          {technique.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {technique.description}
                        </Typography>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
            
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Link 
                href="#" 
                underline="hover"
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
              >
                <LocalLibraryIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                <Typography variant="body2">
                  もっと学習テクニックを見る
                </Typography>
              </Link>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 