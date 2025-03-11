import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container,
  Grid,
  Paper,
  CircularProgress,
  Tabs,
  Tab,
  Button,
  useTheme,
  Divider,
  Chip
} from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AlarmIcon from '@mui/icons-material/Alarm';
// Firebaseのインポート
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
// Firebaseコンテキストのインポート
import { useFirebase } from '../../../../contexts/FirebaseContext';

// リポジトリクラスの型定義
class SubjectRepository {
  constructor(private firestore: Firestore, private auth: Auth) {}
  async getAllSubjects(userId: string): Promise<Subject[]> {
    console.log('全科目を取得中...', userId);
    return [];
  }
}

class ProgressRepository {
  constructor(private firestore: Firestore, private auth: Auth) {}
  async getAllProgress(userId: string): Promise<Progress[]> {
    console.log('全進捗を取得中...', userId);
    return [];
  }
}

class StudyAnalyticsRepository {
  constructor(private firestore: Firestore, private auth: Auth) {}
  async getStudyStatistics(userId: string): Promise<any> {
    console.log('学習統計を取得中...', userId);
    return {
      studySessions: [],
      performances: []
    };
  }
}

// モデルの型定義
interface Subject {
  id: string;
  name: string;
  totalPages: number;
  currentPage: number;
}

interface Progress {
  id?: string;
  subjectId: string;
  startPage: number;
  endPage: number;
  pagesRead: number;
  recordDate: string;
  createdAt: string;
}

interface StudySession {
  id?: string;
  userId: string;
  date: string;
  duration: number;
  subjectId: string;
}

interface SubjectPerformance {
  userId: string;
  subjectId: string;
  name: string;
  progress: number;
  efficiency: number;
  lastStudied: string;
  recommendedStudyTime: number;
  studyFrequency: number;
  strengths: string[];
  weaknesses: string[];
  updatedAt: Date;
}

