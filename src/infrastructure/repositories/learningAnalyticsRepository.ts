import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  startAt,
  endAt
} from 'firebase/firestore';
import { ILearningAnalyticsRepository } from '../../domain/interfaces/repositories/ILearningAnalyticsRepository';
import {
  AnalysisResult,
  AnalysisPeriod,
  AnalysisMetric,
  ChartDataPoint,
  AnalysisSummary,
  getGroupKey,
  getPeriodLabel,
  LearningAnalyticsData
} from '../../domain/models/LearningAnalyticsModel';
import { Progress, ProgressData } from '../../domain/models/ProgressModel';
import { differenceInDays, format, subMonths, isSameDay, subDays, parseISO, startOfWeek, startOfMonth, addDays } from 'date-fns';
import { firestore } from '../../config/firebase';
import { addDoc, limit, DocumentData } from 'firebase/firestore';
import { progressRepository } from './progressRepository';
import { FIREBASE_COLLECTIONS } from '../../config';

/**
 * 学習進捗分析リポジトリの実装
 */
export class LearningAnalyticsRepository implements ILearningAnalyticsRepository {
  constructor(private firestore: Firestore) {}

  /**
   * 空のサマリーを作成する
   */
  private createEmptySummary(): AnalysisSummary {
    return {
      totalStudyTime: 0,
      averageStudyTime: 0,
      averageSatisfaction: 0,
      longestStreak: 0,
      currentStreak: 0,
      totalPages: 0,
      averagePagesPerDay: 0,
      studyFrequency: 0,
      studyGap: 0
    };
  }

  /**
   * 進捗データを日付ごとに集計する
   */
  private aggregateProgressByDate(progressData: ProgressData[]): Map<string, LearningAnalyticsData> {
    const dailyData = new Map<string, LearningAnalyticsData>();
    
    progressData.forEach(progress => {
      const date = progress.date;
      const dateString = format(date, 'yyyy-MM-dd');
      
      if (!dailyData.has(dateString)) {
        dailyData.set(dateString, {
          date,
          studyTime: 0,
          pagesRead: 0,
          satisfaction: 0,
          satisfactionCount: 0,
          hasStudied: false
        });
      }
      
      const dailyStats = dailyData.get(dateString)!;
      dailyStats.studyTime += progress.duration || 0;
      dailyStats.pagesRead += progress.pageNumber || 0;
      
      if (progress.satisfaction) {
        dailyStats.satisfaction += progress.satisfaction;
        dailyStats.satisfactionCount += 1;
      }
      
      dailyStats.hasStudied = true;
    });
    
    return dailyData;
  }

  /**
   * 日次データを期間でグループ化する
   */
  private groupDataByPeriod(
    dailyData: Map<string, LearningAnalyticsData>,
    period: AnalysisPeriod,
    startDate: Date,
    endDate: Date
  ): Map<string, LearningAnalyticsData[]> {
    const groupedData = new Map<string, LearningAnalyticsData[]>();
    
    // 日付範囲内の各日付を処理
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateString = format(currentDate, 'yyyy-MM-dd');
      const groupKey = getGroupKey(currentDate, period);
      
      if (!groupedData.has(groupKey)) {
        groupedData.set(groupKey, []);
      }
      
      // その日のデータがあれば追加、なければデフォルト値を追加
      const dayData = dailyData.get(dateString) || {
        date: new Date(currentDate),
        studyTime: 0,
        pagesRead: 0,
        satisfaction: 0,
        satisfactionCount: 0,
        hasStudied: false
      };
      
      groupedData.get(groupKey)!.push(dayData);
      
      // 次の日に進む
      currentDate = addDays(currentDate, 1);
    }
    
