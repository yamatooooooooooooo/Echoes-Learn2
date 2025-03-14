import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Flag as FlagIcon,
  PriorityHigh as PriorityHighIcon,
  Sort as SortIcon,
  CalendarToday as CalendarIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { NotionStyleCard } from '../../../components/common/NotionStyleCard';
import { SubjectRepository } from '../../../../infrastructure/repositories/subjectRepository';
import { useFirebase } from '../../../../contexts/FirebaseContext';

interface PrioritySubject {
  id: string;
  name: string;
  daysRemaining: number;
  priority: 'high' | 'medium' | 'low';
}

interface PrioritySubjectsCardProps {
  getPriorityColor: (priority: 'high' | 'medium' | 'low') => string;
  isLoading: boolean;
}

/**
 * 優先度の高い科目リストを表示するカードコンポーネント
 */
export const PrioritySubjectsCard: React.FC<PrioritySubjectsCardProps> = ({
  getPriorityColor,
  isLoading,
}) => {
  const [prioritySubjects, setPrioritySubjects] = useState<PrioritySubject[]>([]);
  const [isLoadingInternal, setIsLoadingInternal] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [sortBy, setSortBy] = useState<'priority' | 'daysRemaining'>('priority');

  // Firebaseサービスを取得
  const { firestore, auth } = useFirebase();

  // 外部のisLoadingプロパティが変更されたときに内部状態を更新
  useEffect(() => {
    if (!isLoading) {
      // 外部のローディングが終了した場合のみ更新
      // これにより、内部のローディングが優先される
      setIsLoadingInternal(false);
    }
  }, [isLoading]);

  // メニューの開閉状態
  const isSortMenuOpen = Boolean(sortAnchorEl);

  // ソートメニューを開く
  const handleSortMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  // ソートメニューを閉じる
  const handleSortMenuClose = () => {
    setSortAnchorEl(null);
  };

  // ソート方法を変更
  const handleSortChange = (sortType: 'priority' | 'daysRemaining') => {
    setSortBy(sortType);
    handleSortMenuClose();

    // データをソート
    sortPrioritySubjects(sortType);
  };

  // データのソート
  const sortPrioritySubjects = (sortType: 'priority' | 'daysRemaining') => {
    const sortedSubjects = [...prioritySubjects];

    if (sortType === 'priority') {
      // 優先度順（high > medium > low）
      sortedSubjects.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    } else {
      // 残り日数順（少ない順）
      sortedSubjects.sort((a, b) => a.daysRemaining - b.daysRemaining);
    }

    setPrioritySubjects(sortedSubjects);
  };

  // 科目データの取得
  React.useEffect(() => {
    const fetchPrioritySubjects = async () => {
      setIsLoadingInternal(true);
      setError(null);

      try {
        // 認証状態の確認
        const currentUser = auth.currentUser;
        const userId = currentUser?.uid;

        if (!userId) {
          setError('認証されていません。ログインしてください。');
          return;
        }

        // リポジトリの初期化
        const subjectRepository = new SubjectRepository(firestore, auth);
        const subjects = await subjectRepository.getAllSubjects(userId);

        // 試験日が設定されている科目のみ抽出
        const subjectsWithExams = subjects.filter((s) => s.examDate);

        // 優先度の高い順にソート（同じ優先度なら試験日が近い順）
        const prioritySubjectsList = subjectsWithExams.map((subject) => {
          const examDate = new Date(subject.examDate);
          const today = new Date();
          const daysRemaining = Math.ceil(
            (examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          return {
            id: subject.id,
            name: subject.name,
            daysRemaining,
            priority: subject.priority || 'low',
          };
        });

        // 優先度順にソート
        const sorted = prioritySubjectsList.sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        setPrioritySubjects(sorted.slice(0, 5)); // 上位5件のみ表示
      } catch (err) {
        console.error('優先度の高い科目の取得に失敗しました:', err);
        setError('データの取得に失敗しました');
      } finally {
        setIsLoadingInternal(false);
      }
    };

    fetchPrioritySubjects();
  }, [firestore, auth]); // 依存配列にFirebaseサービスを追加

  // ローディング状態
  if (isLoading || isLoadingInternal) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            優先度の高い科目
          </Typography>
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  // エラー発生時
  if (error) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            優先度の高い科目
          </Typography>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  // 優先科目がない場合
  if (!prioritySubjects || prioritySubjects.length === 0) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            優先度の高い科目
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
            <FlagIcon color="disabled" sx={{ fontSize: 40, opacity: 0.5, mr: 2 }} />
            <Typography variant="body1" color="text.secondary">
              優先度の高い科目はありません
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            <FlagIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">優先度の高い科目</Typography>
          </Box>

          {/* ソートボタン */}
          <Tooltip title="ソート方法を変更">
            <IconButton
              size="small"
              onClick={handleSortMenuOpen}
              aria-label="sort options"
              aria-controls="priority-sort-menu"
              aria-haspopup="true"
              aria-expanded={isSortMenuOpen ? 'true' : undefined}
            >
              <SortIcon />
            </IconButton>
          </Tooltip>

          {/* ソートメニュー */}
          <Menu
            id="priority-sort-menu"
            anchorEl={sortAnchorEl}
            open={isSortMenuOpen}
            onClose={handleSortMenuClose}
            MenuListProps={{
              'aria-labelledby': 'sort-button',
            }}
          >
            <MenuItem onClick={() => handleSortChange('priority')} selected={sortBy === 'priority'}>
              優先度順
            </MenuItem>
            <MenuItem
              onClick={() => handleSortChange('daysRemaining')}
              selected={sortBy === 'daysRemaining'}
            >
              試験日順
            </MenuItem>
          </Menu>
        </Box>

        <List disablePadding>
          {prioritySubjects.map((subject, index) => (
            <React.Fragment key={subject.id}>
              {index > 0 && <Divider component="li" />}
              <ListItem sx={{ py: 1.5, px: 0 }}>
                <ListItemIcon>
                  <PriorityHighIcon sx={{ color: getPriorityColor(subject.priority) }} />
                </ListItemIcon>

                <ListItemText
                  primary={subject.name}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon
                        fontSize="small"
                        sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        あと{subject.daysRemaining}日
                      </Typography>
                    </Box>
                  }
                />

                <Chip
                  label={subject.priority}
                  size="small"
                  sx={{
                    bgcolor: `${getPriorityColor(subject.priority)}20`,
                    color: getPriorityColor(subject.priority),
                    fontWeight: 'bold',
                  }}
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};
