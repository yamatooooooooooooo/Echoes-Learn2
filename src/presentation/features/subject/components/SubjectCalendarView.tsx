import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Badge,
  styled,
} from '@mui/material';
import { Event as EventIcon, MenuBook as MenuBookIcon } from '@mui/icons-material';
import { Subject } from '../../../../domain/models/SubjectModel';
import { calculateProgress } from '../utils/subjectUtils';

// スタイル付きのカレンダーの日にち
const CalendarDay = styled(Box)(({ theme }) => ({
  width: '100%',
  aspect: '1 / 1',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(0.5),
  position: 'relative',
  transition: 'all 0.2s',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

// 日付ヘッダーのスタイル
const DayHeader = styled(Box)(({ theme }) => ({
  textAlign: 'right',
  fontSize: '0.8rem',
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(0.5),
  minHeight: '24px',
}));

// 試験バッジ
const ExamBadge = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: '4px',
  left: '4px',
  height: '20px',
  fontSize: '0.7rem',
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
}));

interface SubjectCalendarViewProps {
  subjects: Subject[];
  loading: boolean;
  formatDate: (date: Date | string | undefined) => string;
  onSubjectUpdated: (subject: Subject) => void;
  onSubjectEdit: (subject: Subject) => void;
  onSubjectDelete: (subjectId: string) => void;
}

/**
 * カレンダー形式で科目を表示するコンポーネント
 */
export const SubjectCalendarView: React.FC<SubjectCalendarViewProps> = ({
  subjects,
  loading,
  formatDate,
  onSubjectUpdated,
  onSubjectEdit,
  onSubjectDelete,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  // カレンダーに表示する日付の作成
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  // 月の日数分の配列を作成
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // 曜日の配列（日曜日から始まる）
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

  // 前月の空白日を追加
  const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => null);
  const calendarDays = [...prevMonthDays, ...days];

  // 月名の取得
  const monthNames = [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ];

  // その日に試験がある科目を取得
  const getExamsForDay = (day: number) => {
    return subjects.filter((subject) => {
      if (!subject.examDate) return false;
      const examDate = new Date(subject.examDate);
      return (
        examDate.getFullYear() === year &&
        examDate.getMonth() === month &&
        examDate.getDate() === day
      );
    });
  };

  // 月を変更するハンドラ
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  return (
    <Paper elevation={0} variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
      {/* カレンダーヘッダー */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EventIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            {year}年 {monthNames[month]}
          </Typography>
        </Box>
        <Box>
          <Chip
            label="前月"
            variant="outlined"
            size="small"
            onClick={handlePrevMonth}
            sx={{ mr: 1 }}
          />
          <Chip label="翌月" variant="outlined" size="small" onClick={handleNextMonth} />
        </Box>
      </Box>

      {/* 曜日ヘッダー */}
      <Grid container spacing={1} sx={{ mb: 1 }}>
        {weekdays.map((day, index) => (
          <Grid item xs={12 / 7} key={index}>
            <Typography
              align="center"
              variant="body2"
              sx={{
                fontWeight: 'bold',
                color: index === 0 ? 'error.main' : index === 6 ? 'primary.main' : 'text.primary',
              }}
            >
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {/* カレンダー本体 */}
      <Grid container spacing={1}>
        {calendarDays.map((day, index) => {
          // nullの場合は空の日にち
          if (day === null) {
            return (
              <Grid item xs={12 / 7} key={`empty-${index}`}>
                <CalendarDay sx={{ bgcolor: 'action.hover', opacity: 0.3 }} />
              </Grid>
            );
          }

          const exams = getExamsForDay(day);
          const hasExams = exams.length > 0;

          return (
            <Grid item xs={12 / 7} key={`day-${day}`}>
              <CalendarDay
                onClick={() => hasExams && onSubjectEdit(exams[0])}
                sx={{
                  border: hasExams ? '2px solid' : '1px solid',
                  borderColor: hasExams ? 'error.main' : 'divider',
                }}
              >
                <DayHeader>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: hasExams ? 'bold' : 'normal',
                      color: hasExams ? 'error.main' : 'text.secondary',
                    }}
                  >
                    {day}
                  </Typography>
                </DayHeader>

                {hasExams && (
                  <Box
                    sx={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}
                  >
                    {exams.map((exam) => {
                      const progress = calculateProgress(exam.currentPage || 0, exam.totalPages);

                      return (
                        <Card
                          key={exam.id}
                          variant="outlined"
                          sx={{
                            mb: 0.5,
                            bgcolor: 'rgba(255, 0, 0, 0.03)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            border: '1px solid rgba(255, 0, 0, 0.1)',
                          }}
                        >
                          <CardContent sx={{ p: '4px!important', height: '100%' }}>
                            <Typography
                              variant="caption"
                              component="div"
                              noWrap
                              sx={{ fontWeight: 'bold' }}
                            >
                              {exam.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <MenuBookIcon sx={{ fontSize: '0.8rem', mr: 0.5 }} />
                              <Typography variant="caption">{progress}%</Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Box>
                )}
              </CalendarDay>
            </Grid>
          );
        })}
      </Grid>

      {/* 凡例 */}
      <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body2">
          ※ 赤い枠の日付は試験日です。クリックすると科目の詳細が表示されます。
        </Typography>
      </Box>
    </Paper>
  );
};
