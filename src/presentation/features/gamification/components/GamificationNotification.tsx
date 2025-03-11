import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  Grow, 
  CircularProgress,
  Paper,
  Snackbar,
  Alert,
  useTheme
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import LevelUpIcon from '@mui/icons-material/TrendingUp';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { UserLevel, Achievement } from '../../../../domain/models/GamificationModel';
import { USER_LEVELS } from '../../../../domain/models/GamificationModel';
import confetti from 'canvas-confetti';

// トランジション効果
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Grow ref={ref} {...props} />;
});

export interface NotificationProps {
  type: 'levelUp' | 'achievement' | 'streak' | 'challenge';
  title: string;
  message: string;
  level?: number;
  points?: number;
  iconType?: 'trophy' | 'star' | 'level' | 'fire';
  achievementRarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  onClose: () => void;
}

// 紙吹雪エフェクトを表示
const showConfetti = (colorVariant: 'default' | 'rare' | 'epic' | 'legendary' = 'default') => {
  const colors: { [key: string]: string[] } = {
    default: ['#1976d2', '#4dabf5', '#bbdefb'],
    rare: ['#2196f3', '#90caf9', '#e3f2fd'],
    epic: ['#9c27b0', '#ba68c8', '#e1bee7'],
    legendary: ['#f57c00', '#ffb74d', '#ffe0b2']
  };
  
  const selectedColors = colors[colorVariant] || colors.default;
  
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: selectedColors,
  });
};

export const GamificationNotification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  level,
  points,
  iconType = 'trophy',
  achievementRarity = 'common',
  onClose
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  
  useEffect(() => {
    // 通知が表示されたときに紙吹雪エフェクト
    if (open) {
      let confettiType: 'default' | 'rare' | 'epic' | 'legendary' = 'default';
      
      if (type === 'levelUp') {
        confettiType = 'legendary';
      } else if (type === 'achievement') {
        switch (achievementRarity) {
          case 'rare':
            confettiType = 'rare';
            break;
          case 'epic':
            confettiType = 'epic';
            break;
          case 'legendary':
            confettiType = 'legendary';
            break;
          default:
            confettiType = 'default';
        }
      }
      
      showConfetti(confettiType);
    }
  }, [open, type, achievementRarity]);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  // レアリティに応じた色を取得
  const getColorByRarity = () => {
    switch (achievementRarity) {
      case 'common': return theme.palette.info.main;
      case 'uncommon': return theme.palette.success.main;
      case 'rare': return theme.palette.primary.main;
      case 'epic': return theme.palette.secondary.main;
      case 'legendary': return theme.palette.warning.main;
      default: return theme.palette.primary.main;
    }
  };

  // アイコンを取得
  const getIcon = () => {
    switch (iconType) {
      case 'trophy':
        return <EmojiEventsIcon sx={{ fontSize: 60, color: getColorByRarity() }} />;
      case 'star':
        return <StarIcon sx={{ fontSize: 60, color: getColorByRarity() }} />;
      case 'level':
        return <LevelUpIcon sx={{ fontSize: 60, color: theme.palette.success.main }} />;
      case 'fire':
        return <LocalFireDepartmentIcon sx={{ fontSize: 60, color: theme.palette.warning.main }} />;
      default:
        return <EmojiEventsIcon sx={{ fontSize: 60, color: getColorByRarity() }} />;
    }
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="notification-dialog-description"
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: 10,
          overflow: 'hidden'
        }
      }}
    >
      <Box
        sx={{
          p: 3,
          textAlign: 'center',
          background: type === 'levelUp' 
            ? `linear-gradient(45deg, ${theme.palette.success.dark} 30%, ${theme.palette.success.main} 90%)`
            : type === 'achievement' && achievementRarity === 'legendary'
              ? `linear-gradient(45deg, ${theme.palette.warning.dark} 30%, ${theme.palette.warning.main} 90%)`
              : undefined,
          color: type === 'levelUp' || (type === 'achievement' && achievementRarity === 'legendary') 
            ? 'white' 
            : undefined
        }}
      >
        {getIcon()}
        <DialogTitle sx={{ pb: 0 }}>
          {title}
        </DialogTitle>
        <Typography variant="body1" id="notification-dialog-description" sx={{ mt: 1 }}>
          {message}
        </Typography>
        
        {level && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              レベル {level}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {USER_LEVELS.find(l => l.level === level)?.title || ''}
            </Typography>
          </Box>
        )}
        
        {points && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              +{points} ポイント獲得！
            </Typography>
          </Box>
        )}
      </Box>
      
      <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
        <Button 
          onClick={handleClose} 
          color="primary" 
          variant="contained"
          sx={{ minWidth: 100 }}
        >
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// トースト通知コンポーネント（小さな通知）
export interface ToastNotificationProps {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  open: boolean;
  onClose: () => void;
}

export const GamificationToast: React.FC<ToastNotificationProps> = ({
  message,
  type,
  open,
  onClose
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity={type} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}; 