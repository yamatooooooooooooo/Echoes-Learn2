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
  points: number;        // 総ポイント
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
  type: 'pages' | 'sessions' | 'streak' | 'subjects' | 'time' | 'custom';
  targetValue: number;
  comparisonType: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
  additionalParams?: Record<string, any>;
}

// 学習活動記録
export interface StudyActivityLog {
  id?: string;
  userId: string;
  activityType: 'page_read' | 'session_complete' | 'subject_complete' | 'achievement_unlocked' | 'streak';
  subjectId?: string;
  points: number;
  exp: number;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// ポイント履歴
export interface PointHistory {
  id?: string;
  userId: string;
  points: number;
  source: 'study' | 'achievement' | 'challenge' | 'bonus' | 'admin';
  description: string;
  timestamp: Date;
  expiryDate?: Date; // ポイントの有効期限（オプション）
}

// ポイント使用履歴
export interface PointUsageLog {
  id?: string;
  userId: string;
  points: number;
  usageType: 'reward' | 'exchange' | 'feature';
  itemId?: string;
  description: string;
  timestamp: Date;
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
  pointCost?: number; // ポイントでの購入コスト
}

// 学習アクティビティのポイント計算ルール
export const ACTIVITY_POINTS = {
  PAGE_READ: 5,          // 1ページ読むごとに獲得
  STUDY_SESSION: 50,     // 学習セッション完了ごとに獲得
  STUDY_TIME: 1,         // 1分の学習につき獲得ポイント
  STREAK_DAY: 20,        // 連続学習日ごとに獲得
  STREAK_BONUS: {        // 連続学習日数に応じたボーナス
    7: 100,              // 1週間連続
    30: 500,             // 1ヶ月連続
    100: 2000,           // 100日連続
  },
  SUBJECT_COMPLETION: 1000, // 科目完了時に獲得
  SUBJECT_PROGRESS_MILESTONE: { // 科目の進捗に応じたボーナス
    25: 50,   // 25%達成
    50: 100,  // 50%達成
    75: 150,  // 75%達成
    100: 300  // 100%達成
  },
  DAILY_BONUS: {
    FIRST_STUDY: 10,    // 1日最初の学習
    MORNING_STUDY: 20,  // 朝の勉強（5時-9時）
    NIGHT_STUDY: 15,    // 夜の勉強（21時-24時）
  }
};

// レベル定義
export const USER_LEVELS: UserLevel[] = [
  { level: 1, title: '初心者', requiredExp: 0 },
  { level: 2, title: '初級学習者', requiredExp: 100 },
  { level: 3, title: '中級学習者', requiredExp: 250 },
  { level: 4, title: '上級学習者', requiredExp: 500 },
  { level: 5, title: '知識の探究者', requiredExp: 1000 },
  { level: 6, title: '学術の冒険家', requiredExp: 2000 },
  { level: 7, title: '知恵の守護者', requiredExp: 3500 },
  { level: 8, title: '知識の賢者', requiredExp: 5000 },
  { level: 9, title: '学問の達人', requiredExp: 7500 },
  { level: 10, title: '知の巨匠', requiredExp: 10000 }
];

/**
 * ポイント計算ユーティリティ関数
 */

// 進捗記録からポイントを計算
export function calculatePointsFromProgress(currentPage: number, previousPage: number, totalPages: number): number {
  const pagesRead = Math.max(0, currentPage - previousPage);
  let points = pagesRead * ACTIVITY_POINTS.PAGE_READ;
  
  // 完了ボーナス
  if (currentPage === totalPages) {
    points += ACTIVITY_POINTS.SUBJECT_COMPLETION;
  }
  
  // 進捗マイルストーンボーナス
  const progressPercent = Math.floor((currentPage / totalPages) * 100);
  const previousProgressPercent = Math.floor((previousPage / totalPages) * 100);
  
  for (const [milestone, bonus] of Object.entries(ACTIVITY_POINTS.SUBJECT_PROGRESS_MILESTONE)) {
    const milestoneValue = parseInt(milestone);
    if (progressPercent >= milestoneValue && previousProgressPercent < milestoneValue) {
      points += bonus;
    }
  }
  
  return points;
}

// 学習時間からポイントを計算
export function calculatePointsFromStudyTime(minutes: number): number {
  return Math.floor(minutes * ACTIVITY_POINTS.STUDY_TIME);
}

// 連続学習日数からボーナスポイントを計算
export function calculateStreakBonus(streakDays: number): number {
  let bonus = streakDays * ACTIVITY_POINTS.STREAK_DAY;
  
  // マイルストーンボーナス
  for (const [days, bonusPoints] of Object.entries(ACTIVITY_POINTS.STREAK_BONUS)) {
    if (streakDays >= parseInt(days)) {
      bonus += bonusPoints;
    }
  }
  
  return bonus;
}

// 時間帯に応じたボーナスポイントを計算
export function calculateTimeBasedBonus(hour: number): number {
  if (hour >= 5 && hour < 9) {
    return ACTIVITY_POINTS.DAILY_BONUS.MORNING_STUDY;
  } else if (hour >= 21 && hour < 24) {
    return ACTIVITY_POINTS.DAILY_BONUS.NIGHT_STUDY;
  }
  return 0;
} 