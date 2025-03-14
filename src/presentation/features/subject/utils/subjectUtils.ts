/**
 * 科目関連のユーティリティ関数
 */

import { Subject } from '../../../../domain/models/SubjectModel';

/**
 * 優先度を計算する
 * Subject全体を引数に取るバージョン（domain/utils/subjectUtils.tsとの互換性のため）
 */
export function calculatePriority(subject: Subject): 'high' | 'medium' | 'low';
/**
 * 優先度を計算する
 * 試験日と進捗状況に基づいて優先度を算出
 */
export function calculatePriority(examDate: Date | null, currentPage: number, totalPages: number): number;
export function calculatePriority(subjectOrDate: Subject | Date | null, currentPage?: number, totalPages?: number): 'high' | 'medium' | 'low' | number {
  // Subjectオブジェクトが渡された場合
  if (subjectOrDate && typeof subjectOrDate === 'object' && 'id' in subjectOrDate) {
    const subject = subjectOrDate as Subject;
    
    // 試験日までの日数がない場合
    if (!subject.examDate) {
      return subject.importance === 'high' ? 'medium' : 'low';
    }

    const daysUntilExam = calculateDaysRemaining(subject.examDate);
    
    // 試験日までの日数の重みを大きくする - 高優先度の条件をより厳しくする
    if (daysUntilExam <= 3) {
      return 'high'; // 3日以内のみ高優先度
    } else if (daysUntilExam <= 10) {
      return 'medium'; // 10日以内は中優先度
    } else {
      return subject.importance === 'high' ? 'medium' : 'low'; // それ以外は低優先度（ただし重要な科目は中優先度）
    }
  } 
  // examDate, currentPage, totalPagesが渡された場合
  else {
    const examDate = subjectOrDate as (Date | null);
    if (!examDate || currentPage === undefined || totalPages === undefined) return 0;
    
    const daysRemaining = calculateDaysRemaining(examDate);
    if (daysRemaining <= 0) return 10; // 試験日が過ぎている場合は最高優先度
    
    const progressPercent = calculateProgress(currentPage, totalPages);
    const remainingPercent = 100 - progressPercent;
    
    // ベーススコアの計算（残りページ％と残り日数からの基本計算）
    // 残り日数の重みを2倍に増加（平方根を使って効果を強調）
    let baseScore = (remainingPercent / Math.sqrt(daysRemaining)) * 15;
    
    // 試験日までの日数に基づくボーナススコア（重みを増加）
    let bonusScore = 0;
    if (daysRemaining <= 3) {
      bonusScore = 8; // 3日以内は緊急（8に増加）
    } else if (daysRemaining <= 7) {
      bonusScore = 6; // 1週間以内は高優先（6に増加）
    } else if (daysRemaining <= 14) {
      bonusScore = 4; // 2週間以内は注意（4に減少）
    } else if (daysRemaining <= 30) {
      bonusScore = 2; // 1ヶ月以内は計画的に（2に減少）
    } else if (daysRemaining <= 60) {
      bonusScore = 1; // 2ヶ月以内は視野に入れる（1に減少）
    }
    
    // 進捗状況による調整（進捗が少ないほど優先度上昇）
    let progressAdjustment = 0;
    if (progressPercent < 30) {
      progressAdjustment = 1.5; // 進捗30%未満は警告
    } else if (progressPercent < 50) {
      progressAdjustment = 1; // 進捗50%未満は注意
    } else if (progressPercent < 70) {
      progressAdjustment = 0.5; // 進捗70%未満は計画的に
    }
    
    // 最終スコアの計算
    const finalScore = baseScore + bonusScore + progressAdjustment;
    
    // 0-10の範囲で制限し、小数第一位まで
    return Math.min(Math.round(finalScore * 10) / 10, 10);
  }
}

/**
 * 試験日までの残り日数を計算
 */
export const calculateDaysRemaining = (examDate: Date | null | string | undefined): number => {
  if (!examDate) return Infinity;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 日付が文字列やnullの場合はDateオブジェクトに変換
    let examDay: Date;
    if (typeof examDate === 'string') {
      examDay = new Date(examDate);
    } else if (examDate instanceof Date) {
      examDay = new Date(examDate);
    } else {
      console.warn('Invalid examDate:', examDate);
      return Infinity;
    }
    
    // 無効な日付の場合
    if (isNaN(examDay.getTime())) {
      console.warn('Invalid date value:', examDate);
      return Infinity;
    }
    
    examDay.setHours(0, 0, 0, 0);
    
    const diffTime = examDay.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    console.error('Error calculating days remaining:', error);
    return Infinity;
  }
};

/**
 * 進捗率を計算（％）
 */
export const calculateProgress = (currentPage: number, totalPages: number): number => {
  if (totalPages <= 0) return 0;
  const progress = (currentPage / totalPages) * 100;
  return Math.min(Math.round(progress), 100); // 0-100%の範囲で制限
};

/**
 * 優先度に基づく色を取得（High-Medium-Low）
 */
export const getPriorityColor = (priority?: 'high' | 'medium' | 'low'): string => {
  switch (priority) {
    case 'high': return '#f44336'; // 赤色（高優先）
    case 'medium': return '#ff9800'; // オレンジ色（中優先）
    case 'low': return '#4caf50'; // 緑色（低優先）
    default: return '#9e9e9e'; // グレー（未設定）
  }
};

/**
 * 科目の状態に基づいた色を取得
 */
export const getStatusColor = (subject: Subject): string => {
  if (!subject.examDate) return '#9e9e9e'; // 試験日未設定
  
  const daysRemaining = calculateDaysRemaining(subject.examDate);
  
  // 試験日が過ぎている
  if (daysRemaining < 0) return '#9e9e9e';
  
  // 進捗率
  const progress = calculateProgress(subject.currentPage, subject.totalPages);
  
  // 緊急度（試験日まで1週間以内で進捗50%未満）
  if (daysRemaining <= 7 && progress < 50) return '#f44336'; // 赤
  
  // 警告（試験日まで2週間以内で進捗70%未満）
  if (daysRemaining <= 14 && progress < 70) return '#ff9800'; // オレンジ
  
  // 注意（試験日まで1ヶ月以内）
  if (daysRemaining <= 30) return '#4caf50'; // 緑
  
  // 余裕あり
  return '#2196f3'; // 青
}; 