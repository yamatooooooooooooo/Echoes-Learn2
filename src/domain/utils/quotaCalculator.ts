import { Subject } from '../models/SubjectModel';
import { DailyQuota, WeeklyQuota, StudyQuota } from '../models/QuotaModel';

/**
 * 今日のノルマを計算する関数
 * @param subjects 科目リスト
 * @returns 今日のノルマ情報
 */
export const calculateDailyQuota = (subjects: Subject[]): DailyQuota => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const quotaItems: StudyQuota[] = [];
  let totalPages = 0;
  let totalMinutes = 0;
  
  // 有効な科目のみを対象にする
  const validSubjects = subjects.filter(subject => {
    // 試験日が設定されていない場合は除外
    if (!subject.examDate) return false;
    
    // 試験日が今日以降
    const examDate = new Date(subject.examDate);
    examDate.setHours(0, 0, 0, 0);
    
    // 目標達成日を計算（試験日 - バッファ日）
    const targetDate = new Date(examDate);
    targetDate.setDate(targetDate.getDate() - (subject.bufferDays || 0));
    
    return targetDate >= today;
  });
  
  // 試験日の近い順にソート
  validSubjects.sort((a, b) => {
    const dateA = new Date(a.examDate);
    const dateB = new Date(b.examDate);
    return dateA.getTime() - dateB.getTime();
  });
  
  // 同時に進行する科目数の上限（デフォルトは3）
  const maxConcurrentSubjects = 3;
  
  // 優先して学習する科目を選択（試験日が近い順に上限数まで）
  const prioritySubjects = validSubjects.slice(0, maxConcurrentSubjects);
  
  // 各科目のノルマを計算
  prioritySubjects.forEach(subject => {
    // 試験日が設定されていない場合はスキップ（念のため）
    if (!subject.examDate) return;
    
    // 試験日
    const examDate = new Date(subject.examDate);
    examDate.setHours(0, 0, 0, 0);
    
    // 目標達成日（試験日 - バッファ日）
    const targetDate = new Date(examDate);
    targetDate.setDate(targetDate.getDate() - (subject.bufferDays || 0));
    
    // 今日から目標達成日までの日数
    const daysUntilTarget = Math.max(1, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    // 残りのページ数
    const remainingPages = subject.totalPages - subject.currentPage;
    
    // 1日あたりのノルマページ数（切り上げ）
    const pagesPerDay = Math.ceil(remainingPages / daysUntilTarget);
    
    // 推定学習時間（1ページあたり2分と仮定）
    const estimatedMinutes = pagesPerDay * 2;
    
    // 残り日数の計算
    const daysRemaining = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    quotaItems.push({
      subjectId: subject.id,
      subjectName: subject.name,
      pages: pagesPerDay,
      estimatedMinutes: estimatedMinutes,
      priority: subject.priority || 'medium',
      examDate: examDate,
      isCompleted: false,
      daysRemaining: daysRemaining,
      daysUntilTarget: daysUntilTarget
    });
    
    totalPages += pagesPerDay;
    totalMinutes += estimatedMinutes;
  });
  
  // 優先度順にソート（high > medium > low）
  quotaItems.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  return {
    date: today,
    totalPages,
    totalMinutes,
    quotaItems,
    isCompleted: false,
    activeSubjectsCount: prioritySubjects.length
  };
};

/**
 * 今週のノルマを計算する関数
 * @param subjects 科目リスト
 * @returns 今週のノルマ情報
 */
export const calculateWeeklyQuota = (subjects: Subject[]): WeeklyQuota => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 今週の開始日（日曜日）を計算
  const startDate = new Date(today);
  const dayOfWeek = today.getDay();
  startDate.setDate(today.getDate() - dayOfWeek);
  
  // 今週の終了日（土曜日）を計算
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  
  const quotaItems: StudyQuota[] = [];
  const dailyDistribution: { [key: string]: number } = {};
  let totalPages = 0;
  let totalMinutes = 0;
  
  // 有効な科目のみを対象にする
  const validSubjects = subjects.filter(subject => {
    // 試験日が設定されていない場合は除外
    if (!subject.examDate) return false;
    
    // 試験日が今日以降
    const examDate = new Date(subject.examDate);
    examDate.setHours(0, 0, 0, 0);
    
    // 目標達成日を計算（試験日 - バッファ日）
    const targetDate = new Date(examDate);
    targetDate.setDate(targetDate.getDate() - (subject.bufferDays || 0));
    
    return targetDate >= today;
  });
  
  // 各科目のノルマを計算
  validSubjects.forEach(subject => {
    // 試験日が設定されていない場合はスキップ（念のため）
    if (!subject.examDate) return;
    
    // 試験日
    const examDate = new Date(subject.examDate);
    examDate.setHours(0, 0, 0, 0);
    
    // 目標達成日（試験日 - バッファ日）
    const targetDate = new Date(examDate);
    targetDate.setDate(targetDate.getDate() - (subject.bufferDays || 0));
    
    // 今日から目標達成日までの日数
    const daysUntilTarget = Math.max(1, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    // 残りのページ数
    const remainingPages = subject.totalPages - subject.currentPage;
    
    // 1日あたりのノルマページ数
    const pagesPerDay = Math.ceil(remainingPages / daysUntilTarget);
    
    // 今週に含まれる日数（今日から目標日まで、または今週の終わりまでの短い方）
    const daysInWeek = Math.min(7 - dayOfWeek, daysUntilTarget);
    
    // 今週のノルマページ数
    const pagesThisWeek = pagesPerDay * daysInWeek;
    
    // 推定学習時間（1ページあたり2分と仮定）
    const estimatedMinutes = pagesThisWeek * 2;
    
    quotaItems.push({
      subjectId: subject.id,
      subjectName: subject.name,
      pages: pagesThisWeek,
      estimatedMinutes: estimatedMinutes,
      priority: subject.priority || 'medium',
      examDate: examDate,
      isCompleted: false
    });
    
    totalPages += pagesThisWeek;
    totalMinutes += estimatedMinutes;
    
    // 日ごとの配分（今週に含まれる日数に均等に分配）
    const pagesPerDayThisWeek = Math.ceil(pagesThisWeek / daysInWeek);
    for (let i = 0; i < daysInWeek; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      dailyDistribution[dateString] = (dailyDistribution[dateString] || 0) + pagesPerDayThisWeek;
    }
  });
  
  // 優先度順にソート（high > medium > low）
  quotaItems.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  return {
    startDate,
    endDate,
    totalPages,
    totalMinutes,
    quotaItems,
    dailyDistribution,
    isCompleted: false
  };
}; 