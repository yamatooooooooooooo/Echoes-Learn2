import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  EmojiEvents as EmojiEventsIcon,
  Timeline as TimelineIcon,
  Stars as StarsIcon,
  Whatshot as WhatshotIcon,
} from '@mui/icons-material';
import { UserLevelProgress } from '../components/UserLevelProgress';
import { GamificationRepository } from '../../../../infrastructure/repositories/gamificationRepository';
import { UserExperienceProfile } from '../../../../domain/models/GamificationModel';
import { useFirebase } from '../../../../contexts/FirebaseContext';

// 色の定義
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// タブパネルのインターフェース
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// タブパネルコンポーネント
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`gamification-tabpanel-${index}`}
      aria-labelledby={`gamification-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

// アクセシビリティ用のプロパティ
const a11yProps = (index: number) => {
  return {
    id: `gamification-tab-${index}`,
    'aria-controls': `gamification-tabpanel-${index}`,
  };
};

// シンプルな実績リストコンポーネント
const AchievementsList = ({
  completedAchievements,
  inProgressAchievements,
}: {
  completedAchievements: any[];
  inProgressAchievements: any[];
}) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        獲得済み実績 ({completedAchievements.length})
      </Typography>
      {completedAchievements.length === 0 ? (
        <Typography>まだ実績を獲得していません。</Typography>
      ) : (
        <List>
          {completedAchievements.map((achievement) => (
            <ListItem key={achievement.id}>
              <ListItemText primary={achievement.title} secondary={achievement.description} />
              <Chip label="獲得済み" color="success" size="small" />
            </ListItem>
          ))}
        </List>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        未獲得実績 ({inProgressAchievements.length})
      </Typography>
      <List>
        {inProgressAchievements.map((achievement) => (
          <ListItem key={achievement.id}>
            <ListItemText primary={achievement.title} secondary={achievement.description} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

// シンプルなバッジコレクションコンポーネント
const BadgeCollection = ({ badges }: { badges: string[] }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        獲得バッジ ({badges.length})
      </Typography>
      {badges.length === 0 ? (
        <Typography>まだバッジを獲得していません。</Typography>
      ) : (
        <Grid container spacing={2}>
          {badges.map((badge, index) => (
            <Grid item key={index}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: 'primary.main' }}>
                  <StarsIcon />
                </Avatar>
                <Typography>{badge}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

// シンプルなチャレンジリストコンポーネント
const ChallengesList = ({ challenges }: { challenges: any[] }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        アクティブなチャレンジ ({challenges.length})
      </Typography>
      {challenges.length === 0 ? (
        <Typography>現在アクティブなチャレンジはありません。</Typography>
      ) : (
        <List>
          {challenges.map((challenge) => (
            <ListItem key={challenge.id}>
              <ListItemText primary={challenge.title} secondary={challenge.description} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

// ゲーミフィケーションダッシュボードコンポーネント
export const GamificationDashboard: React.FC = () => {
  const theme = useTheme(); // テーマを取得
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserExperienceProfile | null>(null);
  const [completedAchievements, setCompletedAchievements] = useState<any[]>([]);
  const [inProgressAchievements, setInProgressAchievements] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Firebaseサービスを取得
  const { firestore, auth, gamificationRepository } = useFirebase();

  // 実績データの定義
  const achievementData = [
    { name: '完了', value: userProfile?.achievements?.length || 0 },
    { name: '進行中', value: 5 },
    { name: '未開始', value: 10 },
  ];

  useEffect(() => {
    const loadData = async () => {
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

        const repo = new GamificationRepository(firestore, auth);

        // ユーザー経験値プロフィールを取得
        const profile = await repo.getUserExperienceProfile(userId);
        setUserProfile(profile);

        // アチーブメントを取得
        const achievements = await repo.getAchievements(userId);

        // アチーブメントをダミーデータで処理
        // 実際のアプリでは、獲得済みと未獲得のアチーブメントを適切に分離する必要があります
        const completed = achievements.filter((a) => a.unlocked);
        const inProgress = achievements.filter((a) => !a.unlocked);

        setCompletedAchievements(completed);
        setInProgressAchievements(inProgress);

        // チャレンジはダミーデータを使用
        const activeChallenges = [
          {
            id: 'challenge-1',
            title: '7日連続学習チャレンジ',
            description: '7日間連続で学習を記録しよう',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            progress: 30,
            tasks: [
              { id: 'task-1', description: '毎日最低30分学習する', completed: false },
              { id: 'task-2', description: '毎日最低10ページ読む', completed: false },
            ],
            rewards: ['経験値 500', 'バッジ: 継続の達人'],
          },
        ];

        setChallenges(activeChallenges);
      } catch (error) {
        console.error('ゲーミフィケーションデータの取得に失敗しました:', error);
        setError('データの取得に失敗しました。もう一度お試しください。');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [firestore, auth]); // 依存配列にFirebaseサービスを追加

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // アチーブメントのレアリティに応じた色を取得
  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'legendary':
        return '#FFD700'; // 金
      case 'epic':
        return '#9932CC'; // 紫
      case 'rare':
        return '#1E90FF'; // 青
      case 'uncommon':
        return '#32CD32'; // 緑
      default:
        return '#A9A9A9'; // グレー (common)
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Typography color="error" variant="h6" align="center">
            {error}
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!userProfile) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h6" align="center">
          ユーザープロフィールが見つかりません
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <EmojiEventsIcon sx={{ mr: 1, color: 'primary.main' }} />
          ゲーミフィケーション
        </Typography>

        {/* ユーザーレベル進捗 */}
        {userProfile && <UserLevelProgress userId={userProfile.userId} />}

        <Box sx={{ mt: 4 }}>
          <Paper sx={{ borderRadius: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
              aria-label="gamification tabs"
            >
              <Tab icon={<EmojiEventsIcon />} label="実績" {...a11yProps(0)} />
              <Tab icon={<StarsIcon />} label="バッジ" {...a11yProps(1)} />
              <Tab icon={<WhatshotIcon />} label="チャレンジ" {...a11yProps(2)} />
              <Tab icon={<TimelineIcon />} label="統計" {...a11yProps(3)} />
            </Tabs>

            <Divider />

            <TabPanel value={tabValue} index={0}>
              <AchievementsList
                completedAchievements={completedAchievements}
                inProgressAchievements={inProgressAchievements}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <BadgeCollection badges={userProfile.badges} />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <ChallengesList challenges={challenges} />
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6">学習統計</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">実績の進捗状況</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                    {achievementData.map((item, index) => (
                      <Box key={index} sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ color: COLORS[index % COLORS.length] }}>
                          {item.value}
                        </Typography>
                        <Typography variant="body2">{item.name}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Box>
            </TabPanel>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};
