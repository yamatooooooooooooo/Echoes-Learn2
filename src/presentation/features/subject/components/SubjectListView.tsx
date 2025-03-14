import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  CircularProgress,
  Divider,
  Tooltip,
  Chip,
  LinearProgress,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  MenuBook as MenuBookIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  ErrorOutline as ErrorOutlineIcon,
  Warning as WarningIcon,
  Flag as FlagIcon,
  School as SchoolIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon
} from '@mui/icons-material';
import { Subject } from '../../../../domain/models/SubjectModel';
import { calculateDaysRemaining, calculateProgress } from '../utils/subjectUtils';

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
 * 科目をリスト形式で表示するコンポーネント（簡略化版）
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
  
  // 進捗に応じた表示スタイル
  const getProgressStyle = (progress: number) => {
    if (progress === 100) return { color: 'success.main', fontWeight: 'bold' };
    if (progress >= 70) return { color: 'primary.main', fontWeight: 'bold' };
    if (progress <= 30) return { color: 'warning.main', fontWeight: 'bold' };
    return {};
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
  
  // 優先度に対応する色クラス名
  const getPriorityColorClass = (priority?: 'high' | 'medium' | 'low'): 'error' | 'warning' | 'success' | 'default' => {
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

  // 科目データの計算処理（簡略化）
  const subjectsWithValues = useMemo(() => {
    return subjects.map(subject => {
      const progress = calculateProgress(subject.currentPage || 0, subject.totalPages || 0);
      const daysRemaining = calculateDaysRemaining(subject.examDate);
      return { subject, progress, daysRemaining };
    });
  }, [subjects]);

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
          {subjectsWithValues.map(({ subject, progress, daysRemaining }, index) => (
            <React.Fragment key={subject.id}>
              <ListItem 
                disablePadding 
                onClick={() => onSubjectEdit && onSubjectEdit(subject)}
                sx={{ 
                  py: { xs: 1.75, sm: 2 }, 
                  px: { xs: 1.75, sm: 2, md: 2.5 }, 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.06)' 
                      : 'rgba(0, 0, 0, 0.02)',
                    transform: 'translateY(-1px)'
                  }
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
                  {/* 科目名 */}
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
                        fontSize: { xs: '1.2rem', sm: '1.4rem' }
                      }}
                    />
                    <Typography 
                      variant={isMobile ? "body1" : "subtitle1"}
                      sx={{ 
                        fontWeight: subject.priority === 'high' ? 600 : 400,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: { xs: 'calc(100vw - 100px)', sm: 'auto' }
                      }}
                    >
                      {subject.name}
                    </Typography>
                  </Box>
                  
                  {/* 優先度 */}
                  <Box sx={{ 
                    width: { xs: '50%', sm: '15%' }, 
                    textAlign: 'center',
                    display: { xs: 'inline-flex', sm: 'flex' },
                    justifyContent: { xs: 'flex-start', sm: 'center' }
                  }}>
                    <Tooltip title={`優先度: ${getPriorityLabel(subject.priority)}`} placement="top">
                      <Chip 
                        label={getPriorityLabel(subject.priority)} 
                        color={getPriorityColorClass(subject.priority)} 
                        size="small" 
                        variant="outlined"
                        sx={{ height: 24, minWidth: 40 }}
                      />
                    </Tooltip>
                  </Box>
                  
                  {/* 試験日 */}
                  <Box sx={{ 
                    width: { xs: '50%', sm: '15%' }, 
                    textAlign: 'center',
                    display: { xs: 'inline-flex', sm: 'flex' },
                    justifyContent: { xs: 'flex-end', sm: 'center' }
                  }}>
                    <Typography 
                      variant="body2" 
                      component="span"
                      sx={{
                        ...getDaysRemainingStyle(daysRemaining),
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      {subject.examDate 
                        ? (daysRemaining !== null 
                            ? getDaysRemainingLabel(daysRemaining)
                            : formatDate(subject.examDate))
                        : '未設定'}
                    </Typography>
                  </Box>
                  
                  {/* 進捗 */}
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
                          sx={getProgressStyle(progress)}
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
                          bgcolor: 'rgba(0, 0, 0, 0.05)'
                        }}
                      />
                    </Box>
                  </Box>
                  
                  {/* 操作ボタン */}
                  <Box sx={{ 
                    width: { xs: '100%', sm: '10%' }, 
                    display: 'flex',
                    justifyContent: { xs: 'flex-end', sm: 'center' },
                    mt: { xs: 1, sm: 0 },
                    position: { xs: 'absolute', sm: 'static' },
                    top: { xs: '10px', sm: 'auto' },
                    right: { xs: '10px', sm: 'auto' }
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
                    
                    {/* 編集ボタン */}
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
                    
                    {/* 削除ボタン */}
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
              
              {index < subjects.length - 1 && (
                <Divider 
                  sx={{ 
                    opacity: theme.palette.mode === 'dark' ? 0.1 : 0.6
                  }} 
                />
              )}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

// パフォーマンス最適化のためにコンポーネントをメモ化
export const SubjectListView = React.memo(SubjectListViewComponent); 