/**
 * 学習進捗分析のデータモデル
 */

export interface ProgressRecord {
  id: string;
  userId: string;
  subjectId: string;
  subjectName?: string;
  startTime?: Date;
  endTime?: Date;
  studyDuration: number; // 分単位
  startPage: number;
  endPage: number;
  pagesRead: number;
  satisfactionLevel?: number; // 1-3の範囲
  memo?: string;
  recordDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChartDataPoint {
  date: string;
  time: number;
  tasks: number;
  frequency: number;
  satisfaction: number;
}

export interface AnalysisResult {
  chartData: ChartDataPoint[];
  summary: AnalysisSummary;
}

export interface AnalysisSummary {
  totalStudyTime: number;
  averageStudyTimePerDay: number;
  totalTasksCompleted: number;
  averageTasksPerDay: number;
  daysStudied: number;
  maxStudyInterval: number;
  averageSatisfaction: number;
  studyEfficiency: number;
}

export type AnalysisMetric = 'time' | 'tasks' | 'frequency' | 'satisfaction';
export type AnalysisPeriod = 'day' | 'week' | 'month';

export type LearningMetric = 'studyTime' | 'completedTasks' | 'frequency' | 'satisfaction';

export interface LearningAdvice {
  type: 'success' | 'warning' | 'info';
  message: string;
  recommendation?: string;
}

/**
 * 時間区分を計算する関数
 */
export const getPeriodLabel = (period: AnalysisPeriod, date: Date): string => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  switch (period) {
    case 'day':
      return `${month}/${day}`;
    case 'week': {
      // 週の開始日（月曜日）を計算
      const dayOfWeek = date.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 日曜日は6、それ以外は曜日 - 1
      const monday = new Date(date);
      monday.setDate(date.getDate() - diff);
      const mondayDay = monday.getDate();
      const mondayMonth = monday.getMonth() + 1;
      
      return `${mondayMonth}/${mondayDay}週`;
    }
    case 'month':
      return `${year}/${month}`;
    default:
      return '';
  }
};

/**
 * データをグループ化するためのキーを生成する関数
 */
export const getGroupKey = (period: AnalysisPeriod, date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  switch (period) {
    case 'day':
      return `${year}-${month}-${day}`;
    case 'week': {
      // ISO週番号を取得（1-53）
      const weekNumber = getWeekNumber(date);
      return `${year}-W${String(weekNumber).padStart(2, '0')}`;
    }
    case 'month':
      return `${year}-${month}`;
    default:
      return '';
  }
};

/**
 * 日付からISO週番号を取得する関数
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
}

/**
 * 学習アドバイスを生成する関数
 */
export const generateLearningAdvice = (summary: AnalysisSummary): LearningAdvice[] => {
  const advice: LearningAdvice[] = [];
  
  // 学習時間に関するアドバイス
  if (summary.totalStudyTime < 60) {
    advice.push({
      type: 'warning',
      message: '学習時間が少なめです',
      recommendation: '毎日少しずつでも時間を確保しましょう。'
    });
  } else if (summary.totalStudyTime > 300) {
    advice.push({
      type: 'success',
      message: '学習時間が十分です',
      recommendation: '質の高い学習を心がけましょう。'
    });
  }
  
  // 学習頻度に関するアドバイス
  if (summary.daysStudied < 3) {
    advice.push({
      type: 'warning',
      message: '学習頻度が低めです',
      recommendation: '継続的な学習がより効果的です。毎日短時間でも学習することを目指しましょう。'
    });
  } else if (summary.maxStudyInterval > 2) {
    advice.push({
      type: 'info',
      message: '学習間隔があいています',
      recommendation: '毎日短時間でも継続することで、記憶の定着が促進されます。'
    });
  } else {
    advice.push({
      type: 'success',
      message: '学習頻度が良好です',
      recommendation: 'この調子で継続しましょう。'
    });
  }
  
  // 学習満足度に関するアドバイス
  if (summary.averageSatisfaction < 2) {
    advice.push({
      type: 'warning',
      message: '学習満足度が低めです',
      recommendation: '興味のある教材や方法に切り替えることを検討してみましょう。'
    });
  } else {
    advice.push({
      type: 'success',
      message: '学習満足度が高めです',
      recommendation: '学習に楽しさを感じることが長期的な継続につながります。'
    });
  }
  
  // 学習効率に関するアドバイス
  if (summary.studyEfficiency < 0.5) {
    advice.push({
      type: 'info',
      message: '学習効率を高める余地があります',
      recommendation: '集中力を高めるテクニックや、効率的な学習方法を試してみましょう。'
    });
  }
  
  return advice;
};

export interface LearningAnalyticsData {
  date: string;
  studyTime: number;
  completedTasks: number;
  frequency: number;
  satisfaction: number;
} 