import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  LinearProgress, 
  Chip,
  Avatar,
  Grid,
  Divider,
  useTheme,
  CircularProgress,
  Button
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { UserExperienceProfile, USER_LEVELS } from '../../../../domain/models/GamificationModel';
import { GamificationRepository } from '../../../../infrastructure/repositories/gamificationRepository';
import { useFirebase } from '../../../../contexts/FirebaseContext';

interface UserLevelProgressProps {
  userId: string;
}

export const UserLevelProgress: React.FC<UserLevelProgressProps> = ({ userId }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserExperienceProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Firebaseサービスを取得
  const { firestore, auth } = useFirebase();
  
  useEffect(() => {
    const loadUserExperience = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const gamificationRepo = new GamificationRepository(firestore, auth);
        const userProfile = await gamificationRepo.getUserExperienceProfile(userId);
        setProfile(userProfile);
      } catch (err) {
        console.error('ユーザー経験値プロフィールの取得に失敗しました', err);
        setError('データの読み込みに失敗しました。もう一度お試しください。');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserExperience();
  }, [userId, firestore, auth]); // 依存配列にFirebaseサービスを追加
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="outlined" 
          sx={{ mt: 1 }}
          onClick={() => window.location.reload()}
        >
          再読み込み
        </Button>
      </Box>
    );
  }
  
  if (!profile) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>プロフィールが見つかりませんでした。</Typography>
      </Box>
    );
  }
  
  // 現在のレベル情報
  const currentLevel = USER_LEVELS.find(l => l.level === profile.level);
  // 次のレベル情報
  const nextLevel = USER_LEVELS.find(l => l.level === profile.level + 1);
  
  // 現在のレベルから次のレベルまでの進捗率を計算
  const calculateProgress = () => {
    if (!currentLevel || !nextLevel) return 0;
    
    const currentLevelExp = currentLevel.requiredExp;
    const nextLevelExp = nextLevel.requiredExp;
    const expRange = nextLevelExp - currentLevelExp;
    const userProgress = profile.totalExp - currentLevelExp;
    
    return Math.min(Math.round((userProgress / expRange) * 100), 100);
  };
  
  const progressPercent = calculateProgress();
  
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: 'background.paper',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* デコレーション背景 */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '30%',
          height: '100%',
          opacity: 0.05,
          background: `linear-gradient(45deg, transparent, ${theme.palette.primary.main})`,
          zIndex: 0
        }}
      />
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: theme.palette.primary.main,
                mr: 2
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                レベル {profile.level}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {currentLevel?.title || ''}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">
                現在の経験値: {profile.totalExp} EXP
              </Typography>
              {nextLevel && (
                <Typography variant="body2">
                  次のレベルまで: {nextLevel.requiredExp - profile.totalExp} EXP
                </Typography>
              )}
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progressPercent}
              sx={{ 
                height: 10, 
                borderRadius: 5,
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.light})`,
                }
              }} 
            />
            <Typography variant="body2" align="right" sx={{ mt: 0.5 }}>
              {progressPercent}%
            </Typography>
          </Box>
          
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalFireDepartmentIcon sx={{ color: theme.palette.warning.main, mr: 1 }} />
                <Typography variant="body2">連続学習: {profile.streakDays}日</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <StarIcon sx={{ color: theme.palette.info.main, mr: 1 }} />
                <Typography variant="body2">本日の獲得: {profile.pointsToday}ポイント</Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <EmojiEventsIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
              称号
            </Typography>
            <Grid container spacing={1}>
              {/* バッジはFirestoreから取得する必要がありますが、ここではダミーデータを表示 */}
              {['初級学習者', '勉強家', '7日連続達成者'].map((badge, index) => (
                <Grid item key={index}>
                  <Chip
                    label={badge}
                    sx={{
                      bgcolor: theme.palette.action.hover,
                      fontWeight: 'medium',
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
              次のレベルで解除
            </Typography>
            {nextLevel && (
              <Box sx={{ p: 1, bgcolor: theme.palette.action.hover, borderRadius: 1 }}>
                <Typography variant="body2">
                  「{nextLevel.title}」の称号を獲得
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  さらに追加の報酬が待っています！
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}; 