// タブパネルのインターフェース
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * タブパネルコンポーネント
 */
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`progress-tabpanel-${index}`}
      aria-labelledby={`progress-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

/**
 * アクセシビリティの補助関数
 */
const a11yProps = (index: number) => {
  return {
    id: `progress-tab-${index}`,
    'aria-controls': `progress-tabpanel-${index}`,
  };
};

/**
 * 学習習慣分析コンポーネント
 */
const StudyHabitAnalysis: React.FC<{
  progressData: Progress[];
  studySessions: StudySession[];
  subjects: Subject[];
}> = ({ progressData, studySessions, subjects }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>学習習慣分析</Typography>
      <Typography>このコンポーネントは実装中です。</Typography>
    </Box>
  );
};

/**
 * 学習効率チャートコンポーネント
 */
const LearningEfficiencyChart: React.FC<{
  progressData: Progress[];
  studySessions: StudySession[];
  subjectPerformances: SubjectPerformance[];
  subjects: Subject[];
}> = ({ progressData, studySessions, subjectPerformances, subjects }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>学習効率チャート</Typography>
      <Typography>このコンポーネントは実装中です。</Typography>
    </Box>
  );
};

/**
 * 達成状況トラッカーコンポーネント
 */
const AchievementTracker: React.FC<{
  progressData: Progress[];
  subjects: Subject[];
  studySessions?: StudySession[];
}> = ({ progressData, subjects, studySessions = [] }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>達成状況トラッカー</Typography>
      <Typography>このコンポーネントは実装中です。</Typography>
    </Box>
  );
};

/**
 * 学習推奨コンポーネント
 */
const StudyRecommendations: React.FC<{
  subjectPerformances: SubjectPerformance[];
  subjects: Subject[];
  progressData: Progress[];
}> = ({ subjectPerformances, subjects, progressData }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>学習推奨</Typography>
      <Typography>このコンポーネントは実装中です。</Typography>
    </Box>
  );
};

/**
 * 学習進捗の統計情報を表示するコンポーネント
 */
export const ProgressStats: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [progressData, setProgressData] = useState<Progress[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [subjectPerformances, setSubjectPerformances] = useState<SubjectPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [studyStreak, setStudyStreak] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [averageEfficiency, setAverageEfficiency] = useState(0);
  const [averageDailyStudy, setAverageDailyStudy] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [completedPages, setCompletedPages] = useState(0);
  const [achievements, setAchievements] = useState<any[]>([]);
  
  // Firebaseサービスを取得
  const { firestore, auth } = useFirebase();
  
  // タブ変更ハンドラー
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // データの読み込み
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 認証状態の確認
        const currentUser = auth.currentUser;
        const userId = currentUser?.uid;
        
        if (!userId) {
          setError('認証されていません。ログインしてください。');
          setLoading(false);
          return;
        }
        
        // リポジトリインスタンスの作成
        const subjectRepo = new SubjectRepository(firestore, auth);
        const progressRepo = new ProgressRepository(firestore, auth);
        const studyAnalyticsRepo = new StudyAnalyticsRepository(firestore, auth);
        
        // データの取得
        const [
          subjectsData, 
          allProgress,
          sessions
        ] = await Promise.all([
          subjectRepo.getAllSubjects(userId),
          progressRepo.getAllProgress(userId),
          studyAnalyticsRepo.getStudyStatistics(userId)
        ]);
        
        // データの設定
        setSubjects(subjectsData || []);
        setProgressData(allProgress || []);
        setStudySessions(sessions?.studySessions || []);
        setSubjectPerformances(sessions?.performances || []);
        
        // 統計データの計算
        calculateOverallStats(
          subjectsData || [], 
          allProgress || [], 
          sessions?.studySessions || [],
          sessions?.performances || []
        );
        
        // 学習ストリークの計算
        const streak = calculateStudyStreak(allProgress || []);
        setStudyStreak(streak);
        
        // 全体の進捗度を計算
        const progress = calculateOverallProgress();
        setOverallProgress(progress);
        
      } catch (err) {
        console.error('データロードエラー:', err);
        setError('データの読み込み中にエラーが発生しました。後でもう一度お試しください。');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [auth, firestore]); // 依存配列にauthとfirestoreを追加

  // 全体統計の計算
  const calculateOverallStats = (
    subjects: Subject[], 
    progresses: Progress[], 
    sessions: StudySession[],
    performances: SubjectPerformance[]
  ) => {
    // 科目数
    const totalSubjects = subjects.length;
    
    // 総ページ数と完了ページ数
    const totalPagesCount = subjects.reduce((total, subject) => total + (subject.totalPages || 0), 0);
    const completedPagesCount = subjects.reduce((total, subject) => total + (subject.currentPage || 0), 0);
    setTotalPages(totalPagesCount);
    setCompletedPages(completedPagesCount);
    
    // 平均学習効率
    const efficiencySum = performances.reduce((sum, perf) => sum + (perf.efficiency || 0), 0);
    const avgEfficiency = performances.length > 0 ? Math.round(efficiencySum / performances.length) : 0;
    setAverageEfficiency(avgEfficiency);
    
    // 総学習時間（分単位）
    const totalTime = sessions.reduce((total, session) => total + (session.duration || 0), 0);
    
    // 学習日数
    const studyDays = new Set(sessions.map(session => 
      new Date(session.date).toISOString().split('T')[0]
    )).size;
    
    // 1日平均学習時間
    const avgDailyStudy = studyDays > 0 ? Math.round(totalTime / studyDays) : 0;
    setAverageDailyStudy(avgDailyStudy);
    
    setTotalStudyTime(totalTime);
    setStudyStreak(calculateStudyStreak(progresses));
    setOverallProgress(Math.round((completedPagesCount / totalPagesCount) * 100));
  };

  // 学習ストリークの計算
  const calculateStudyStreak = (progresses: Progress[]): number => {
    if (progresses.length === 0) return 0;
    
    // 日付でソート（最新の日付が先頭）
    const sortedDates = progresses
      .filter(p => p.recordDate) // 日付があるもののみ
      .map(p => new Date(p.recordDate as string).toISOString().split('T')[0]) // YYYY-MM-DD形式に変換
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // 降順ソート
    
    if (sortedDates.length === 0) return 0;
    
    // 重複を削除
    const uniqueDates = Array.from(new Set(sortedDates));
    
    // 今日の日付
    const today = new Date().toISOString().split('T')[0];
    
    // 最新の学習日が今日または昨日でなければストリークなし
    const latestDate = uniqueDates[0];
    if (latestDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (latestDate !== yesterdayStr) {
        return 0; // 昨日も今日も学習していなければストリークなし
      }
    }
    
    // ストリークを計算
    let streak = 1; // 最新の日付（今日または昨日）でスタート
    let currentDate = new Date(uniqueDates[0]);
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      const prevDateStr = prevDate.toISOString().split('T')[0];
      
      if (uniqueDates[i] === prevDateStr) {
        streak++;
        currentDate = prevDate;
      } else {
        break; // 連続していない日があればそこで終了
      }
    }
    
    return streak;
  };

  // 進捗率の計算
  const calculateOverallProgress = (): number => {
    return totalPages > 0 
      ? Math.round((completedPages / totalPages) * 100) 
      : 0;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          再読み込み
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 2, 
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)' 
        }}
      >
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <TimelineIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
          <Typography variant="h5" component="h1" fontWeight="bold">
            学習統計＆分析
          </Typography>
          <Chip 
            label={`${calculateOverallProgress()}% 完了`} 
            color="primary" 
            size="small" 
            sx={{ ml: 2 }} 
          />
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                textAlign: 'center',
                border: `1px solid ${theme.palette.divider}`,
                borderLeft: `4px solid ${theme.palette.primary.main}`,
                borderRadius: 2
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">総学習時間</Typography>
              <Typography variant="h5" sx={{ mt: 1, fontWeight: 'bold' }}>
                {Math.floor(totalStudyTime / 60)}時間 {totalStudyTime % 60}分
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                textAlign: 'center',
                border: `1px solid ${theme.palette.divider}`,
                borderLeft: `4px solid ${theme.palette.secondary.main}`,
                borderRadius: 2
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">学習ストリーク</Typography>
              <Typography variant="h5" sx={{ mt: 1, fontWeight: 'bold' }}>
                {studyStreak}日連続
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                textAlign: 'center',
                border: `1px solid ${theme.palette.divider}`,
                borderLeft: `4px solid #4caf50`,
                borderRadius: 2
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">平均学習効率</Typography>
              <Typography variant="h5" sx={{ mt: 1, fontWeight: 'bold' }}>
                {Math.round(averageEfficiency)}/100
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                textAlign: 'center',
                border: `1px solid ${theme.palette.divider}`,
                borderLeft: `4px solid #ff9800`,
                borderRadius: 2
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">1日平均学習時間</Typography>
              <Typography variant="h5" sx={{ mt: 1, fontWeight: 'bold' }}>
                {Math.floor(averageDailyStudy / 60)}時間 {averageDailyStudy % 60}分
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="学習分析タブ"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              icon={<TrendingUpIcon />} 
              label="学習習慣分析" 
              {...a11yProps(0)} 
            />
            <Tab 
              icon={<LightbulbIcon />} 
              label="学習効率" 
              {...a11yProps(1)} 
            />
            <Tab 
              icon={<EmojiEventsIcon />} 
              label="達成トラッカー" 
              {...a11yProps(2)} 
            />
            <Tab 
              icon={<AlarmIcon />} 
              label="学習レコメンド" 
              {...a11yProps(3)} 
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <StudyHabitAnalysis 
            progressData={progressData}
            studySessions={studySessions}
            subjects={subjects}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <LearningEfficiencyChart 
            progressData={progressData}
            studySessions={studySessions}
            subjectPerformances={subjectPerformances}
            subjects={subjects}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <AchievementTracker 
            progressData={progressData}
            subjects={subjects}
            studySessions={studySessions}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <StudyRecommendations 
            subjectPerformances={subjectPerformances}
            subjects={subjects}
            progressData={progressData}
          />
        </TabPanel>
      </Paper>
    </Container>
  );
}; 