import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Paper, 
  Typography, 
  Slider, 
  Grid, 
  Button,
  InputAdornment,
  LinearProgress,
  FormControlLabel,
  Switch
} from '@mui/material';
import { MenuBook as BookIcon, Save as SaveIcon, Timer as TimerIcon } from '@mui/icons-material';

interface Subject {
  id: string;
  name: string;
  currentPage: number;
  totalPages: number;
  [key: string]: any;
}

interface Session {
  id?: string;
  startPage?: number;
  endPage?: number;
  pagesCompleted?: number;
  startTime?: string;
  endTime?: string;
  duration?: number;
  [key: string]: any;
}

interface ProgressInputProps {
  subject: Subject | null;
  session: Session | null;
  onUpdate: (data: {
    startPage: number;
    endPage: number;
    pagesCompleted: number;
    startTime?: string;
    endTime?: string;
    duration?: number;
  }) => void;
}

/**
 * 学習進捗入力コンポーネント
 */
const ProgressInput: React.FC<ProgressInputProps> = ({ 
  subject, 
  session, 
  onUpdate 
}) => {
  const [startPage, setStartPage] = useState<number>(0);
  const [endPage, setEndPage] = useState<number>(0);
  const [pagesCompleted, setPagesCompleted] = useState<number>(0);
  const [trackTime, setTrackTime] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  
  // 科目やセッションが変更されたら初期値を設定
  useEffect(() => {
    if (subject) {
      // セッションに開始ページがある場合はそれを使用、なければ科目の現在ページ
      const initialStartPage = session?.startPage ?? subject.currentPage;
      setStartPage(initialStartPage);
      
      // 終了ページが未設定の場合は開始ページと同じにする
      const initialEndPage = session?.endPage ?? initialStartPage;
      setEndPage(initialEndPage);
      
      // 読んだページ数を計算
      setPagesCompleted(initialEndPage - initialStartPage);

      // 時間が記録されていれば設定
      if (session?.startTime) {
        setStartTime(session.startTime);
        setTrackTime(true);
      }
      if (session?.endTime) {
        setEndTime(session.endTime);
        setTrackTime(true);
      }
      if (session?.duration) {
        setDuration(session.duration);
        setTrackTime(true);
      }
    }
  }, [subject, session]);
  
  // 値が変更されたときの処理
  const handleStartPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartPage = Number(e.target.value);
    setStartPage(newStartPage);
    
    // 開始ページが終了ページを超えないようにする
    if (newStartPage > endPage) {
      setEndPage(newStartPage);
      setPagesCompleted(0);
    } else {
      setPagesCompleted(endPage - newStartPage);
    }
  };
  
  const handleEndPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndPage = Number(e.target.value);
    setEndPage(newEndPage);
    
    // 終了ページが開始ページ未満にならないようにする
    if (newEndPage < startPage) {
      setStartPage(newEndPage);
      setPagesCompleted(0);
    } else {
      setPagesCompleted(newEndPage - startPage);
    }
  };
  
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartTime(e.target.value);
    if (endTime) {
      calculateDuration(e.target.value, endTime);
    }
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndTime(e.target.value);
    if (startTime) {
      calculateDuration(startTime, e.target.value);
    }
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDuration(Number(e.target.value));
  };

  const calculateDuration = (start: string, end: string) => {
    try {
      const startDate = new Date(`2000-01-01T${start}`);
      const endDate = new Date(`2000-01-01T${end}`);
      
      if (endDate < startDate) {
        // 日をまたいだ場合
        endDate.setDate(endDate.getDate() + 1);
      }
      
      const diffMs = endDate.getTime() - startDate.getTime();
      const diffMinutes = Math.round(diffMs / 60000);
      setDuration(diffMinutes);
    } catch (error) {
      console.error('時間計算エラー:', error);
    }
  };

  const handleTimeTrackingToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTrackTime(e.target.checked);
    if (e.target.checked) {
      // 現在時刻をデフォルトに
      const now = new Date();
      const timeString = now.toTimeString().substring(0, 5);
      setStartTime(timeString);
    }
  };
  
  const handleSave = () => {
    onUpdate({
      startPage,
      endPage,
      pagesCompleted,
      startTime: trackTime ? startTime : undefined,
      endTime: trackTime ? endTime : undefined,
      duration: trackTime ? duration : undefined
    });
  };
  
  if (!subject) {
    return (
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" color="text.secondary">
          学習する科目を選択してください
        </Typography>
      </Paper>
    );
  }
  
  // 進捗率を計算
  const progressPercent = Math.round((endPage / subject.totalPages) * 100);
  
  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom display="flex" alignItems="center">
        <BookIcon sx={{ mr: 1 }} />
        進捗の記録
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="開始ページ"
            type="number"
            fullWidth
            value={startPage}
            onChange={handleStartPageChange}
            InputProps={{
              inputProps: { 
                min: 0, 
                max: subject.totalPages 
              },
              endAdornment: <InputAdornment position="end">ページ</InputAdornment>,
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            label="終了ページ"
            type="number"
            fullWidth
            value={endPage}
            onChange={handleEndPageChange}
            InputProps={{
              inputProps: { 
                min: startPage, 
                max: subject.totalPages 
              },
              endAdornment: <InputAdornment position="end">ページ</InputAdornment>,
            }}
          />
        </Grid>
      </Grid>
      
      <FormControlLabel
        control={
          <Switch 
            checked={trackTime} 
            onChange={handleTimeTrackingToggle} 
            color="primary"
          />
        }
        label={
          <Box display="flex" alignItems="center">
            <TimerIcon sx={{ mr: 1, fontSize: 20 }} />
            <Typography variant="body2">学習時間を記録する</Typography>
          </Box>
        }
        sx={{ mb: 2 }}
      />
      
      {trackTime && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="開始時刻"
              type="time"
              fullWidth
              value={startTime}
              onChange={handleStartTimeChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              label="終了時刻"
              type="time"
              fullWidth
              value={endTime}
              onChange={handleEndTimeChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              label="学習時間"
              type="number"
              fullWidth
              value={duration}
              onChange={handleDurationChange}
              InputProps={{
                endAdornment: <InputAdornment position="end">分</InputAdornment>,
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      )}
      
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">読了ページ数: {pagesCompleted} ページ</Typography>
          <Typography variant="body2">総進捗率: {progressPercent}%</Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progressPercent} 
          sx={{ height: 10, borderRadius: 5 }}
        />
      </Box>
      
      <Button
        variant="contained"
        startIcon={<SaveIcon />}
        onClick={handleSave}
        disabled={pagesCompleted === 0}
        fullWidth
      >
        進捗を保存
      </Button>
    </Paper>
  );
};

export default ProgressInput; 