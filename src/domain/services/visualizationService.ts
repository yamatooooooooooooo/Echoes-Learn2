import { differenceInDays } from 'date-fns';
import { Subject } from '../models/SubjectModel';

/**
 * レーダーチャート表示用のデータ構造
 */
export interface RadarChartData {
  subject: string;
  progress: number;
}

/**
 * カウントダウンウィジェット表示用のデータ構造
 */
export interface CountdownData {
  subject: string;
  dueDate: Date;
  remainingDays: number;
  progressData: {
    name: string;
    value: number;
  }[];
  isReport?: boolean;
}

/**
 * 全科目の進捗状況データを取得し、レーダーチャート用のフォーマットに変換する
 * @param subjects 科目データの配列
 * @returns レーダーチャート用のデータ配列
 */
export const getRadarChartData = (subjects: Subject[]): RadarChartData[] => {
  try {
    if (!subjects || subjects.length === 0) {
      return [];
    }

    // 科目ごとの進捗率を計算
    return subjects.map(subject => {
      const progress = calculateProgress(subject);
      
      return {
        subject: subject.name,
        progress
      };
    });
  } catch (error) {
    console.error('レーダーチャートデータの生成中にエラーが発生しました:', error);
    return [];
  }
};

/**
 * 科目の進捗率を計算する
 * @param subject 科目データ
 * @returns 進捗率（0〜100の数値）
 */
const calculateProgress = (subject: Subject): number => {
  if (!subject.totalPages || subject.totalPages <= 0) {
    return 0;
  }
  
  const currentPage = subject.currentPage || 0;
  const progress = Math.round((currentPage / subject.totalPages) * 100);
  
  // 0〜100の範囲に収める
  return Math.max(0, Math.min(100, progress));
};

/**
 * 各科目の試験日までの残り日数と進捗状況を取得し、カウントダウンウィジェット用のフォーマットに変換する
 * @param subjects 科目データの配列
 * @returns カウントダウンウィジェット用のデータ配列
 */
export const getCountdownData = (subjects: Subject[]): CountdownData[] => {
  try {
    if (!subjects || subjects.length === 0) {
      return [];
    }

    const today = new Date();
    
    return subjects.map(subject => {
      const progress = calculateProgress(subject);
      const remainingDays = calculateRemainingDays(subject.examDate);
      
      return {
        subject: subject.name,
        dueDate: subject.examDate,
        remainingDays,
        progressData: [
          { name: '完了', value: progress },
          { name: '未完了', value: 100 - progress }
        ]
      };
    });
  } catch (error) {
    console.error('カウントダウンデータの生成中にエラーが発生しました:', error);
    return [];
  }
};

/**
 * 指定日までの残り日数を計算する
 * @param dueDate 期日
 * @returns 残り日数（0以上の整数）
 */
const calculateRemainingDays = (dueDate: Date): number => {
  const today = new Date();
  const days = differenceInDays(dueDate, today);
  
  // 0以上の値を返す
  return Math.max(0, days);
}; 