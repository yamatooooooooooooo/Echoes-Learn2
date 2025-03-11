import React, { useState, useMemo } from 'react';
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  CircularProgress,
  Collapse,
  IconButton
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon
} from '@mui/icons-material';
import { NotionStyleCard } from '../../../components/common/NotionStyleCard';
import { OutlinedIcon } from '../../../components/common/OutlinedIcon';
import { ICONS } from '../../../../config/appIcons';

interface Exam {
  id?: string;
  subjectId: string;
  subjectName: string;
  examDate: Date | string;
  remainingDays: number;
  completion?: number;
  reportDeadline?: Date | string;
}

interface UpcomingExamsCardProps {
  exams: Exam[];
  isLoading: boolean;
  formatDate?: (date: Date | string | undefined) => string;
}

/**
 * 今後の試験スケジュールを表示するカードコンポーネント
 */
export const UpcomingExamsCard: React.FC<UpcomingExamsCardProps> = ({ 
  exams, 
  isLoading,
  formatDate: externalFormatDate 
}) => {
  const [expandedExams, setExpandedExams] = useState<string[]>([]);

  const handleToggleExam = (examId: string) => {
    setExpandedExams(prev => 
      prev.includes(examId) ? prev.filter(id => id !== examId) : [...prev, examId]
    );
  };

  // 内部のフォーマット関数（外部から提供されない場合に使用）
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '未設定';
    
    // 外部のフォーマット関数が提供されている場合はそれを使用
    if (externalFormatDate) {
      return externalFormatDate(date);
    }
    
    // デフォルトのフォーマット
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('日付のフォーマットエラー:', error);
      return '無効な日付';
    }
  };
  
  // 残り日数に応じた色を取得
  const getDaysRemainingColor = (days: number): 'error' | 'warning' | 'success' => {
    if (days <= 7) return 'error';
    if (days <= 14) return 'warning';
    return 'success';
  };
  
  // 残り日数に応じたカスタムカラーコードを取得（色を柔らかく）
  const getCustomColor = (days: number): string => {
    if (days <= 7) return '#e57373'; // 柔らかい赤
    if (days <= 14) return '#ffb74d'; // 柔らかいオレンジ
    return '#81c784'; // 柔らかい緑
  };
  
  // 試験日の有効性を確認する関数を追加
  const isValidDate = (date: any): boolean => {
    if (!date) return false;
    
    try {
      const dateObj = new Date(date);
      return !isNaN(dateObj.getTime());
    } catch (error) {
      return false;
    }
  };
  
  // 試験日ごとにグループ化
  const groupedExams = useMemo(() => {
    // 有効な試験日を持つ試験だけをフィルタリング
    const validExams = exams.filter(exam => 
      exam && 
      isValidDate(exam.examDate) && 
      exam.remainingDays > 0
    );
    
    // 試験日ごとにグループ化
    const groups: { [key: string]: Exam[] } = {};
    
    validExams.forEach(exam => {
      const examDate = new Date(exam.examDate);
      const dateKey = examDate.toISOString().split('T')[0]; // YYYY-MM-DD形式
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(exam);
    });
    
    // グループを日付順にソート（近い順）
    return Object.entries(groups)
      .sort(([dateA], [dateB]) => {
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      })
      .map(([dateStr, exams]) => ({
        date: new Date(dateStr),
        exams: exams
      }));
  }, [exams]);
  
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
  
  // 試験がない場合
  if (!exams || exams.length === 0) {
    return (
      <NotionStyleCard title="">
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            予定されている試験はありません
          </Typography>
        </Box>
      </NotionStyleCard>
    );
  }
  
  return (
    <NotionStyleCard title="">
      <List sx={{ p: 0 }}>
        {groupedExams.map((group, groupIndex) => {
          return (
            <React.Fragment key={group.date.toISOString()}>
              {/* 日付ヘッダー */}
              <Box 
                sx={{ 
                  px: 2, 
                  py: 1, 
                  bgcolor: 'background.default',
                  borderLeft: `3px solid ${getCustomColor(group.exams[0]?.remainingDays || 0)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <OutlinedIcon 
                    icon={ICONS.calendar} 
                    size="small" 
                    color={`${getDaysRemainingColor(group.exams[0]?.remainingDays || 0)}.main`}
                    sx={{ mr: 1 }}
                  />
                  <Typography 
                    variant="subtitle2" 
                    sx={{ fontWeight: 500 }}
                  >
                    {formatDate(group.date)}
                  </Typography>
                </Box>
                <Chip
                  label={`あと${group.exams[0]?.remainingDays || 0}日`}
                  size="small"
                  sx={{ 
                    fontWeight: 500,
                    fontSize: '0.7rem',
                    height: 20,
                    borderRadius: 1,
                  }}
                  color={getDaysRemainingColor(group.exams[0]?.remainingDays || 0)}
                />
              </Box>
              
              {/* 試験リスト */}
              {group.exams.map((exam) => (
                <React.Fragment key={exam.subjectId}>
                  <ListItem
                    onClick={() => handleToggleExam(exam.subjectId)}
                    sx={{ 
                      py: 1.5,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.03)'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <OutlinedIcon 
                        icon={ICONS.menuBook} 
                        size="small" 
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body1" component="div">
                          {exam.subjectName}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                          {exam.completion !== undefined && (
                            <Typography variant="body2" color="text.secondary">
                              進捗: {exam.completion}%
                            </Typography>
                          )}
                          
                          {/* リポート締切日があれば表示 */}
                          {exam.reportDeadline && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                <OutlinedIcon 
                                  icon={ICONS.assignment} 
                                  size="small" 
                                  sx={{ mr: 0.5, fontSize: '0.875rem' }}
                                />
                                リポート締切: {formatDate(exam.reportDeadline)}
                              </Box>
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    {expandedExams.includes(exam.subjectId) ? (
                      <KeyboardArrowUpIcon fontSize="small" sx={{ ml: 1 }} />
                    ) : (
                      <KeyboardArrowDownIcon fontSize="small" sx={{ ml: 1 }} />
                    )}
                  </ListItem>
                  
                  {/* 詳細情報 */}
                  <Collapse in={expandedExams.includes(exam.subjectId)} timeout="auto" unmountOnExit>
                    <Box sx={{ px: 3, py: 2, bgcolor: 'background.default', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {exam.subjectName}の試験詳細情報をここに表示します。
                      </Typography>
                    </Box>
                  </Collapse>
                  
                  <Divider />
                </React.Fragment>
              ))}
              
              {groupIndex < groupedExams.length - 1 && (
                <Box sx={{ height: 16 }} />
              )}
            </React.Fragment>
          );
        })}
      </List>
    </NotionStyleCard>
  );
}; 