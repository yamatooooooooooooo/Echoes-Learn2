import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  useTheme,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Badge,
  Divider,
  Tooltip
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TimerIcon from '@mui/icons-material/Timer';
import BookIcon from '@mui/icons-material/Book';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { Subject } from '../../../../domain/models/SubjectModel';
import { Progress } from '../../../../domain/models/ProgressModel';
import { StudySession } from '../../../../domain/models/StudyAnalyticsModel';

interface AchievementTrackerProps {
  progressData: Progress[];
  subjects: Subject[];
  studySessions: StudySession[];
}

// 達成項目の定義
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  isUnlocked: boolean;
  progress: number; // 0-100
  date?: string;
  category: 'milestone' | 'habit' | 'special';
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
}

// 学習レベルの定義
interface StudyLevel {
  level: number;
  title: string;
  requiredPoints: number;
  color: string;
}

/**
 * 学習達成トラッカーコンポーネント
 */
export const AchievementTracker: React.FC<AchievementTrackerProps> = ({ 
  progressData, 
  subjects, 
  studySessions 
}) => {
  const theme = useTheme();
  
  // 学習レベルの定義
  const studyLevels: StudyLevel[] = [
    { level: 1, title: '学習の始まり', requiredPoints: 0, color: '#CD7F32' },
    { level: 2, title: '知識の探求者', requiredPoints: 100, color: '#CD7F32' },
    { level: 3, title: '勤勉な読者', requiredPoints: 250, color: '#CD7F32' },
    { level: 4, title: '情報収集家', requiredPoints: 500, color: '#C0C0C0' },
    { level: 5, title: '知識の番人', requiredPoints: 750, color: '#C0C0C0' },
    { level: 6, title: '学習マスター', requiredPoints: 1000, color: '#C0C0C0' },
    { level: 7, title: '知識の探究者', requiredPoints: 1500, color: '#FFD700' },
    { level: 8, title: '学術の賢者', requiredPoints: 2000, color: '#FFD700' },
    { level: 9, title: '卓越した学者', requiredPoints: 3000, color: '#FFD700' },
    { level: 10, title: '究極の知識人', requiredPoints: 5000, color: '#E5E4E2' }
  ];

  // 達成状況を計算
  const achievements = useMemo(() => {
    // 総学習ページ数
    const totalPagesRead = progressData.reduce((sum, p) => sum + (p.pagesRead || 0), 0);
    
    // 学習日数
    const uniqueDates = new Set(progressData.map(p => p.recordDate)).size;
    
    // 連続学習日数（現在のストリーク）
    const studyStreak = calculateStudyStreak(progressData);
    
    // 総学習時間
    const totalStudyTime = studySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    
    // 科目カバー率（少なくとも1ページ以上読んだ科目の割合）
    const subjectsWithProgress = new Set(progressData.map(p => p.subjectId)).size;
    const subjectCoverageRate = Math.round((subjectsWithProgress / Math.max(1, subjects.length)) * 100);
    
    // 達成項目の定義と判定
    const achievementList: Achievement[] = [
      // マイルストーン系
      {
        id: 'pages_100',
        title: '初めの一歩',
        description: '累計100ページを学習',
        icon: <BookIcon />,
        color: '#CD7F32',
        isUnlocked: totalPagesRead >= 100,
        progress: Math.min(100, Math.round(totalPagesRead / 100 * 100)),
        category: 'milestone',
        level: 'bronze',
        points: 50
      },
      {
        id: 'pages_500',
        title: '知識の探究者',
        description: '累計500ページを学習',
        icon: <BookIcon />,
        color: '#C0C0C0',
        isUnlocked: totalPagesRead >= 500,
        progress: Math.min(100, Math.round(totalPagesRead / 500 * 100)),
        category: 'milestone',
        level: 'silver',
        points: 100
      },
      {
        id: 'pages_1000',
        title: '情熱の読書家',
        description: '累計1000ページを学習',
        icon: <BookIcon />,
        color: '#FFD700',
        isUnlocked: totalPagesRead >= 1000,
        progress: Math.min(100, Math.round(totalPagesRead / 1000 * 100)),
        category: 'milestone',
        level: 'gold',
        points: 200
      },
      {
        id: 'study_days_10',
        title: '学習習慣の始まり',
        description: '10日間学習',
        icon: <TimerIcon />,
        color: '#CD7F32',
        isUnlocked: uniqueDates >= 10,
        progress: Math.min(100, Math.round(uniqueDates / 10 * 100)),
        category: 'milestone',
        level: 'bronze',
        points: 50
      },
      {
        id: 'study_days_30',
        title: '学習の継続',
        description: '30日間学習',
        icon: <TimerIcon />,
        color: '#C0C0C0',
        isUnlocked: uniqueDates >= 30,
        progress: Math.min(100, Math.round(uniqueDates / 30 * 100)),
        category: 'milestone',
        level: 'silver',
        points: 100
      },
      {
        id: 'study_days_100',
        title: '学習の達人',
        description: '100日間学習',
        icon: <TimerIcon />,
        color: '#FFD700',
        isUnlocked: uniqueDates >= 100,
        progress: Math.min(100, Math.round(uniqueDates / 100 * 100)),
        category: 'milestone',
        level: 'gold',
        points: 200
      },
      
      // 習慣系
      {
        id: 'streak_3',
        title: '学習の波',
        description: '3日連続で学習',
        icon: <LocalFireDepartmentIcon />,
        color: '#CD7F32',
        isUnlocked: studyStreak >= 3,
        progress: Math.min(100, Math.round(studyStreak / 3 * 100)),
        category: 'habit',
        level: 'bronze',
        points: 30
      },
      {
        id: 'streak_7',
        title: '学習の炎',
        description: '7日連続で学習',
        icon: <LocalFireDepartmentIcon />,
        color: '#C0C0C0',
        isUnlocked: studyStreak >= 7,
        progress: Math.min(100, Math.round(studyStreak / 7 * 100)),
        category: 'habit',
        level: 'silver',
        points: 70
      },
      {
        id: 'streak_30',
        title: '不屈の学習者',
        description: '30日連続で学習',
        icon: <LocalFireDepartmentIcon />,
        color: '#FFD700',
        isUnlocked: studyStreak >= 30,
        progress: Math.min(100, Math.round(studyStreak / 30 * 100)),
        category: 'habit',
        level: 'gold',
        points: 300
      },
      {
        id: 'time_10h',
        title: '時間の投資',
        description: '累計10時間学習',
        icon: <TimerIcon />,
        color: '#CD7F32',
        isUnlocked: totalStudyTime >= 600,
        progress: Math.min(100, Math.round(totalStudyTime / 600 * 100)),
        category: 'habit',
        level: 'bronze',
        points: 50
      },
      {
        id: 'time_50h',
        title: '時間の達人',
        description: '累計50時間学習',
        icon: <TimerIcon />,
        color: '#C0C0C0',
        isUnlocked: totalStudyTime >= 3000,
        progress: Math.min(100, Math.round(totalStudyTime / 3000 * 100)),
        category: 'habit',
        level: 'silver',
        points: 150
      },
      {
        id: 'time_100h',
        title: '時間の王者',
        description: '累計100時間学習',
        icon: <TimerIcon />,
        color: '#FFD700',
        isUnlocked: totalStudyTime >= 6000,
        progress: Math.min(100, Math.round(totalStudyTime / 6000 * 100)),
        category: 'habit',
        level: 'gold',
        points: 300
      },
      
      // 特別系
      {
        id: 'subject_coverage_50',
        title: '多角的学習者',
        description: '登録科目の50%以上を学習',
        icon: <SchoolIcon />,
        color: '#C0C0C0',
        isUnlocked: subjectCoverageRate >= 50,
        progress: subjectCoverageRate,
        category: 'special',
        level: 'silver',
        points: 100
      },
      {
        id: 'subject_coverage_100',
        title: '全領域学習者',
        description: '全科目を学習',
        icon: <SchoolIcon />,
        color: '#FFD700',
        isUnlocked: subjectCoverageRate >= 100,
        progress: subjectCoverageRate,
        category: 'special',
        level: 'gold',
        points: 200
      },
      {
        id: 'daily_milestone_20',
        title: '集中の瞬間',
        description: '1日に20ページ以上学習',
        icon: <TrendingUpIcon />,
        color: '#CD7F32',
        isUnlocked: progressData.some(p => p.pagesRead >= 20),
        progress: progressData.some(p => p.pagesRead >= 20) ? 100 : 
                Math.round(Math.max(...progressData.map(p => p.pagesRead || 0)) / 20 * 100),
        category: 'special',
        level: 'bronze',
        points: 30
      },
      {
        id: 'daily_milestone_50',
        title: '学習の爆発',
        description: '1日に50ページ以上学習',
        icon: <WhatshotIcon />,
        color: '#C0C0C0',
        isUnlocked: progressData.some(p => p.pagesRead >= 50),
        progress: progressData.some(p => p.pagesRead >= 50) ? 100 : 
                Math.round(Math.max(...progressData.map(p => p.pagesRead || 0)) / 50 * 100),
        category: 'special',
        level: 'silver',
        points: 80
      },
      {
        id: 'daily_milestone_100',
        title: '知識の洪水',
        description: '1日に100ページ以上学習',
        icon: <LightbulbIcon />,
        color: '#FFD700',
        isUnlocked: progressData.some(p => p.pagesRead >= 100),
        progress: progressData.some(p => p.pagesRead >= 100) ? 100 : 
                Math.round(Math.max(...progressData.map(p => p.pagesRead || 0)) / 100 * 100),
        category: 'special',
        level: 'gold',
        points: 150
      },
    ];
    
    return achievementList;
  }, [progressData, subjects, studySessions]);
  
  // 総獲得ポイントの計算
  const totalPoints = useMemo(() => {
    return achievements
      .filter(a => a.isUnlocked)
      .reduce((sum, a) => sum + a.points, 0);
  }, [achievements]);
  
  // 現在のレベルを計算
  const currentLevel = useMemo(() => {
    let level = studyLevels[0];
    
    for (let i = studyLevels.length - 1; i >= 0; i--) {
      if (totalPoints >= studyLevels[i].requiredPoints) {
        level = studyLevels[i];
        break;
      }
    }
    
    return level;
  }, [totalPoints, studyLevels]);
  
  // 次のレベルの取得
  const nextLevel = useMemo(() => {
    const nextLevelIndex = studyLevels.findIndex(l => l.level === currentLevel.level) + 1;
    return nextLevelIndex < studyLevels.length ? studyLevels[nextLevelIndex] : null;
  }, [currentLevel, studyLevels]);
  
  // 次のレベルまでの進捗率
  const nextLevelProgress = useMemo(() => {
    if (!nextLevel) return 100;
    
    const pointsForNextLevel = nextLevel.requiredPoints - currentLevel.requiredPoints;
    const pointsGained = totalPoints - currentLevel.requiredPoints;
    
    return Math.min(100, Math.round((pointsGained / pointsForNextLevel) * 100));
  }, [totalPoints, currentLevel, nextLevel]);
  
  // 解除された達成項目の数
  const unlockedCount = useMemo(() => {
    return achievements.filter(a => a.isUnlocked).length;
  }, [achievements]);
  
  // 学習ストリーク（連続学習日数）の計算
  function calculateStudyStreak(progresses: Progress[]): number {
    if (progresses.length === 0) return 0;
    
    // 日付でソート（降順）
    const sortedDates = progresses
      .map(p => p.recordDate)
      .filter(date => !!date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    if (sortedDates.length === 0) return 0;
    
    // 重複を除去
    const uniqueDates = Array.from(new Set(sortedDates));
    
    // 今日または昨日から始まっているか確認
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const latestDate = new Date(uniqueDates[0]);
    latestDate.setHours(0, 0, 0, 0);
    
    if (latestDate.getTime() !== today.getTime() && latestDate.getTime() !== yesterday.getTime()) {
      return 0; // 今日または昨日に学習していない場合はストリーク0
    }
    
    // ストリークを計算
    let streak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const currentDate = new Date(uniqueDates[i]);
      const prevDate = new Date(uniqueDates[i + 1]);
      
      const diffTime = currentDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
      } else {
        break; // 連続していない日があればループを抜ける
      }
    }
    
    return streak;
  }
  
  // 達成バッジのレンダリング
  const renderAchievementBadge = (achievement: Achievement) => {
    const iconColor = achievement.isUnlocked ? achievement.color : 'text.disabled';
    const avatarBgColor = achievement.isUnlocked ? `${achievement.color}22` : 'action.disabledBackground';
    
    return (
      <ListItem 
        key={achievement.id}
        sx={{
          borderRadius: 2,
          mb: 1,
          backgroundColor: achievement.isUnlocked ? `${achievement.color}11` : 'inherit',
          border: achievement.isUnlocked ? `1px solid ${achievement.color}44` : '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <ListItemAvatar>
          <Avatar
            sx={{
              backgroundColor: avatarBgColor,
              color: iconColor,
            }}
          >
            {achievement.icon}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: achievement.isUnlocked ? 'bold' : 'normal',
                  color: achievement.isUnlocked ? 'text.primary' : 'text.secondary'
                }}
              >
                {achievement.title}
              </Typography>
              {achievement.isUnlocked && (
                <Chip
                  size="small"
                  label={`+${achievement.points}ポイント`}
                  sx={{ ml: 1, backgroundColor: `${achievement.color}33`, color: 'text.secondary' }}
                />
              )}
            </Box>
          }
          secondary={
            <Box sx={{ mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {achievement.description}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={achievement.progress} 
                sx={{ 
                  mt: 1, 
                  height: 6, 
                  borderRadius: 3,
                  backgroundColor: 'rgba(0,0,0,0.08)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: achievement.color
                  }
                }} 
              />
            </Box>
          }
        />
        <ListItemSecondaryAction>
          {achievement.isUnlocked ? (
            <Tooltip title="達成済み">
              <CheckCircleIcon sx={{ color: achievement.color }} />
            </Tooltip>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {`${achievement.progress}%`}
            </Typography>
          )}
        </ListItemSecondaryAction>
      </ListItem>
    );
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 2, 
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
              backgroundColor: theme.palette.background.paper,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '80px',
                background: `linear-gradient(135deg, ${currentLevel.color}33, ${currentLevel.color}11)`,
                zIndex: 0
              }}
            />
            
            <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '100%', pt: 4 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Avatar 
                    sx={{ 
                      width: 22, 
                      height: 22, 
                      bgcolor: currentLevel.color,
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {currentLevel.level}
                  </Avatar>
                }
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: `${currentLevel.color}33`,
                    color: currentLevel.color,
                    border: `3px solid ${currentLevel.color}`
                  }}
                >
                  <EmojiEventsIcon sx={{ fontSize: 40 }} />
                </Avatar>
              </Badge>
              
              <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
                {currentLevel.title}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                レベル {currentLevel.level}
              </Typography>
              
              <Box sx={{ mt: 2, mx: 'auto', width: '80%' }}>
                <LinearProgress 
                  variant="determinate" 
                  value={nextLevelProgress} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: 'rgba(0,0,0,0.08)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: currentLevel.color
                    }
                  }} 
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {totalPoints} ポイント
                  </Typography>
                  {nextLevel && (
                    <Typography variant="body2" color="text.secondary">
                      次のレベルまで: {nextLevel.requiredPoints - totalPoints} ポイント
                    </Typography>
                  )}
                </Box>
              </Box>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {unlockedCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    達成項目
                  </Typography>
                </Box>
                
                <Divider orientation="vertical" flexItem />
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                    {totalPoints}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    合計ポイント
                  </Typography>
                </Box>
                
                <Divider orientation="vertical" flexItem />
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                    {calculateStudyStreak(progressData)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    連続学習日数
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
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
              <EqualizerIcon sx={{ mr: 1 }} />
              学習達成項目
              <Chip 
                size="small" 
                label={`${unlockedCount}/${achievements.length}`} 
                sx={{ ml: 1 }} 
                color="primary" 
              />
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                学習を継続して達成項目を解除し、ポイントを獲得しましょう。各達成項目はレベルに応じたポイントを獲得できます。
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', mb: 3 }}>
              <Chip 
                icon={<EmojiEventsIcon />} 
                label="マイルストーン"
                color="primary"
                variant="outlined"
                size="small"
                sx={{ mr: 1 }}
              />
              <Chip 
                icon={<LocalFireDepartmentIcon />} 
                label="習慣"
                color="secondary"
                variant="outlined"
                size="small"
                sx={{ mr: 1 }}
              />
              <Chip 
                icon={<LightbulbIcon />} 
                label="特別"
                color="success"
                variant="outlined"
                size="small"
              />
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ mb: 1, pl: 1 }}>
                  マイルストーン
                </Typography>
                <List sx={{ mb: 2 }}>
                  {achievements
                    .filter(a => a.category === 'milestone')
                    .map(renderAchievementBadge)}
                </List>
                
                <Typography variant="subtitle2" sx={{ mb: 1, pl: 1 }}>
                  特別
                </Typography>
                <List>
                  {achievements
                    .filter(a => a.category === 'special')
                    .map(renderAchievementBadge)}
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ mb: 1, pl: 1 }}>
                  学習習慣
                </Typography>
                <List>
                  {achievements
                    .filter(a => a.category === 'habit')
                    .map(renderAchievementBadge)}
                </List>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 