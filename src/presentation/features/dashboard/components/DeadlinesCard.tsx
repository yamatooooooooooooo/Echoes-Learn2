import React, { useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Divider, 
  CardHeader, 
  CardContent,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  Event as EventIcon,
  ArrowForward as ArrowForwardIcon,
  MenuBook as MenuBookIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { Subject } from '../../../../domain/models/SubjectModel';

// 締切日ごとにグループ化した科目リスト
interface DeadlineGroup {
  date: Date;
  subjects: Subject[];
  daysRemaining: number;
  type: 'report' | 'assignment' | 'other';
}

interface DeadlinesCardProps {
  subjects: Subject[];
}

/**
 * レポート締切日などの重要な期限を表示するカード
 */
export const DeadlinesCard: React.FC<DeadlinesCardProps> = ({ subjects }) => {
  // 科目を締切日ごとにグループ化
  const deadlineGroups = useMemo(() => {
    const groups: { [key: string]: DeadlineGroup } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 有効な科目のみフィルタリング
    const validSubjects = subjects.filter(subject => {
      if (!subject || !subject.reportDeadline) {
        return false;
      }

      try {
        const deadlineDate = new Date(subject.reportDeadline);
        if (isNaN(deadlineDate.getTime())) {
          return false;
        }
        
        return deadlineDate >= today;
      } catch (err) {
        console.error('Error processing subject for deadline card:', subject, err);
        return false;
      }
    });

    // 締切日ごとにグループ化
    validSubjects.forEach(subject => {
      if (!subject.reportDeadline) return;

      try {
        const deadlineDate = new Date(subject.reportDeadline);
        deadlineDate.setHours(0, 0, 0, 0);
        const dateKey = deadlineDate.toISOString().split('T')[0];

        // 残り日数を計算
        const daysRemaining = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // 締切タイプを判定（将来的には科目データからタイプを取得できるように拡張予定）
        const type = subject.deadlineType || 'report';

        if (!groups[dateKey]) {
          groups[dateKey] = {
            date: deadlineDate,
            subjects: [],
            daysRemaining,
            type: type as 'report' | 'assignment' | 'other'
          };
        }

        groups[dateKey].subjects.push(subject);
      } catch (err) {
        console.error('Error grouping subject by deadline date:', subject, err);
      }
    });

    // 日付順にソートして配列に変換
    return Object.values(groups).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [subjects]);

  // 残り日数に応じた色を返す
  const getDaysRemainingColor = (days: number): string => {
    if (days <= 3) return '#f44336'; // 赤: 3日以内
    if (days <= 7) return '#ff9800'; // オレンジ: 1週間以内
    if (days <= 14) return '#4caf50'; // 緑: 2週間以内
    return '#2196f3'; // 青: それ以上先
  };

  // 締切タイプに応じたラベルを返す
  const getDeadlineTypeLabel = (type: string): string => {
    switch (type) {
      case 'report': return 'レポート締切';
      case 'assignment': return '課題締切';
      default: return '締切';
    }
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

  if (!deadlineGroups.length) {
    return (
      <Box>
        <CardHeader 
          title="レポート・課題締切" 
          titleTypographyProps={{ variant: 'h6' }}
          avatar={<AssignmentIcon />}
        />
        <CardContent>
          <Typography variant="body2" color="text.secondary" align="center">
            今後の提出期限はありません
          </Typography>
        </CardContent>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <CardHeader 
        title="レポート・課題締切" 
        titleTypographyProps={{ variant: 'h6' }}
        avatar={<AssignmentIcon />}
      />
      <CardContent sx={{ 
        maxHeight: { xs: '300px', sm: '350px', md: '400px' }, 
        overflow: 'auto',
        p: { xs: 1, sm: 2 },
        width: '100%'
      }}>
        {deadlineGroups.map((group, index) => (
          <Box key={group.date.toISOString()} sx={{ mb: index < deadlineGroups.length - 1 ? 3 : 0, width: '100%' }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                mb: 1,
                width: '100%',
                borderLeft: `4px solid ${getDaysRemainingColor(group.daysRemaining)}`,
                bgcolor: 'background.paper',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {formatDate(group.date)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={getDeadlineTypeLabel(group.type)}
                    size="small"
                    color="secondary"
                    variant="outlined"
                    sx={{ fontWeight: 'medium' }}
                  />
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
                    <AccessTimeIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {subject.reportDetails || '詳細なし'}
                    </Typography>
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