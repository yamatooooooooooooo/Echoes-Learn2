import { Subject } from '../models/SubjectModel';
import { DailyQuota, WeeklyQuota, StudyQuota } from '../models/QuotaModel';
import { UserSettings, DEFAULT_USER_SETTINGS } from '../models/UserSettingsModel';

/**
 * 今日のノルマを計算する関数
 * @param subjects 科目リスト
 * @param userSettings ユーザー設定（オプション）
 * @returns 今日のノルマ情報
 */
export const calculateDailyQuota = (subjects: Subject[], userSettings?: Partial<UserSettings>): DailyQuota => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const quotaItems: StudyQuota[] = [];
  let totalPages = 0;
  let totalMinutes = 0;
  
  // ユーザー設定から値を取得、または既定値を使用
  const settings = {
    maxConcurrentSubjects: userSettings?.maxConcurrentSubjects || DEFAULT_USER_SETTINGS.maxConcurrentSubjects,
    examBufferDays: userSettings?.examBufferDays || DEFAULT_USER_SETTINGS.examBufferDays,
    averagePageReadingTime: userSettings?.averagePageReadingTime || DEFAULT_USER_SETTINGS.averagePageReadingTime,
    dailyStudyHours: userSettings?.dailyStudyHours || DEFAULT_USER_SETTINGS.dailyStudyHours,
    studyDaysPerWeek: userSettings?.studyDaysPerWeek || DEFAULT_USER_SETTINGS.studyDaysPerWeek
  };
  
  // 有効な科目のみを対象にする
  const validSubjects = subjects.filter(subject => {
    // 試験日が設定されていない場合は除外
    if (!subject.examDate) return false;
    
    // 試験日が今日以降
    const examDate = new Date(subject.examDate);
    examDate.setHours(0, 0, 0, 0);
    
    // 目標達成日を計算（試験日 - バッファ日）
    const targetDate = new Date(examDate);
    targetDate.setDate(targetDate.getDate() - (subject.bufferDays || settings.examBufferDays));
    
    return targetDate >= today;
  });
  
  // 試験日の近い順にソート
  validSubjects.sort((a, b) => {
    const dateA = new Date(a.examDate);
    const dateB = new Date(b.examDate);
    return dateA.getTime() - dateB.getTime();
  });
  
  // 同時に進行する科目数の上限（ユーザー設定から取得）
  const maxConcurrentSubjects = settings.maxConcurrentSubjects;
  
  // 優先して学習する科目を選択（試験日が近い順に上限数まで）
  const prioritySubjects = validSubjects.slice(0, maxConcurrentSubjects);
  
  // 各科目のノルマを計算
  prioritySubjects.forEach(subject => {
    // 試験日が設定されていない場合はスキップ（念のため）
    if (!subject.examDate) return;
    
    // 試験日
    const examDate = new Date(subject.examDate);
    examDate.setHours(0, 0, 0, 0);
    
    // バッファ日数（科目個別設定または全体設定）
    const bufferDays = subject.bufferDays !== undefined ? subject.bufferDays : settings.examBufferDays;
    
    // 目標達成日（試験日 - バッファ日）
    const targetDate = new Date(examDate);
    targetDate.setDate(targetDate.getDate() - bufferDays);
    
    // 今日から目標達成日までの日数
    const daysUntilTarget = Math.max(1, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    // 残りのページ数
    const remainingPages = subject.totalPages - subject.currentPage;
    
    // 実際に学習する日数（週あたりの学習日数から計算）
    // 例: 週5日学習なら、実際の学習日数は全日数の(5/7)
    const studyDaysRatio = settings.studyDaysPerWeek / 7;
    const actualStudyDays = Math.max(1, Math.ceil(daysUntilTarget * studyDaysRatio));
    
    // 1日あたりのノルマページ数（切り上げ）
    const pagesPerDay = Math.ceil(remainingPages / actualStudyDays);
    
    // 推定学習時間（ユーザー設定の1ページあたりの時間を使用）
    const estimatedMinutes = pagesPerDay * settings.averagePageReadingTime;
    
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
  
  // 1日の目標学習時間との比較
  const dailyStudyMinutes = settings.dailyStudyHours * 60;
  const isExceedingDailyLimit = totalMinutes > dailyStudyMinutes;
  
  return {
    date: today,
    totalPages,
    totalMinutes,
    quotaItems,
    isCompleted: false,
    activeSubjectsCount: prioritySubjects.length,
    isExceedingDailyLimit,
    dailyStudyMinutes
  };
};

/**
 * 今週のノルマを計算する関数
 * @param subjects 科目リスト
 * @param userSettings ユーザー設定（オプション）
 * @returns 今週のノルマ情報
 */
export const calculateWeeklyQuota = (subjects: Subject[], userSettings?: Partial<UserSettings>): WeeklyQuota => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 今週の開始日（日曜日）を計算
  const startDate = new Date(today);
  const dayOfWeek = today.getDay();
  startDate.setDate(today.getDate() - dayOfWeek);
  
  // 今週の終了日（土曜日）を計算
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  
  // ユーザー設定から値を取得、または既定値を使用
  const settings = {
    maxConcurrentSubjects: userSettings?.maxConcurrentSubjects || DEFAULT_USER_SETTINGS.maxConcurrentSubjects,
    examBufferDays: userSettings?.examBufferDays || DEFAULT_USER_SETTINGS.examBufferDays,
    averagePageReadingTime: userSettings?.averagePageReadingTime || DEFAULT_USER_SETTINGS.averagePageReadingTime,
    dailyStudyHours: userSettings?.dailyStudyHours || DEFAULT_USER_SETTINGS.dailyStudyHours,
    studyDaysPerWeek: userSettings?.studyDaysPerWeek || DEFAULT_USER_SETTINGS.studyDaysPerWeek
  };
  
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
    targetDate.setDate(targetDate.getDate() - (subject.bufferDays || settings.examBufferDays));
    
    return targetDate >= today;
  });
  
  // 試験日の近い順にソート
  validSubjects.sort((a, b) => {
    const dateA = new Date(a.examDate);
    const dateB = new Date(b.examDate);
    return dateA.getTime() - dateB.getTime();
  });
  
  // 同時に進行する科目数の上限（ユーザー設定から取得）
  const maxConcurrentSubjects = settings.maxConcurrentSubjects;
  
  // 優先して学習する科目を選択（試験日が近い順に上限数まで）
  const prioritySubjects = validSubjects.slice(0, maxConcurrentSubjects);
  
  // 各科目のノルマを計算
  prioritySubjects.forEach(subject => {
    // 試験日が設定されていない場合はスキップ（念のため）
    if (!subject.examDate) return;
    
    // 試験日
    const examDate = new Date(subject.examDate);
    examDate.setHours(0, 0, 0, 0);
    
    // バッファ日数（科目個別設定または全体設定）
    const bufferDays = subject.bufferDays !== undefined ? subject.bufferDays : settings.examBufferDays;
    
    // 目標達成日（試験日 - バッファ日）
    const targetDate = new Date(examDate);
    targetDate.setDate(targetDate.getDate() - bufferDays);
    
    // 今日から目標達成日までの日数
    const daysUntilTarget = Math.max(1, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    // 残りのページ数
    const remainingPages = subject.totalPages - subject.currentPage;
    
    // 実際に学習する日数（週あたりの学習日数から計算）
    const studyDaysRatio = settings.studyDaysPerWeek / 7;
    const actualStudyDays = Math.max(1, Math.ceil(daysUntilTarget * studyDaysRatio));
    
    // 1日あたりのノルマページ数
    const pagesPerDay = Math.ceil(remainingPages / actualStudyDays);
    
    // 今週に含まれる日数（今日から目標日まで、または今週の終わりまでの短い方）
    // 実際に学習する日数を考慮
    const daysInWeek = Math.min(7 - dayOfWeek, daysUntilTarget);
    const actualStudyDaysInWeek = Math.max(1, Math.ceil(daysInWeek * studyDaysRatio));
    
    // 今週のノルマページ数
    const pagesThisWeek = pagesPerDay * actualStudyDaysInWeek;
    
    // 推定学習時間（ユーザー設定の1ページあたりの時間を使用）
    const estimatedMinutes = pagesThisWeek * settings.averagePageReadingTime;
    
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
    
    // 日ごとの配分（設定された学習日数に均等に分配）
    // 週の中で指定された学習日数分だけ配分する
    const studyDaysCount = Math.min(daysInWeek, settings.studyDaysPerWeek);
    if (studyDaysCount > 0) {
      const pagesPerStudyDay = Math.ceil(pagesThisWeek / studyDaysCount);
      
      // 今週の残りの日数から、設定された学習日数分だけ選んで均等に配分
      for (let i = 0; i < Math.min(daysInWeek, studyDaysCount); i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        dailyDistribution[dateString] = (dailyDistribution[dateString] || 0) + pagesPerStudyDay;
      }
    }
  });
  
  // 優先度順にソート（high > medium > low）
  quotaItems.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  // 週間の目標学習時間との比較
  const weeklyStudyMinutes = settings.dailyStudyHours * 60 * settings.studyDaysPerWeek;
  const isExceedingWeeklyLimit = totalMinutes > weeklyStudyMinutes;
  
  return {
    startDate,
    endDate,
    totalPages,
    totalMinutes,
    quotaItems,
    dailyDistribution,
    isCompleted: false,
    isExceedingWeeklyLimit,
    weeklyStudyMinutes,
    studyDaysPerWeek: settings.studyDaysPerWeek
  };
}; 