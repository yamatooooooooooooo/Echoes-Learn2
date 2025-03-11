import React from 'react';
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
  Badge
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
  ErrorOutline as ErrorOutlineIcon
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
}

/**
 * リスト形式で科目を表示するコンポーネント
 */
export const SubjectListView: React.FC<SubjectListViewProps> = ({
  subjects,
  loading,
  formatDate,
  onSubjectUpdated,
  onSubjectEdit,
  onSubjectDelete
}) => {
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
    <Paper elevation={0} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
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

      <List disablePadding>
        {subjects.map((subject, index) => {
          const progress = calculateProgress(subject.currentPage || 0, subject.totalPages);
          const daysRemaining = calculateDaysRemaining(subject.examDate);
          
          return (
            <React.Fragment key={subject.id}>
              <ListItem 
                component={ButtonBase}
                onClick={() => onSubjectEdit(subject)}
                sx={{ 
                  py: 1.5,
                  px: 2,
                  display: 'flex',
                  width: '100%',
                  textAlign: 'left',
                  '&:hover': { 
                    bgcolor: 'rgba(0, 0, 0, 0.03)' 
                  },
                  transition: 'background-color 0.2s',
                  borderLeft: '3px solid',
                  borderColor: `${getPriorityColor(subject.priority)}.main`
                }}
              >
                <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                  {/* 科目名 */}
                  <Box sx={{ width: '40%', display: 'flex', alignItems: 'center' }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <MenuBookIcon color="primary" />
                    </ListItemIcon>
                    <Typography variant="body1" component="div" fontWeight={500} noWrap>
                      {subject.name}
                    </Typography>
                  </Box>
                  
                  {/* 優先度 */}
                  <Box sx={{ width: '15%', textAlign: 'center' }}>
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
                  
                  {/* 試験日 */}
                  <Box sx={{ width: '15%', textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                        sx={getDaysRemainingStyle(daysRemaining)}
                      >
                        {subject.examDate 
                          ? (daysRemaining !== null 
                              ? getDaysRemainingLabel(daysRemaining)
                              : formatDate(subject.examDate))
                          : '未設定'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* 進捗 */}
                  <Box sx={{ width: '20%', textAlign: 'center' }}>
                    <Box sx={{ px: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                        <Typography 
                          variant="body2" 
                          component="span"
                          sx={{ ...getProgressStyle(progress), mr: 0.5 }}
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
                  
                  {/* 操作ボタン */}
                  <Box sx={{ 
                    width: '10%', 
                    textAlign: 'center',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSubjectEdit(subject);
                      }}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSubjectDelete(subject);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </ListItem>
              
              {index < subjects.length - 1 && <Divider />}
            </React.Fragment>
          );
        })}
      </List>
    </Paper>
  );
}; 