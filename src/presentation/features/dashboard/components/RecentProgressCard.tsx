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
  Zoom,
  CardHeader,
  CardContent,
  Chip
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  MenuBook as MenuBookIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  Book as BookIcon,
  HistoryOutlined as HistoryOutlinedIcon,
  Assignment as AssignmentIcon,
  SentimentSatisfiedAlt as SentimentSatisfiedAltIcon
} from '@mui/icons-material';
import { NotionStyleCard } from '../../../components/common/NotionStyleCard';
import { Progress } from '../../../../domain/models/ProgressModel';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';

// DashboardScreenと互換性のあるインターフェース
interface RecentProgress extends Progress {
  subjectName: string;
}

// コンポーネントのプロパティ型
interface RecentProgressCardProps {
  recentProgress: RecentProgress[];
  formatDate: (date: Date | string) => string;
  isLoading?: boolean;
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
    if (start === 0 && end === 0) return 0;
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

  // 満足度アイコンの取得
  const getSatisfactionIcon = (level?: number) => {
    if (!level) return null;
    
    if (level === 1) {
      return <SentimentDissatisfiedIcon fontSize="small" color="error" />;
    } else if (level === 2) {
      return <SentimentSatisfiedIcon fontSize="small" color="warning" />;
    } else {
      return <SentimentVerySatisfiedIcon fontSize="small" color="success" />;
    }
  };

  // 満足度テキストの取得
  const getSatisfactionText = (level?: number) => {
    if (!level) return "";
    return level === 1 ? "不満" : level === 2 ? "普通" : "満足";
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
    <Box sx={{ width: '100%' }}>
      <CardHeader 
        title="最近の進捗"
        titleTypographyProps={{ variant: 'h6' }}
        avatar={<HistoryOutlinedIcon />}
      />
      <CardContent sx={{ 
        p: { xs: 1, sm: 2 },
        maxHeight: { xs: '300px', sm: '350px', md: '400px' }, 
        overflow: 'auto',
        width: '100%'
      }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <List 
            sx={{ 
              p: 0,
              maxHeight: { xs: '300px', sm: '350px', md: '400px' },
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
                      {progress.reportProgress ? (
                        <AssignmentIcon 
                          fontSize="small" 
                          color="secondary" 
                          sx={{ 
                            opacity: 0.8,
                            transition: 'all 0.2s ease',
                            transform: expandedProgressId === progress.id ? 'scale(1.2)' : 'scale(1)'
                          }}
                        />
                      ) : (
                        <MenuBookIcon 
                          fontSize="small" 
                          color="primary" 
                          sx={{ 
                            opacity: 0.8,
                            transition: 'all 0.2s ease',
                            transform: expandedProgressId === progress.id ? 'scale(1.2)' : 'scale(1)'
                          }}
                        />
                      )}
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
                        {getPageCount(progress.startPage, progress.endPage) > 0 ? (
                          <Typography 
                            variant="caption" 
                            sx={{ display: 'block', color: 'text.secondary' }}
                          >
                            {progress.startPage}ページ → {progress.endPage}ページ 
                            （{getPageCount(progress.startPage, progress.endPage)}ページ）
                          </Typography>
                        ) : progress.reportProgress ? (
                          <Typography 
                            variant="caption" 
                            sx={{ display: 'block', color: 'text.secondary' }}
                          >
                            レポート進捗: {progress.reportProgress.substring(0, 20)}
                            {progress.reportProgress.length > 20 ? '...' : ''}
                          </Typography>
                        ) : (
                          <Typography 
                            variant="caption" 
                            sx={{ display: 'block', color: 'text.secondary' }}
                          >
                            {progress.memo ? `メモ: ${progress.memo.substring(0, 30)}${progress.memo.length > 30 ? '...' : ''}` : '記録あり'}
                          </Typography>
                        )}
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
                    {getPageCount(progress.startPage, progress.endPage) > 0 ? (
                      <>
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
                      </>
                    ) : progress.satisfactionLevel ? (
                      <Tooltip title={`満足度: ${getSatisfactionText(progress.satisfactionLevel)}`} arrow>
                        <Box sx={{ textAlign: 'center' }}>
                          {getSatisfactionIcon(progress.satisfactionLevel)}
                        </Box>
                      </Tooltip>
                    ) : progress.reportProgress ? (
                      <Tooltip title="レポート進捗あり" arrow>
                        <AssignmentIcon color="secondary" fontSize="small" />
                      </Tooltip>
                    ) : (
                      <Tooltip title="学習メモあり" arrow>
                        <MenuBookIcon color="primary" fontSize="small" />
                      </Tooltip>
                    )}
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
                      
                      {progress.satisfactionLevel && (
                        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '160px' }}>
                          <SentimentSatisfiedAltIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                          <Typography variant="body2">
                            <strong>満足度:</strong> {getSatisfactionText(progress.satisfactionLevel)}
                          </Typography>
                        </Box>
                      )}
                      
                      {progress.studyDuration && progress.studyDuration > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '160px' }}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                          <Typography variant="body2">
                            <strong>学習時間:</strong> {progress.studyDuration}分
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    {getPageCount(progress.startPage, progress.endPage) > 0 && (
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
                    )}
                    
                    {progress.memo && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          学習メモ:
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                          {progress.memo}
                        </Typography>
                      </Box>
                    )}
                    
                    {progress.reportProgress && (
                      <Box 
                        sx={{ 
                          mt: 2, 
                          p: 1,
                          borderRadius: 1,
                          bgcolor: 'secondary.light',
                          color: 'secondary.dark'
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                          <AssignmentIcon fontSize="small" sx={{ mr: 1 }} />
                          レポート進捗:
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                          {progress.reportProgress}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Collapse>
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Box>
  );
}; 