    return groupedData;
  }

  /**
   * チャートデータを作成する
   */
  private createChartData(
    groupedData: Map<string, LearningAnalyticsData[]>,
    period: AnalysisPeriod
  ): ChartDataPoint[] {
    const chartData: ChartDataPoint[] = [];
    
    // グループごとにデータを集計
    groupedData.forEach((dataPoints, groupKey) => {
      let totalStudyTime = 0;
      let totalPagesRead = 0;
      let totalSatisfaction = 0;
      let satisfactionCount = 0;
      let studyDaysCount = 0;
      
      dataPoints.forEach(dataPoint => {
        totalStudyTime += dataPoint.studyTime;
        totalPagesRead += dataPoint.pagesRead;
        totalSatisfaction += dataPoint.satisfaction;
        satisfactionCount += dataPoint.satisfactionCount;
        
        if (dataPoint.hasStudied) {
          studyDaysCount += 1;
        }
      });
      
      // グループの平均満足度を計算
      const averageSatisfaction = satisfactionCount > 0 
        ? totalSatisfaction / satisfactionCount 
        : 0;
      
      // 学習頻度を計算（学習日数 / 総日数）
      const frequency = dataPoints.length > 0 
        ? studyDaysCount / dataPoints.length 
        : 0;
      
      chartData.push({
        period: groupKey,
        label: getPeriodLabel(groupKey, period),
        studyTime: totalStudyTime,
        pagesRead: totalPagesRead,
        satisfaction: averageSatisfaction,
        frequency: frequency
      });
    });
    
    return chartData.sort((a, b) => a.period.localeCompare(b.period));
  }

  /**
   * 学習データの要約を計算する
   */
  private calculateSummary(
    dailyData: Map<string, LearningAnalyticsData>,
    startDate: Date,
    endDate: Date
  ): AnalysisSummary {
    // データがない場合は空のサマリーを返す
    if (dailyData.size === 0) {
      return this.createEmptySummary();
    }
    
    let totalStudyTime = 0;
    let totalSatisfaction = 0;
    let satisfactionCount = 0;
    let totalPages = 0;
    const studyDates: Date[] = [];
    
    dailyData.forEach(data => {
      totalStudyTime += data.studyTime;
      totalPages += data.pagesRead;
      
      if (data.satisfactionCount > 0) {
        totalSatisfaction += data.satisfaction;
        satisfactionCount += data.satisfactionCount;
      }
      
      if (data.hasStudied) {
        studyDates.push(data.date);
      }
    });
    
    // 連続学習日数の計算
    const { currentStreak, longestStreak } = this.calculateStudyStreaks(dailyData);
    
    // 総日数（日付範囲内の日数）
    const totalDays = differenceInDays(endDate, startDate) + 1;
    
    // 平均学習時間（分）
    const averageStudyTime = studyDates.length > 0 
      ? totalStudyTime / studyDates.length 
      : 0;
    
    // 平均満足度
    const averageSatisfaction = satisfactionCount > 0 
      ? totalSatisfaction / satisfactionCount 
      : 0;
    
    // 平均ページ数（1日あたり）
    const averagePagesPerDay = studyDates.length > 0 
      ? totalPages / studyDates.length 
      : 0;
    
    // 学習頻度（学習日数 / 総日数）
    const studyFrequency = totalDays > 0 
      ? studyDates.length / totalDays 
      : 0;
    
    // 最大間隔（連続していない日の最大数）
    const studyGap = this.calculateMaxInterval(studyDates);
    
    return {
      totalStudyTime,
      averageStudyTime,
      averageSatisfaction,
      longestStreak,
      currentStreak,
      totalPages,
      averagePagesPerDay,
      studyFrequency,
      studyGap
    };
  }

  /**
   * 連続学習日数を計算する
   */
  private calculateStudyStreaks(dailyData: Map<string, LearningAnalyticsData>): { currentStreak: number; longestStreak: number } {
    // 日付でソートされた学習日のリストを作成
    const sortedDates = Array.from(dailyData.entries())
      .filter(([_, data]) => data.hasStudied)
      .map(([dateStr, _]) => new Date(dateStr))
      .sort((a, b) => a.getTime() - b.getTime());
    
    if (sortedDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }
    
    let currentStreak = 0;
    let longestStreak = 0;
    let streak = 0;
    let prevDate: Date | null = null;
    
    // 連続学習日数を計算
    for (const date of sortedDates) {
      if (prevDate === null) {
        streak = 1;
      } else {
        const dayDiff = differenceInDays(date, prevDate);
        if (dayDiff === 1) {
          // 連続している場合
          streak += 1;
        } else {
          // 連続が途切れた場合
          streak = 1;
        }
      }
      
      longestStreak = Math.max(longestStreak, streak);
      prevDate = date;
    }
    
    // 現在の連続日数を計算
    // 最新の日付から今日までの連続を確認
    const today = new Date();
    const latestDate = sortedDates[sortedDates.length - 1];
    const daysSinceLastStudy = differenceInDays(today, latestDate);
    
    if (daysSinceLastStudy <= 1) {
      // 昨日か今日に学習していれば、現在の連続日数を計算
      currentStreak = streak;
    } else {
      // それ以外は連続が途切れている
      currentStreak = 0;
    }
    
    return { currentStreak, longestStreak };
  }

  /**
   * 日付の間の日数を計算して間隔の最大値を計算する
   */
  private calculateMaxInterval(dates: Date[]): number {
    if (dates.length <= 1) return 0;
    
    // 日付を昇順にソート
    const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
    
    let maxInterval = 0;
    for (let i = 1; i < sortedDates.length; i++) {
      const interval = differenceInDays(sortedDates[i], sortedDates[i - 1]);
      maxInterval = Math.max(maxInterval, interval);
    }
    
    return maxInterval;
  }

  /**
   * 進捗データを分析し、結果を返す
   * @param userId ユーザーID
   * @param period 分析期間
   * @param metric 分析指標
   * @param startDate 開始日
   * @param endDate 終了日
   * @param subjectId 科目ID（オプション）
   * @returns 分析結果
   */
  async analyzeProgress(
    userId: string,
    period: AnalysisPeriod,
    metric: AnalysisMetric,
    startDate: Date,
    endDate: Date,
    subjectId?: string
  ): Promise<AnalysisResult> {
    try {
      // progressRepositoryのgetByDateRange関数を使用
      const progressData = await progressRepository.getByDateRange(
        startDate, 
        endDate, 
        subjectId
      );
      
      // データがない場合、空の結果を返す
      if (!progressData || progressData.length === 0) {
        return {
          chartData: [],
          summary: this.createEmptySummary()
        };
      }
      
      // 日付ごとのデータを集計
      const dailyData = this.aggregateProgressByDate(progressData);
      
      // 期間に基づいてデータをグループ化
      const groupedData = this.groupDataByPeriod(dailyData, period, startDate, endDate);
      
      // チャートデータの作成
      const chartData = this.createChartData(groupedData, period);
      
      // サマリーの計算
      const summary = this.calculateSummary(dailyData, startDate, endDate);
      
      return {
        chartData,
        summary
      };
    } catch (error) {
      console.error('学習分析中にエラーが発生しました:', error);
      return {
        chartData: [],
        summary: this.createEmptySummary()
      };
    }
  }

  /**
   * 学習分析データを取得する
   */
  async getLearningAnalytics(
    userId: string,
    period: AnalysisPeriod = 'weekly',
    metric: AnalysisMetric = 'studyTime',
    subjectId?: string
  ): Promise<AnalysisResult> {
    // 日付範囲を計算
    const endDate = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'daily':
        startDate = subDays(endDate, 7); // 1週間分のデータ
        break;
      case 'weekly':
        startDate = subDays(endDate, 30); // 1ヶ月分のデータ
        break;
      case 'monthly':
        startDate = subDays(endDate, 90); // 3ヶ月分のデータ
        break;
      default:
        startDate = subDays(endDate, 30);
    }
    
    return this.analyzeProgress(userId, period, metric, startDate, endDate, subjectId);
  }
}

// シングルトンインスタンスを作成してエクスポート
export const learningAnalyticsRepository = new LearningAnalyticsRepository(firestore); 