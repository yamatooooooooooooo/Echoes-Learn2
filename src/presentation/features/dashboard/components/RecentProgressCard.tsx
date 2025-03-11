import React, { useState } from 'react';
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Avatar,
  Collapse,
  IconButton,
  Tooltip,
  Zoom
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  MenuBook as MenuBookIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  Book as BookIcon
} from '@mui/icons-material';
import { NotionStyleCard } from '../../../components/common/NotionStyleCard';
import { Progress } from '../../../../domain/models/ProgressModel';

// DashboardScreenと互換性のあるインターフェース
interface RecentProgress extends Progress {
  subjectName: string;
}

interface RecentProgressCardProps {
  recentProgress: RecentProgress[];
  formatDate: (date: Date | string) => string;
  isLoading: boolean;
}

/**
 * 最近の学習進捗を表示するカードコンポーネント
 */
export const RecentProgressCard: React.FC<RecentProgressCardProps> = ({
  recentProgress,
  formatDate,
  isLoading
}) => {
  // 選択された進捗のID
  const [expandedProgressId, setExpandedProgressId] = useState<string | null>(null);
  
  // 進捗アイテムの開閉
  const handleToggleProgress = (progressId: string) => {
    setExpandedProgressId(expandedProgressId === progressId ? null : progressId);
  };
  
  // ページ数を計算
  const getPageCount = (start: number, end: number) => {
    return end - start + 1;
  };
  
  // 時間に応じた色を取得
  const getTimeColor = (date: Date | string | undefined) => {
    if (!date) return 'text.secondary';
    
    const now = new Date();
    const progressDate = typeof date === 'object' && date instanceof Date 
      ? date 
      : new Date(date);
    
    if (isNaN(progressDate.getTime())) return 'text.secondary';
    
    const diffHours = Math.abs(now.getTime() - progressDate.getTime()) / (1000 * 60 * 60);
    
    if (diffHours <= 24) return 'primary.main'; // 24時間以内
    if (diffHours <= 72) return 'success.main'; // 3日以内
    return 'text.secondary'; // それ以上
  };
  
  // 時間表示を整形
  const formatTime = (date: Date | string | undefined) => {
    if (!date) return '';
    
    let d: Date;
    if (typeof date === 'object' && date instanceof Date) {
      d = date;
    } else {
      d = new Date(date);
      if (isNaN(d.getTime())) return '';
    }
    
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  };
  
  // 日付と時間を組み合わせて表示
  const formatDateTime = (date: Date | string | undefined) => {
    if (!date) return '日時不明';
    
    // 日付オブジェクトに変換を試みる
    let dateObj: Date;
    if (typeof date === 'object' && date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date(date);
    }
    
    // 無効な日付の場合
    if (isNaN(dateObj.getTime())) {
      if (typeof date === 'string') {
        return date; // 文字列をそのまま返す
      }
      return '日時不明';
    }
    
    return `${formatDate(dateObj)} ${formatTime(dateObj)}`;
  };
  
  // ローディング中
  if (isLoading) {
    return (
      <NotionStyleCard title="">
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress size={32} thickness={4} />
        </Box>
      </NotionStyleCard>
    );
  }
  
  // 進捗データがない場合
  if (!recentProgress || recentProgress.length === 0) {
    return (
      <NotionStyleCard title="">
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            最近の学習記録はありません
          </Typography>
        </Box>
      </NotionStyleCard>
    );
  }
  
  return (
    <NotionStyleCard title="">
      <List
        sx={{ 
          maxHeight: { xs: '200px', sm: '250px', md: '300px' },
          overflowY: 'auto',
          '& .MuiListItem-root': { 
            py: 1.5,
            px: 0.5,
            borderBottom: '1px solid #F5F5F5',
            cursor: 'pointer'
          },
          '& .MuiListItem-root:last-child': { 
            borderBottom: 'none'
          }
        }}
      >
        {recentProgress.map((progress) => (
          <React.Fragment key={progress.id}>
            <ListItem 
              disablePadding 
              sx={{ 
                mb: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.01)',
                  borderLeft: `2px solid ${getTimeColor(progress.createdAt)}`,
                  pl: 1
                }
              }}
              onClick={() => progress.id && handleToggleProgress(progress.id)}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Tooltip
                  title={`${formatDateTime(progress.createdAt || new Date())}に記録`}
                  TransitionComponent={Zoom}
                  arrow
                >
                  <MenuBookIcon 
                    fontSize="small" 
                    color="primary" 
                    sx={{ 
                      opacity: 0.8,
                      transition: 'all 0.2s ease',
                      transform: expandedProgressId === progress.id ? 'scale(1.2)' : 'scale(1)'
                    }}
                  />
                </Tooltip>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      transition: 'all 0.15s ease',
                      color: expandedProgressId === progress.id ? 'primary.main' : 'text.primary'
                    }}
                  >
                    {progress.subjectName}
                  </Typography>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        color: getTimeColor(progress.createdAt),
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {formatDateTime(progress.createdAt)}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ display: 'block', color: 'text.secondary' }}
                    >
                      {progress.startPage}ページ → {progress.endPage}ページ 
                      （{getPageCount(progress.startPage, progress.endPage)}ページ）
                    </Typography>
                  </Box>
                }
              />
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  minWidth: '42px'
                }}
              >
                <Tooltip title="学習したページ数" arrow>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 500, 
                      color: 'primary.main',
                      fontSize: '1.1rem',
                      transition: 'all 0.2s ease',
                      transform: expandedProgressId === progress.id ? 'scale(1.1)' : 'scale(1)'
                    }}
                  >
                    {getPageCount(progress.startPage, progress.endPage)}
                  </Typography>
                </Tooltip>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  ページ
                </Typography>
              </Box>
              <IconButton 
                size="small" 
                sx={{ ml: 1, opacity: 0.6 }}
                onClick={(e) => {
                  e.stopPropagation();
                  progress.id && handleToggleProgress(progress.id);
                }}
              >
                {expandedProgressId === progress.id ? 
                  <KeyboardArrowUpIcon fontSize="small" /> : 
                  <KeyboardArrowDownIcon fontSize="small" />
                }
              </IconButton>
            </ListItem>
            
            <Collapse in={expandedProgressId === progress.id} timeout="auto" unmountOnExit>
              <Box 
                sx={{ 
                  mx: 2, 
                  mb: 2, 
                  p: 2, 
                  borderRadius: 1, 
                  bgcolor: 'background.paper',
                  border: '1px solid #F0F0F0'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUpIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle2">
                    学習詳細
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '160px' }}>
                    <BookIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                    <Typography variant="body2">
                      <strong>科目名:</strong> {progress.subjectName}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '160px' }}>
                    <CalendarTodayIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                    <Typography variant="body2">
                      <strong>記録日:</strong> {formatDate(progress.recordDate || progress.createdAt || new Date())}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '160px' }}>
                    <AccessTimeIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                    <Typography variant="body2">
                      <strong>記録時間:</strong> {formatTime(progress.createdAt || new Date())}
                    </Typography>
                  </Box>
                </Box>
                
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mt: 2, 
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'primary.light',
                    color: 'primary.dark'
                  }}
                >
                  <MenuBookIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {progress.startPage}ページから{progress.endPage}ページまで
                    （合計: {getPageCount(progress.startPage, progress.endPage)}ページ）を学習しました
                  </Typography>
                </Box>
              </Box>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </NotionStyleCard>
  );
}; 