/**
 * ゲーミフィケーション関連のモデル定義
 */

// ユーザーレベル定義
export interface UserLevel {
  level: number;
  title: string;
  requiredExp: number;
  rewards?: Reward[];
}

// ユーザー経験値プロフィール
export interface UserExperienceProfile {
  id?: string;
  userId: string;
  currentExp: number;
  totalExp: number;
  level: number;
  streakDays: number;
  lastStudyDate?: string;
  pointsToday: number;
  pointsThisWeek: number;
  achievements: string[]; // 獲得済みアチーブメントID配列
  badges: string[]; // 獲得済みバッジID配列
  updatedAt?: Date;
}

// アチーブメント定義
export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'milestone' | 'habit' | 'special' | 'challenge';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  pointReward: number;
  expReward: number;
  requirements: AchievementRequirement;
  iconName: string;
  isSecret?: boolean;
}

// アチーブメント達成条件
export interface AchievementRequirement {
  type: 'pagesRead' | 'studyStreak' | 'studyTime' | 'subjectsCompleted' | 'sessionsCompleted' | 'custom';
  threshold: number; // 必要な閾値
  timeFrame?: 'day' | 'week' | 'month' | 'allTime'; // 期間（該当する場合）
}

// ユーザーアチーブメント獲得記録
export interface UserAchievement {
  id?: string;
  userId: string;
  achievementId: string;
  dateEarned: string;
  progress?: number; // 進行度（0-100%）
}

// チャレンジ定義
export interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  tasks: ChallengeTask[];
  rewards: Reward[];
  participants?: string[]; // 参加ユーザーID配列
}

// チャレンジタスク
export interface ChallengeTask {
  id: string;
  description: string;
  requiredCount: number;
  type: 'pagesRead' | 'studyTime' | 'sessions' | 'custom';
}

// ユーザーチャレンジ進捗
export interface UserChallengeProgress {
  userId: string;
  challengeId: string;
  taskProgress: { [taskId: string]: number }; // タスクごとの進捗数
  isCompleted: boolean;
  completedAt?: string;
}

// 報酬定義
export interface Reward {
  type: 'badge' | 'title' | 'theme' | 'item' | 'exp';
  itemId?: string;
  value?: number; // expなど数値の場合
  name: string;
  description: string;
}

// 学習アクティビティのポイント計算ルール
export const ACTIVITY_POINTS = {
  PAGE_READ: 5,          // 1ページ読むごとに獲得
  STUDY_SESSION: 50,     // 学習セッション完了ごとに獲得
  STREAK_DAY: 20,        // 連続学習日ごとに獲得
  STREAK_BONUS: {        // 連続学習日数に応じたボーナス
    7: 100,              // 1週間連続
    30: 500,             // 1ヶ月連続
    100: 2000,           // 100日連続
  },
  SUBJECT_COMPLETION: 1000, // 科目完了時に獲得
};

// レベル定義
export const USER_LEVELS: UserLevel[] = [
  { level: 1, title: '学習初心者', requiredExp: 0 },
  { level: 2, title: '勉強好き', requiredExp: 300 },
  { level: 3, title: '知識探求者', requiredExp: 900 },
  { level: 4, title: '学習者', requiredExp: 2000 },
  { level: 5, title: '知識の冒険者', requiredExp: 4000 },
  { level: 6, title: '学術探検家', requiredExp: 8000 },
  { level: 7, title: '知識の達人', requiredExp: 15000 },
  { level: 8, title: '賢者見習い', requiredExp: 25000 },
  { level: 9, title: '学識者', requiredExp: 40000 },
  { level: 10, title: '知恵の伝道者', requiredExp: 60000 },
  { level: 11, title: '知識の守護者', requiredExp: 85000 },
  { level: 12, title: '賢者', requiredExp: 115000 },
  { level: 13, title: '学術の大家', requiredExp: 150000 },
  { level: 14, title: '知識の達人', requiredExp: 200000 },
  { level: 15, title: '知識の王', requiredExp: 250000 },
]; 