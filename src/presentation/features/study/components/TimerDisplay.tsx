import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress, 
  Grid, 
  Tooltip,
  IconButton
} from '@mui/material';
import { 
  PlayArrow as PlayIcon, 
  Pause as PauseIcon, 
  Refresh as RefreshIcon,
  Timer as TimerIcon
} from '@mui/icons-material';

interface TimerDisplayProps {
  elapsedTime: number; // 秒単位
  active: boolean;
  onToggle: () => void;
  onReset?: () => void;
}

/**
 * 学習タイマー表示コンポーネント
 */
const TimerDisplay: React.FC<TimerDisplayProps> = ({ 
  elapsedTime, 
  active, 
  onToggle,
  onReset 
}) => {
  const [displayTime, setDisplayTime] = useState('00:00:00');
  
  useEffect(() => {
    // 時間を時:分:秒の形式に変換
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = elapsedTime % 60;
    
    const formattedTime = [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
    
    setDisplayTime(formattedTime);
  }, [elapsedTime]);
  
  // タイマーの進行度を計算 (25分を1サイクルとしたポモドーロタイマー風)
  const progress = (elapsedTime % 1500) / 1500 * 100;
  
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Grid container spacing={2} alignItems="center" justifyContent="center">
        <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={progress}
              size={100}
              thickness={4}
              sx={{ color: active ? 'success.main' : 'primary.main' }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" component="div" color="text.secondary">
                <TimerIcon sx={{ mb: -0.5, mr: 1 }} />
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
          <Typography variant="h3" component="div" sx={{ fontFamily: 'monospace' }}>
            {displayTime}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {active ? '学習中...' : '停止中'}
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            color={active ? "error" : "success"}
            startIcon={active ? <PauseIcon /> : <PlayIcon />}
            onClick={onToggle}
            sx={{ mr: 1 }}
          >
            {active ? '停止' : '開始'}
          </Button>
          
          {onReset && (
            <Tooltip title="タイマーをリセット">
              <IconButton onClick={onReset} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TimerDisplay; 