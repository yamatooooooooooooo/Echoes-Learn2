import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  LinearProgress,
  CircularProgress,
  Divider,
  Tooltip,
  ButtonBase,
  Badge,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  MenuBook as MenuBookIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  PriorityHigh as PriorityHighIcon,
  Warning as WarningIcon,
  Flag as FlagIcon,
  ErrorOutline as ErrorOutlineIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Check as CheckIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon
} from '@mui/icons-material';
import { Subject } from '../../../../domain/models/SubjectModel';
import { calculateDaysRemaining, calculateProgress, getPriorityColor } from '../utils/subjectUtils';

interface SubjectListViewProps {
  subjects: Subject[];
  loading: boolean;
  formatDate: (date: Date | string | undefined) => string;
  onSubjectUpdated: (subject: Subject) => void;
  onSubjectEdit: (subject: Subject) => void;
  onSubjectDelete: (subject: Subject) => void;
  onRecordProgress?: (subject: Subject) => void;
}

/**
 * 科目をリスト形式で表示するコンポーネント
 */
const SubjectListViewComponent: React.FC<SubjectListViewProps> = ({
  subjects,
  loading,
  formatDate,
  onSubjectUpdated,
  onSubjectEdit,
  onSubjectDelete,
  onRecordProgress
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  // スクロール位置を追跡するための参照
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<number>(Math.min(30, subjects.length));
  
  // 初期表示時に一度に表示する最大項目数を制限
  useEffect(() => {
    // 初期表示は少なめに、その後徐々に増やす
    setVisibleItems(Math.min(30, subjects.length));
    
    // 100ms後に残りを表示（ロードを分散させる）
    if (subjects.length > 30) {
      const timer = setTimeout(() => {
        setVisibleItems(subjects.length);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [subjects.length]);
  
  // スクロールの検出とパフォーマンス最適化用のIntersection Observer
  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    // ビューポートに入った場合、さらに項目を表示
    if (entries.some(entry => entry.isIntersecting) && visibleItems < subjects.length) {
      setVisibleItems(prev => Math.min(subjects.length, prev + 20));
    }
  }, [subjects.length, visibleItems]);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // 監視対象の要素
    const target = containerRef.current;
    
    // Intersection Observerの設定
    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '200px', // 事前に読み込む距離
      threshold: 0.1
    });
    
    // 監視開始
    observer.observe(target);
    
    // クリーンアップ
    return () => {
      observer.unobserve(target);
      observer.disconnect();
    };
  }, [observerCallback]);

  // 各科目の計算値をメモ化して計算コストを削減
  const subjectsWithCalculatedValues = useMemo(() => {
    // 表示する項目のみを計算して処理を軽減
    return subjects.slice(0, visibleItems).map(subject => {
      const progress = calculateProgress(subject.currentPage || 0, subject.totalPages || 0);
      const daysRemaining = calculateDaysRemaining(subject.examDate);
      return {
        subject,
        progress,
        daysRemaining,
        progressStyle: getProgressStyle(progress),
        daysRemainingStyle: getDaysRemainingStyle(daysRemaining),
        daysRemainingLabel: daysRemaining !== null ? getDaysRemainingLabel(daysRemaining) : null
      };
    });
  }, [subjects, visibleItems]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (subjects.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          科目がまだ登録されていません。「新しい科目」ボタンから科目を追加してください。
        </Typography>
      </Box>
    );
  }

  // 優先度に対応する色
  const getPriorityColor = (priority?: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  // 優先度の日本語表示
  const getPriorityLabel = (priority?: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '未設定';
    }
  };

  // 優先度に対応するアイコン
  const getPriorityIcon = (priority?: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return <ErrorOutlineIcon fontSize="small" sx={{ color: 'error.main' }} />;
      case 'medium': return <WarningIcon fontSize="small" sx={{ color: 'warning.main' }} />;
      case 'low': return <FlagIcon fontSize="small" sx={{ color: 'success.main' }} />;
      default: return <FlagIcon fontSize="small" sx={{ color: 'action.disabled' }} />;
    }
  };

  // 残り日数に応じた表示スタイル
  const getDaysRemainingStyle = (days: number | null) => {
    if (days === null) return {};
    if (days <= 3) return { color: 'error.main', fontWeight: 'bold' };
    if (days <= 7) return { color: 'error.main', fontWeight: 'bold' };
    if (days <= 14) return { color: 'warning.main', fontWeight: 'bold' };
    if (days <= 30) return { color: 'info.main', fontWeight: 'medium' };
    return { color: 'text.secondary' };
  };

  // 進捗に応じた表示スタイル
  const getProgressStyle = (progress: number) => {
    if (progress === 100) return { color: 'success.main', fontWeight: 'bold' };
    if (progress >= 70) return { color: 'primary.main', fontWeight: 'bold' };
    if (progress <= 30) return { color: 'warning.main', fontWeight: 'bold' };
    return {};
  };

  // 試験日までの残り日数のラベル表示
  const getDaysRemainingLabel = (days: number | null) => {
    if (days === null) return '日付未設定';
    if (days <= 0) return '試験日超過!';
    if (days === 1) return '明日!';
    if (days <= 3) return `あと${days}日 (緊急)`;
    if (days <= 7) return `あと${days}日 (今週)`;
    if (days <= 14) return `あと${days}日 (2週間以内)`;
    if (days <= 30) return `あと${days}日 (1ヶ月以内)`;
    return `あと${days}日`;
  };

  return (
    <Paper 
      elevation={0} 
      variant="outlined" 
      sx={{ 
        borderRadius: 2, 
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* リストヘッダー */}
      <Box sx={{ 
        display: 'flex', 
        p: 2, 
        bgcolor: 'background.default', 
        borderBottom: '1px solid',
        borderColor: 'divider',
        fontWeight: 'bold'
      }}>
        <Box sx={{ width: '40%', pl: 5 }}>科目名</Box>
        <Box sx={{ width: '15%', textAlign: 'center' }}>優先度</Box>
        <Box sx={{ width: '15%', textAlign: 'center' }}>試験日</Box>
        <Box sx={{ width: '20%', textAlign: 'center' }}>進捗</Box>
        <Box sx={{ width: '10%', textAlign: 'center' }}>操作</Box>
      </Box>

      {/* スクロール可能なリスト本体 */}
      <Box 
        sx={{ 
          overflow: 'auto',
          flexGrow: 1,
          height: '100%',
          scrollBehavior: 'smooth'
        }}
      >
        <List disablePadding>
          {subjectsWithCalculatedValues.map(({ subject, progress, daysRemaining, progressStyle, daysRemainingStyle, daysRemainingLabel }, index) => {
            return (
              <React.Fragment key={subject.id}>
                <ListItem 
                  disablePadding 
                  onClick={() => onSubjectEdit && onSubjectEdit(subject)}
                  sx={{ 
                    py: { xs: 1.5, sm: 2 }, 
                    px: { xs: 1.5, sm: 2, md: 3 }, 
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.05)' 
                        : 'rgba(0, 0, 0, 0.03)'
                    },
                    borderLeft: '3px solid',
                    borderColor: `${getPriorityColor(subject.priority)}.main`,
                    transition: 'background-color 0.2s'
                  }}
                >
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      width: '100%',
                      gap: { xs: 1, sm: 0 }
                    }}
                  >
                    {/* 科目名 (モバイル向けに最適化) */}
                    <Box sx={{ 
                      width: { xs: '100%', sm: '40%' }, 
                      mb: { xs: 1, sm: 0 },
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <SchoolIcon 
                        color="primary" 
                        sx={{ 
                          mr: 1.5, 
                          fontSize: { xs: '1.2rem', sm: '1.4rem' },
                          color: theme.palette.mode === 'dark' ? getPriorityColor(subject.priority) : undefined
                        }}
                      />
                      <Typography 
                        variant={isMobile ? "body1" : "subtitle1"}
                        sx={{ 
                          fontWeight: subject.priority === 'high' ? 600 : 400,
                          color: subject.priority === 'high' 
                            ? 'error.main' 
                            : 'text.primary'
                        }}
                      >
                        {subject.name}
                      </Typography>
                    </Box>
                    
                    {/* 優先度 (モバイル向けに非表示または縮小) */}
                    <Box sx={{ 
                      width: { xs: '50%', sm: '15%' }, 
                      textAlign: 'center',
                      display: { xs: 'inline-flex', sm: 'flex' },
                      justifyContent: { xs: 'flex-start', sm: 'center' }
                    }}>
                      <Tooltip 
                        title={`優先度: ${getPriorityLabel(subject.priority)}${daysRemaining && daysRemaining <= 7 ? ' (試験日が近いです!)' : ''}`} 
                        placement="top"
                      >
                        <Chip 
                          icon={getPriorityIcon(subject.priority)}
                          label={getPriorityLabel(subject.priority)} 
                          color={getPriorityColor(subject.priority)} 
                          size="small" 
                          variant="outlined"
                          sx={{ 
                            height: 24, 
                            minWidth: 40,
                            fontWeight: subject.priority === 'high' ? 'bold' : 'medium',
                            '& .MuiChip-icon': { 
                              ml: 0.5,
                              fontSize: '0.875rem' 
                            }
                          }}
                        />
                      </Tooltip>
                    </Box>
                    
                    {/* 試験日 (モバイル向けに最適化) */}
                    <Box sx={{ 
                      width: { xs: '50%', sm: '15%' }, 
                      textAlign: 'center',
                      display: { xs: 'inline-flex', sm: 'flex' },
                      justifyContent: { xs: 'flex-end', sm: 'center' }
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: { xs: 'flex-end', sm: 'center' } 
                      }}>
                        <Tooltip title="試験日" placement="top">
                          <EventIcon 
                            fontSize="small" 
                            sx={{ 
                              mr: 0.5, 
                              fontSize: '1rem', 
                              color: daysRemaining && daysRemaining <= 7 ? 'error.main' : 'action.active' 
                            }} 
                          />
                        </Tooltip>
                        <Typography 
                          variant="body2" 
                          component="span"
                          sx={daysRemainingStyle}
                        >
                          {subject.examDate 
                            ? (daysRemaining !== null 
                                ? daysRemainingLabel
                                : formatDate(subject.examDate))
                            : '未設定'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* 進捗 (モバイル向けに再配置) */}
                    <Box sx={{ 
                      width: { xs: '100%', sm: '20%' }, 
                      textAlign: 'center',
                      mt: { xs: 0.5, sm: 0 }
                    }}>
                      <Box sx={{ px: { xs: 0, sm: 2 } }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: { xs: 'space-between', sm: 'center' }, 
                          mb: 0.5 
                        }}>
                          <Typography 
                            variant="body2" 
                            component="span"
                            sx={{ ...progressStyle, mr: 0.5 }}
                          >
                            {progress}%
                          </Typography>
                          <Typography variant="body2" component="span" color="text.secondary">
                            ({subject.currentPage || 0}/{subject.totalPages})
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={progress}
                          sx={{ 
                            height: 4, 
                            borderRadius: 2,
                            bgcolor: 'rgba(0, 0, 0, 0.05)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: progress === 100 
                                ? 'success.main' 
                                : progress >= 70
                                  ? 'primary.main'
                                  : progress <= 30
                                    ? 'warning.main'
                                    : 'primary.main'
                            }
                          }}
                        />
                      </Box>
                    </Box>
                    
                    {/* 操作ボタン (進捗記録ボタン追加) */}
                    <Box sx={{ 
                      width: { xs: '100%', sm: '10%' }, 
                      display: 'flex',
                      justifyContent: { xs: 'flex-end', sm: 'center' },
                      mt: { xs: 1, sm: 0 }
                    }}>
                      {/* 進捗記録ボタン */}
                      {onRecordProgress && (
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            onRecordProgress(subject);
                          }}
                          sx={{ mr: 1 }}
                          color="primary"
                        >
                          <Tooltip title="進捗を記録">
                            <AssignmentTurnedInIcon fontSize="small" />
                          </Tooltip>
                        </IconButton>
                      )}
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSubjectEdit && onSubjectEdit(subject);
                        }}
                        sx={{ mr: 1 }}
                      >
                        <Tooltip title="編集">
                          <EditIcon fontSize="small" />
                        </Tooltip>
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSubjectDelete && onSubjectDelete(subject);
                        }}
                      >
                        <Tooltip title="削除">
                          <DeleteIcon fontSize="small" />
                        </Tooltip>
                      </IconButton>
                    </Box>
                  </Box>
                </ListItem>
                
                {index < subjects.length - 1 && <Divider />}
              </React.Fragment>
            );
          })}
        </List>
        
        {/* ローディングインジケータ（まだ全ての項目が読み込まれていない場合） */}
        {visibleItems < subjects.length && (
          <Box 
            ref={containerRef} 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              p: 2,
              opacity: 0.7
            }}
          >
            <CircularProgress size={24} thickness={4} />
          </Box>
        )}
      </Box>
    </Paper>
  );
};

// パフォーマンス最適化のためにコンポーネントをメモ化
export const SubjectListView = React.memo(SubjectListViewComponent); 