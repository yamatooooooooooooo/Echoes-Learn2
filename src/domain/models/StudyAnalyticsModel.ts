/**
 * 学習分析用のモデル定義
 */

// 学習セッションデータ
export interface StudySession {
  id?: string;
  userId: string;
  subjectId: string;
  subjectName: string;
  date: string; // YYYY-MM-DD形式
  timeOfDay: string; // 区分（朝、午前、午後...）
  startTime: string; // HH:MM形式
  duration: number; // 分単位
  pagesCompleted: number; // 完了ページ数
  efficiency: number; // 効率スコア (0-100)
  startPage?: number; // 開始ページ
  endPage?: number; // 終了ページ
  location?: string; // 学習場所
  environment?: string; // 学習環境
  focusLevel?: number; // 集中度 (1-5)
  mood?: number; // 気分/状態 (1-5)
  memo?: string; // メモ（任意）
  createdAt?: Date; // 作成日時
}

// 学習セッション入力データ
export interface StudySessionInput {
  subjectId: string;
  date: string;
  timeOfDay: string;
  startTime: string;
  duration: number;
  startPage?: number;
  endPage?: number;
  pagesCompleted: number;
  location?: string;
  environment?: string;
  focusLevel?: number;
  mood?: number;
  memo?: string;
}

// 科目のパフォーマンスデータ
export interface SubjectPerformance {
  id?: string;
  userId: string;
  subjectId: string;
  name: string;
  progress: number; // 進捗率 (0-100)
  efficiency: number; // 効率スコア (0-100)
  lastStudied: string; // 最後に学習した日付
  recommendedStudyTime: number; // 推奨学習時間（分単位）
  studyFrequency: number; // 週あたりの推奨学習回数
  strengths: string[]; // 強みのトピック/分野
  weaknesses: string[]; // 弱点のトピック/分野
  updatedAt?: Date; // 更新日時
}

// 時間帯区分の定義
export const TIME_OF_DAY_OPTIONS = [
  '朝 (5-9時)',
  '午前 (9-12時)',
  '午後 (12-17時)',
  '夕方 (17-20時)',
  '夜 (20-24時)',
  '深夜 (0-5時)',
];

// 学習環境の選択肢
export const ENVIRONMENT_OPTIONS = [
  '静かな環境',
  'BGMあり',
  'カフェ・公共施設',
  '自宅',
  '学校・図書館',
  '移動中',
];

// 学習場所の選択肢
export const LOCATION_OPTIONS = ['自宅', '図書館', 'カフェ', '学校', '職場', '移動中', 'その他'];

// 現在の時刻に基づいて時間帯を判定する機能
export const determineTimeOfDay = (): string => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 9) {
    return TIME_OF_DAY_OPTIONS[0]; // 朝
  } else if (hour >= 9 && hour < 12) {
    return TIME_OF_DAY_OPTIONS[1]; // 午前
  } else if (hour >= 12 && hour < 17) {
    return TIME_OF_DAY_OPTIONS[2]; // 午後
  } else if (hour >= 17 && hour < 20) {
    return TIME_OF_DAY_OPTIONS[3]; // 夕方
  } else if (hour >= 20 && hour < 24) {
    return TIME_OF_DAY_OPTIONS[4]; // 夜
  } else {
    return TIME_OF_DAY_OPTIONS[5]; // 深夜
  }
};

// 現在時刻をHH:MM形式で取得
export const getCurrentTimeFormatted = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// 今日の日付をYYYY-MM-DD形式で取得
export const getTodayFormatted = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
