import React, { useMemo } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  Box, 
  Divider, 
  Chip,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Event as EventIcon,
  ArrowForward as ArrowForwardIcon,
  MenuBook as MenuBookIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { Subject } from '../../../../domain/models/SubjectModel';

// 試験日ごとにグループ化した科目リスト
interface ExamGroup {
  date: Date;
  subjects: Subject[];
  daysRemaining: number;
}

interface UpcomingExamsCardProps {
  subjects: Subject[];
}

/**
 * 今後の試験と科目を日付でグループ化して表示するカード
 */
export const UpcomingExamsCard: React.FC<UpcomingExamsCardProps> = ({ subjects }) => {
  // 科目を試験日ごとにグループ化
  const examGroups = useMemo(() => {
    console.log('UpcomingExamsCard received subjects:', subjects);
    const groups: { [key: string]: ExamGroup } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 有効な科目のみフィルタリング
    const validSubjects = subjects.filter(subject => {
      // 科目が有効で試験日が設定されているか確認
      if (!subject || !subject.examDate) {
        console.log('Filtered out subject with missing data:', subject);
        return false;
      }

      try {
        const examDate = new Date(subject.examDate);
        // 無効な日付はフィルタリング
        if (isNaN(examDate.getTime())) {
          console.log('Filtered out subject with invalid date:', subject.name, subject.examDate);
          return false;
        }
        
        const isUpcoming = examDate >= today;
        if (!isUpcoming) {
          console.log('Filtered out past exam date:', subject.name, examDate.toISOString());
        }
        return isUpcoming;
      } catch (err) {
        console.error('Error processing subject for exam card:', subject, err);
        return false;
      }
    });

    console.log('Valid subjects for exam groups:', validSubjects);

    // 試験日ごとにグループ化
    validSubjects.forEach(subject => {
      if (!subject.examDate) return;

      try {
        const examDate = new Date(subject.examDate);
        examDate.setHours(0, 0, 0, 0);
        const dateKey = examDate.toISOString().split('T')[0];

        // 残り日数を計算
        const daysRemaining = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (!groups[dateKey]) {
          groups[dateKey] = {
            date: examDate,
            subjects: [],
            daysRemaining
          };
        }

        groups[dateKey].subjects.push(subject);
      } catch (err) {
        console.error('Error grouping subject by date:', subject, err);
      }
    });

    // 日付順にソートして配列に変換
    const sortedGroups = Object.values(groups).sort((a, b) => a.date.getTime() - b.date.getTime());
    console.log('Sorted exam groups:', sortedGroups);
    return sortedGroups;
  }, [subjects]);

  // 残り日数に応じた色を返す
  const getDaysRemainingColor = (days: number): string => {
    if (days <= 7) return '#f44336'; // 赤: 1週間以内
    if (days <= 14) return '#ff9800'; // オレンジ: 2週間以内
    if (days <= 30) return '#4caf50'; // 緑: 1ヶ月以内
    return '#2196f3'; // 青: それ以上先
  };

  // 日付のフォーマット
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  if (!examGroups.length) {
    return (
      <Box>
        <CardHeader 
          title="試験スケジュール" 
          titleTypographyProps={{ variant: 'h6' }}
          avatar={<EventIcon />}
        />
        <CardContent>
          <Typography variant="body2" color="text.secondary" align="center">
            今後の試験予定はありません
          </Typography>
        </CardContent>
      </Box>
    );
  }

  return (
    <Box>
      <CardHeader 
        title="試験スケジュール" 
        titleTypographyProps={{ variant: 'h6' }}
        avatar={<EventIcon />}
      />
      <CardContent sx={{ 
        maxHeight: { xs: '300px', sm: '350px', md: '400px' }, 
        overflow: 'auto',
        p: { xs: 1, sm: 2 }
      }}>
        {examGroups.map((group, index) => (
          <Box key={group.date.toISOString()} sx={{ mb: index < examGroups.length - 1 ? 3 : 0 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                mb: 1,
                borderLeft: `4px solid ${getDaysRemainingColor(group.daysRemaining)}`,
                bgcolor: 'background.paper'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {formatDate(group.date)}
                </Typography>
                <Chip 
                  label={`残り${group.daysRemaining}日`} 
                  size="small"
                  sx={{ 
                    bgcolor: getDaysRemainingColor(group.daysRemaining),
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              {group.subjects.map(subject => (
                <Box 
                  key={subject.id} 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': {
                      borderBottom: 'none'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MenuBookIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2">{subject.name}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                      {subject.currentPage}/{subject.totalPages}ページ
                    </Typography>
                    <Chip 
                      label={`${Math.round((subject.currentPage / subject.totalPages) * 100)}%`} 
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </Box>
              ))}
            </Paper>
          </Box>
        ))}
      </CardContent>
    </Box>
  );
}; 