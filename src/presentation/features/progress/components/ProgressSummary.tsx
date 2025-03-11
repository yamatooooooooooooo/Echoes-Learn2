import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress,
  Alert,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Divider,
  useTheme,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip
} from '@mui/material';
import { 
  MenuBook as MenuBookIcon,
  CalendarToday as CalendarTodayIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { SubjectRepository } from '../../../../infrastructure/repositories/subjectRepository';
import { ProgressRepository } from '../../../../infrastructure/repositories/progressRepository';
import { Subject } from '../../../../domain/models/SubjectModel';
import { Progress } from '../../../../domain/models/ProgressModel';
import { ProgressChart } from './ProgressChart';
import { NotionStyleCard } from '../../../components/common/NotionStyleCard';
import { InfoSection } from '../../../components/common/HierarchicalContent';
import { ICONS } from '../../../../config/appIcons';
import { OutlinedIcon } from '../../../components/common/OutlinedIcon';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import { useFirebase } from '../../../../contexts/FirebaseContext';

interface SubjectWithProgress extends Subject {
  totalPagesRead: number;
  progressHistory: Progress[];
  lastStudyDate: string | null;
}

export const ProgressSummary: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<SubjectWithProgress[]>([]);
  
  // Firebaseサービスを取得
  const { firestore, auth } = useFirebase();
  
  const loadSubjectsWithProgress = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 認証状態の確認
      const currentUser = auth.currentUser;
      const userId = currentUser?.uid;
      
      if (!userId) {
        setError('認証されていません。ログインしてください。');
        setLoading(false);
        return;
      }
      
      // リポジトリの初期化
      const subjectRepository = new SubjectRepository(firestore, auth);
      const progressRepository = new ProgressRepository(firestore, auth);
      
      // 科目一覧を取得
      const allSubjects = await subjectRepository.getAllSubjects(userId);
      if (!allSubjects || allSubjects.length === 0) {
        setSubjects([]);
        setLoading(false);
        return;
      }
      
      // 全ての進捗データを1回のクエリで取得
      const allProgress = await progressRepository.getAllProgress(auth.currentUser?.uid || '');
      
      // 日付でソート（降順）
      allProgress.sort((a, b) => {
        const dateA = new Date(a.createdAt || new Date()).getTime();
        const dateB = new Date(b.createdAt || new Date()).getTime();
        return dateB - dateA; // 降順ソート
      });
      
      // 科目ごとの進捗データをグループ化
      const progressBySubject = new Map<string, Progress[]>();
      
      if (allProgress && Array.isArray(allProgress)) {
        allProgress.forEach(progress => {
          if (progress && progress.subjectId) {
            const subjectId = progress.subjectId;
            if (!progressBySubject.has(subjectId)) {
              progressBySubject.set(subjectId, []);
            }
            progressBySubject.get(subjectId)!.push(progress);
          }
        });
      }
      
      // 各科目にマッピングする
      const subjectsWithProgress = allSubjects.map(subject => {
        const progressHistory = progressBySubject.get(subject.id) || [];
        
        // 総読書ページ数を計算
        const totalPagesRead = progressHistory.reduce(
          (total, progress) => total + (progress.pagesRead || 0), 
          0
        );
        
        // 最後の学習日を特定
        let lastStudyDate: string | null = null;
        
        try {
          const validDates = progressHistory
            .filter(p => p && p.recordDate)
            .map(p => {
              try {
                return new Date(p.recordDate).getTime();
              } catch (e) {
                return 0;
              }
            })
            .filter(timestamp => !isNaN(timestamp) && timestamp > 0);
            
          lastStudyDate = validDates.length > 0 
            ? new Date(Math.max(...validDates)).toISOString().split('T')[0] 
            : null;
        } catch (dateError) {
          console.error('日付の処理でエラーが発生しました:', dateError);
          lastStudyDate = null;
        }
        
        return {
          ...subject,
          totalPagesRead,
          progressHistory,
          lastStudyDate
        };
      });
      
      setSubjects(subjectsWithProgress);
    } catch (error) {
      console.error('データの取得に失敗しました:', error);
      setError('データの取得に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadSubjectsWithProgress();
  }, [firestore, auth]); // 依存配列にFirebaseサービスを追加
  
  const formatDate = (dateStr: string | Date | null) => {
    if (!dateStr) return '記録なし';
    
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const calculateProgressPercentage = (current: number, total: number) => {
    if (total <= 0) return 0;
    return Math.round((current / total) * 100);
  };

  // 全体の統計情報を計算
  const calculateOverallStats = () => {
    if (subjects.length === 0) return { totalPages: 0, completedPages: 0, totalRead: 0, completionPercentage: 0 };
    
    const totalPages = subjects.reduce((sum, subject) => sum + subject.totalPages, 0);
    const totalRead = subjects.reduce((sum, subject) => sum + subject.totalPagesRead, 0);
    const completedPages = subjects.reduce((sum, subject) => sum + (subject.currentPage || 0), 0);
    const completionPercentage = calculateProgressPercentage(completedPages, totalPages);
    
    return { totalPages, completedPages, totalRead, completionPercentage };
  };
  
  // 最近の進捗状況を取得（過去7日分）
  const getRecentProgress = () => {
    if (subjects.length === 0) return [];
    
    // 今日から7日前までの日付を生成
    const today = new Date();
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    // 日付ごとのページ数を集計
    const dailyPages: {[key: string]: number} = {};
    dates.forEach(date => {
      dailyPages[date] = 0;
    });
    
    // 各科目の進捗を集計
    subjects.forEach(subject => {
      subject.progressHistory.forEach(progress => {
        const date = typeof progress.recordDate === 'string' 
          ? progress.recordDate 
          : new Date(progress.recordDate).toISOString().split('T')[0];
          
        if (dates.includes(date)) {
          dailyPages[date] = (dailyPages[date] || 0) + progress.pagesRead;
        }
      });
    });
    
    // チャート用にデータを変換
    return dates.map(date => ({
      date: new Date(date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
      pages: dailyPages[date]
    }));
  };
  
  // カスタムツールチップ
  const CustomPieTooltip: React.FC<any> = (props) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box sx={{
          bgcolor: 'background.paper',
          p: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: 1,
        }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            {data.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            完了率: {data.percentage}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            学習済み: {data.currentPage} / {data.totalPages}ページ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            合計読書量: {data.value}ページ
          </Typography>
        </Box>
      );
    }
    return null;
  };
  
  // Reactのフックはトップレベルで呼び出す必要があります（条件付きレンダリングの前）
  // 安全のためにstatsとrecentProgressをmemoize化
  const stats = React.useMemo(() => {
    if (!subjects || subjects.length === 0) {
      return { totalPages: 0, completedPages: 0, totalRead: 0, completionPercentage: 0 };
    }
    return calculateOverallStats();
  }, [subjects]);
  
  const recentProgress = React.useMemo(() => {
    if (!subjects || subjects.length === 0) {
      return [];
    }
    return getRecentProgress();
  }, [subjects]);
  
  // サイドエフェクトを避けるためにPieChartデータとカラースキームもmemoize化
  const subjectPieChartData = React.useMemo(() => {
    if (!subjects || subjects.length === 0) {
      return [];
    }
    
    return subjects.map(subject => {
      const currentPage = subject.currentPage || 0;
      const percentage = subject.totalPages > 0 
        ? Math.round((currentPage / subject.totalPages) * 100) 
        : 0;
        
      return {
        name: subject.name,
        value: subject.totalPagesRead || 1, // 0の場合は1にして円グラフに表示されるようにする
        percentage,
        currentPage,
        totalPages: subject.totalPages,
        remainingPages: subject.totalPages - currentPage
      };
    });
  }, [subjects]);
  
  const colorScheme = React.useMemo(() => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      '#4caf50',
      '#ff9800',
      '#9c27b0',
      '#f44336',
      '#00bcd4',
      '#3f51b5',
      '#ff5722',
      '#009688'
    ];
    
    if (!subjects || subjects.length === 0) {
      return [];
    }
    
    return subjects.map((_: any, index: number) => colors[index % colors.length]);
  }, [subjects, theme.palette.primary.main, theme.palette.secondary.main]);
  
  // コンポーネントのレンダリング条件
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (!subjects || subjects.length === 0) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        表示する進捗データがありません。まず科目を追加してから進捗を記録してください。
      </Alert>
    );
  }
  
  // 以下、メインのレンダリング
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
        進捗記録ダッシュボード
      </Typography>
      
      {/* サマリーカード - 主要指標 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ 
            p: 3, 
            borderRadius: 2, 
            height: '100%',
            border: '1px solid #EAEAEA',
            bgcolor: '#FAFAFA'
          }}>
            <InfoSection
              title="総ページ数"
              icon={ICONS.library}
              importance="primary"
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-end', mt: 2 }}>
                <Typography variant="h3" sx={{ fontWeight: 600, mr: 1 }}>
                  {stats.completedPages}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 0.5, fontWeight: 400 }}>
                  / {stats.totalPages}
                </Typography>
              </Box>
              
              <Box sx={{ mt: 1, mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  完了率: {stats.completionPercentage}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={stats.completionPercentage} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </InfoSection>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ 
            p: 3, 
            borderRadius: 2, 
            height: '100%',
            border: '1px solid #EAEAEA',
            bgcolor: '#FAFAFA'
          }}>
            <InfoSection
              title="学習状況"
              icon={ICONS.menuBook}
              importance="primary"
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-end', mt: 2 }}>
                <Typography variant="h3" sx={{ fontWeight: 600, mr: 1 }}>
                  {stats.totalRead}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
                  ページ学習
                </Typography>
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  登録科目: {subjects.length}科目
                </Typography>
              </Box>
            </InfoSection>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ 
            p: 3, 
            borderRadius: 2, 
            height: '100%',
            border: '1px solid #EAEAEA',
            bgcolor: '#FAFAFA'
          }}>
            <InfoSection
              title="直近の活動"
              icon={ICONS.timeline}
              importance="primary"
            >
              {subjects.length > 0 && subjects[0].lastStudyDate ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <OutlinedIcon icon={ICONS.calendarToday} size="medium" sx={{ mr: 1.5 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        最終学習日
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatDate(subjects[0].lastStudyDate)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      今週の学習
                    </Typography>
                    <Chip 
                      label={`${recentProgress.reduce((sum, day) => sum + (day.pages || 0), 0)} ページ`} 
                      color="primary" 
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  記録がありません
                </Typography>
              )}
            </InfoSection>
          </Paper>
        </Grid>
      </Grid>
      
      {/* グラフセクション */}
      <Grid container spacing={3}>
        {/* 進捗チャート */}
        <Grid item xs={12} md={8}>
          <NotionStyleCard title="進捗の推移">
            <ProgressChart subjects={subjects} />
          </NotionStyleCard>
        </Grid>
        
        {/* 円グラフ */}
        <Grid item xs={12} md={4}>
          <NotionStyleCard title="科目別進捗状況">
            <Box sx={{ height: 330, width: '100%' }}>
              {subjectPieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectPieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {subjectPieChartData.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={colorScheme[index] || '#ccc'} />
                      ))}
                    </Pie>
                    <Legend layout="vertical" align="right" verticalAlign="middle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <Typography color="text.secondary">データがありません</Typography>
                </Box>
              )}
            </Box>
          </NotionStyleCard>
        </Grid>
        
        {/* 詳細リスト */}
        <Grid item xs={12}>
          <NotionStyleCard title="科目別詳細">
            <Grid container spacing={2}>
              {subjects.map((subject) => (
                <Grid item xs={12} sm={6} md={4} key={subject.id}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2 }}>
                        {subject.name}
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          進捗状況 ({subject.currentPage || 0} / {subject.totalPages} ページ)
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={calculateProgressPercentage(subject.currentPage || 0, subject.totalPages)} 
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            完了率
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {calculateProgressPercentage(subject.currentPage || 0, subject.totalPages)}%
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            合計学習ページ
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {subject.totalPagesRead} ページ
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary">
                            最終学習日
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formatDate(subject.lastStudyDate)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </NotionStyleCard>
        </Grid>
      </Grid>
    </Box>
  );
}; 