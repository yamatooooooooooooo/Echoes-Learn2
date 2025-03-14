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
  getPeriodLabel
} from '../../domain/models/LearningAnalyticsModel';
import { Progress } from '../../domain/models/ProgressModel';
import { differenceInDays, format, subMonths, isSameDay } from 'date-fns';
import { firestore } from '../../config/firebase';
import { addDoc, limit, DocumentData } from 'firebase/firestore';
import { getProgressBySubject } from './progressRepository';
import { FIREBASE_COLLECTIONS } from '../../config';

/**
 * 学習進捗分析リポジトリの実装
 */
export class LearningAnalyticsRepository implements ILearningAnalyticsRepository {
  constructor(private firestore: Firestore) {}

  /**
   * Firestoreのタイムスタンプまたは日付文字列からJavaScriptのDateオブジェクトに変換する
   */
  private convertToDate(dateField: any): Date {
    if (!dateField) return new Date();
    
    // FirestoreのTimestamp型の場合
    if (dateField && typeof dateField.toDate === 'function') {
      return dateField.toDate();
    }
    
    // 文字列の場合
    if (typeof dateField === 'string') {
      return new Date(dateField);
    }
    
    // Dateオブジェクトの場合
    if (dateField instanceof Date) {
      return dateField;
    }
    
    // 数値（タイムスタンプ）の場合
    if (typeof dateField === 'number') {
      return new Date(dateField);
    }
    
    console.warn('不明な日付形式:', dateField);
    return new Date();
  }

  /**
   * 進捗データをFirestoreから取得する
   */
  private async fetchProgressData(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    subjectId?: string
  ): Promise<Progress[]> {
    try {
      const progressRef = collection(this.firestore, 'users', userId, 'progress');
      let q;
      
      // 検索条件の構築
      const conditions = [];
      
      // 科目IDが指定されている場合はフィルター
      if (subjectId) {
        conditions.push(where('subjectId', '==', subjectId));
      }
      
      // 日付範囲が指定されている場合はフィルター
      if (startDate && endDate) {
        conditions.push(where('recordDate', '>=', startDate));
        conditions.push(where('recordDate', '<=', endDate));
      }
      
      // 条件を組み立てる
      if (conditions.length > 0) {
        q = query(progressRef, ...conditions, orderBy('recordDate', 'asc'));
      } else {
        // デフォルトは最近3ヶ月のデータ
        const defaultStartDate = subMonths(new Date(), 3);
        q = query(
          progressRef,
          where('recordDate', '>=', defaultStartDate),
          orderBy('recordDate', 'asc')
        );
      }
      
      const snapshot = await getDocs(q);
      
      const progress: Progress[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        progress.push({
          id: doc.id,
          ...data,
          recordDate: this.convertToDate(data.recordDate),
          updatedAt: this.convertToDate(data.updatedAt),
          createdAt: this.convertToDate(data.createdAt)
        } as Progress);
      });
      
      return progress;
    } catch (error) {
      console.error('進捗データの取得中にエラーが発生しました:', error);
      throw error;
    }
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
   * 特定の期間の学習データを取得し分析する
   */
  async analyzeProgress(
    userId: string,
    period: AnalysisPeriod,
    metric: AnalysisMetric,
    startDate?: Date,
    endDate?: Date,
    subjectId?: string
  ): Promise<AnalysisResult> {
    const progressData = await getProgressBySubject(userId, subjectId || '', startDate, endDate);
    
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
  }

  /**
   * 科目ごとの学習時間を取得する
   */
  async getStudyTimeBySubject(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{ subjectId: string; subjectName: string; studyTime: number }[]> {
    // 進捗データを取得
    const progressData = await this.fetchProgressData(userId, startDate, endDate);
    
    // 科目ごとに集計
    const subjectMap = new Map<string, { subjectId: string; subjectName: string; studyTime: number }>();
    
    progressData.forEach(progress => {
      const subjectId = progress.subjectId;
      const studyTime = progress.studyDuration || 0;
      
      if (!subjectMap.has(subjectId)) {
        subjectMap.set(subjectId, { 
          subjectId, 
          subjectName: '科目' + subjectId.slice(-4), // 科目名取得のため、将来的に科目リポジトリと連携
          studyTime: 0 
        });
      }
      
      const current = subjectMap.get(subjectId)!;
      current.studyTime += studyTime;
    });
    
    // 結果を配列にして返す
    return Array.from(subjectMap.values());
  }

  /**
   * 科目ごとの満足度を取得する
   */
  async getSatisfactionBySubject(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{ subjectId: string; subjectName: string; satisfaction: number }[]> {
    // 進捗データを取得
    const progressData = await this.fetchProgressData(userId, startDate, endDate);
    
    // 科目ごとに集計
    const subjectMap = new Map<
      string, 
      { subjectId: string; subjectName: string; totalSatisfaction: number; count: number }
    >();
    
    progressData.forEach(progress => {
      const subjectId = progress.subjectId;
      const satisfactionLevel = progress.satisfactionLevel;
      
      if (!satisfactionLevel) return; // 満足度がない場合はスキップ
      
      if (!subjectMap.has(subjectId)) {
        subjectMap.set(subjectId, { 
          subjectId, 
          subjectName: '科目' + subjectId.slice(-4), // 科目名取得のため、将来的に科目リポジトリと連携
          totalSatisfaction: 0,
          count: 0
        });
      }
      
      const current = subjectMap.get(subjectId)!;
      current.totalSatisfaction += satisfactionLevel;
      current.count++;
    });
    
    // 平均満足度を計算して結果を配列にして返す
    return Array.from(subjectMap.values())
      .map(item => ({
        subjectId: item.subjectId,
        subjectName: item.subjectName,
        satisfaction: item.count > 0 
          ? Number((item.totalSatisfaction / item.count).toFixed(1)) 
          : 0
      }));
  }

  /**
   * 最適化した学習分析データ取得関数
   * @param userId ユーザーID
   * @param period 期間（日・週・月）
   * @returns 分析データの配列
   */
  async getLearningAnalytics(
    userId: string,
    period: 'day' | 'week' | 'month' = 'week'
  ): Promise<LearningAnalyticsData[]> {
    try {
      // 期間に基づいて日付範囲を決定
      const today = new Date();
      let startDate;
      
      switch (period) {
        case 'day':
          startDate = subDays(today, 7); // 過去7日間
          break;
        case 'week':
          startDate = subDays(today, 28); // 過去4週間
          break;
        case 'month':
          startDate = subDays(today, 180); // 過去6ヶ月
          break;
        default:
          startDate = subDays(today, 28);
      }
      
      // Firestoreからユーザーの学習データを取得
      const analyticsRef = collection(firestore, FIREBASE_COLLECTIONS.STUDY_ANALYTICS);
      const q = query(
        analyticsRef,
        where('userId', '==', userId),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        orderBy('timestamp', 'asc')
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // データがない場合はサンプルデータを返す（開発用）
        return this.generateSampleData(period);
      }
      
      // ドキュメントデータを整形
      const rawData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // 期間ごとにデータをグループ化
      const groupedData = this.groupAnalyticsData(rawData, period);
      
      // LearningAnalyticsData形式に変換
      return Object.entries(groupedData).map(([date, data]) => ({
        date,
        studyTime: data.studyTime || 0,
        completedTasks: data.completedTasks || 0,
        frequency: data.frequency || 0,
        satisfaction: data.satisfaction || 0
      }));
    } catch (error) {
      console.error('学習分析データの取得中にエラーが発生しました:', error);
      return this.generateSampleData(period); // エラー時はサンプルデータを返す
    }
  }
  
  /**
   * 生データを期間ごとにグループ化
   * @param rawData 生データ
   * @param period 期間
   * @returns グループ化されたデータ
   */
  private groupAnalyticsData(rawData: DocumentData[], period: string): Record<string, any> {
    const groupedData: Record<string, any> = {};
    
    rawData.forEach(item => {
      // タイムスタンプをDateに変換
      const date = item.timestamp.toDate();
      
      // 期間に応じたフォーマットの日付キーを作成
      let dateKey;
      switch (period) {
        case 'day':
          dateKey = format(date, 'yyyy-MM-dd');
          break;
        case 'week':
          const weekStart = startOfWeek(date);
          dateKey = format(weekStart, 'yyyy-MM-dd');
          break;
        case 'month':
          dateKey = format(date, 'yyyy-MM');
          break;
        default:
          dateKey = format(date, 'yyyy-MM-dd');
      }
      
      // グループ化されたデータに追加または値を更新
      if (!groupedData[dateKey]) {
        groupedData[dateKey] = {
          studyTime: 0,
          completedTasks: 0,
          frequency: 0,
          satisfaction: 0,
          count: 0
        };
      }
      
      // 値を累積
      groupedData[dateKey].studyTime += item.studyTime || 0;
      groupedData[dateKey].completedTasks += item.completedTasks || 0;
      groupedData[dateKey].frequency += 1;
      groupedData[dateKey].satisfaction += item.satisfaction || 0;
      groupedData[dateKey].count += 1;
    });
    
    // 平均満足度を計算
    Object.keys(groupedData).forEach(key => {
      const group = groupedData[key];
      group.satisfaction = group.count > 0 ? group.satisfaction / group.count : 0;
      delete group.count;
    });
    
    return groupedData;
  }
  
  /**
   * サンプルデータを生成（データがない場合やテスト用）
   * @param period 期間
   * @returns サンプルデータ
   */
  private generateSampleData(period: string): LearningAnalyticsData[] {
    const today = new Date();
    const result: LearningAnalyticsData[] = [];
    
    let dateCount;
    let dateFormat;
    
    switch (period) {
      case 'day':
        dateCount = 7;
        dateFormat = 'yyyy-MM-dd';
        break;
      case 'week':
        dateCount = 4;
        dateFormat = 'yyyy-MM-dd';
        break;
      case 'month':
        dateCount = 6;
        dateFormat = 'yyyy-MM';
        break;
      default:
        dateCount = 7;
        dateFormat = 'yyyy-MM-dd';
    }
    
    for (let i = 0; i < dateCount; i++) {
      const date = subDays(today, (dateCount - 1 - i) * (period === 'day' ? 1 : period === 'week' ? 7 : 30));
      
      let dateKey;
      if (period === 'week') {
        dateKey = format(startOfWeek(date), dateFormat);
      } else if (period === 'month') {
        dateKey = format(startOfMonth(date), dateFormat);
      } else {
        dateKey = format(date, dateFormat);
      }
      
      result.push({
        date: dateKey,
        studyTime: Math.floor(Math.random() * 60) + 20,
        completedTasks: Math.floor(Math.random() * 5) + 1,
        frequency: Math.floor(Math.random() * 3) + 1,
        satisfaction: Math.floor(Math.random() * 3) + 1
      });
    }
    
    return result;
  }
  
  /**
   * 進捗データを日付ごとに集計
   * @param progressData 進捗データ
   * @returns 日付ごとに集計されたデータ
   */
  private aggregateProgressByDate(progressData: any[]): Record<string, any> {
    const result: Record<string, any> = {};
    
    progressData.forEach(progress => {
      const date = format(progress.timestamp.toDate(), 'yyyy-MM-dd');
      
      if (!result[date]) {
        result[date] = {
          time: 0,
          tasks: 0,
          frequency: 1,
          satisfaction: progress.satisfaction || 0,
          satisfactionCount: progress.satisfaction ? 1 : 0
        };
      } else {
        result[date].frequency += 1;
        if (progress.satisfaction) {
          result[date].satisfaction += progress.satisfaction;
          result[date].satisfactionCount += 1;
        }
      }
      
      // 学習時間と完了タスク数を集計
      result[date].time += progress.studyTime || 0;
      result[date].tasks += progress.completedPages || 0;
    });
    
    // 満足度の平均を計算
    Object.keys(result).forEach(date => {
      if (result[date].satisfactionCount > 0) {
        result[date].satisfaction = result[date].satisfaction / result[date].satisfactionCount;
      }
      delete result[date].satisfactionCount;
    });
    
    return result;
  }
  
  /**
   * 日付データを期間ごとにグループ化
   * @param dailyData 日次データ
   * @param period 期間
   * @param startDate 開始日
   * @param endDate 終了日
   * @returns グループ化されたデータ
   */
  private groupDataByPeriod(
    dailyData: Record<string, any>,
    period: AnalysisPeriod,
    startDate: Date,
    endDate: Date
  ): Record<string, any> {
    if (period === 'day') {
      return dailyData;
    }
    
    const result: Record<string, any> = {};
    
    // 期間ごとのグループキーを生成
    Object.keys(dailyData).forEach(dateStr => {
      const date = parseISO(dateStr);
      let groupKey: string;
      
      if (period === 'week') {
        groupKey = format(startOfWeek(date), 'yyyy-MM-dd');
      } else { // month
        groupKey = format(date, 'yyyy-MM');
      }
      
      if (!result[groupKey]) {
        result[groupKey] = {
          time: 0,
          tasks: 0,
          frequency: 0,
          satisfaction: 0,
          satisfactionCount: 0,
          daysCount: 0
        };
      }
      
      // データを集計
      const dayData = dailyData[dateStr];
      result[groupKey].time += dayData.time;
      result[groupKey].tasks += dayData.tasks;
      result[groupKey].frequency += 1; // 学習日数をカウント
      result[groupKey].daysCount += 1;
      
      if (dayData.satisfaction > 0) {
        result[groupKey].satisfaction += dayData.satisfaction;
        result[groupKey].satisfactionCount += 1;
      }
    });
    
    // 満足度の平均を計算
    Object.keys(result).forEach(key => {
      if (result[key].satisfactionCount > 0) {
        result[key].satisfaction = result[key].satisfaction / result[key].satisfactionCount;
      }
      delete result[key].satisfactionCount;
      delete result[key].daysCount;
    });
    
    return result;
  }
  
  /**
   * チャートデータを作成
   * @param groupedData グループ化されたデータ
   * @param period 期間
   * @returns チャートデータ
   */
  private createChartData(groupedData: Record<string, any>, period: AnalysisPeriod): ChartDataPoint[] {
    const result: ChartDataPoint[] = [];
    
    Object.keys(groupedData)
      .sort() // 日付でソート
      .forEach(dateKey => {
        const data = groupedData[dateKey];
        
        // 表示用の日付ラベルを設定
        let displayDate = dateKey;
        if (period === 'month') {
          displayDate = format(parseISO(dateKey + '-01'), 'yyyy/MM');
        } else if (period === 'week') {
          const startDay = parseISO(dateKey);
          const endDay = addDays(startDay, 6);
          displayDate = `${format(startDay, 'MM/dd')}-${format(endDay, 'MM/dd')}`;
        } else {
          displayDate = format(parseISO(dateKey), 'MM/dd');
        }
        
        result.push({
          date: displayDate,
          time: data.time,
          tasks: data.tasks,
          frequency: data.frequency,
          satisfaction: data.satisfaction
        });
      });
    
    return result;
  }
  
  /**
   * サマリーを計算
   * @param dailyData 日次データ
   * @param startDate 開始日
   * @param endDate 終了日
   * @returns 分析サマリー
   */
  private calculateSummary(
    dailyData: Record<string, any>,
    startDate: Date,
    endDate: Date
  ): AnalysisSummary {
    // 日付の範囲内の日数
    const totalDays = differenceInDays(endDate, startDate) + 1;
    
    // 集計用の変数
    let totalStudyTime = 0;
    let totalTasksCompleted = 0;
    let daysStudied = 0;
    let totalSatisfaction = 0;
    let satisfactionCount = 0;
    
    // 学習間隔の計算用
    const studyDates: Date[] = [];
    
    Object.keys(dailyData).forEach(dateStr => {
      const data = dailyData[dateStr];
      const date = parseISO(dateStr);
      
      totalStudyTime += data.time;
      totalTasksCompleted += data.tasks;
      daysStudied += 1;
      
      if (data.satisfaction > 0) {
        totalSatisfaction += data.satisfaction;
        satisfactionCount += 1;
      }
      
      studyDates.push(date);
    });
    
    // 平均満足度
    const averageSatisfaction = satisfactionCount > 0 ? totalSatisfaction / satisfactionCount : 0;
    
    // 平均学習時間（1日あたり）
    const averageStudyTimePerDay = daysStudied > 0 ? totalStudyTime / daysStudied : 0;
    
    // 平均タスク数（1日あたり）
    const averageTasksPerDay = daysStudied > 0 ? totalTasksCompleted / daysStudied : 0;
    
    // 学習効率（タスク/時間）
    const studyEfficiency = totalStudyTime > 0 ? totalTasksCompleted / totalStudyTime : 0;
    
    // 最大学習間隔の計算
    let maxStudyInterval = 0;
    
    if (studyDates.length > 1) {
      // 日付でソート
      studyDates.sort((a, b) => a.getTime() - b.getTime());
      
      // 連続する日付の間隔を計算
      for (let i = 1; i < studyDates.length; i++) {
        const interval = differenceInDays(studyDates[i], studyDates[i - 1]);
        maxStudyInterval = Math.max(maxStudyInterval, interval);
      }
    }
    
    return {
      totalStudyTime,
      averageStudyTimePerDay,
      totalTasksCompleted,
      averageTasksPerDay,
      daysStudied,
      maxStudyInterval,
      averageSatisfaction,
      studyEfficiency
    };
  }
  
  /**
   * 空のサマリーを作成
   * @returns 空のサマリー
   */
  private createEmptySummary(): AnalysisSummary {
    return {
      totalStudyTime: 0,
      averageStudyTimePerDay: 0,
      totalTasksCompleted: 0,
      averageTasksPerDay: 0,
      daysStudied: 0,
      maxStudyInterval: 0,
      averageSatisfaction: 0,
      studyEfficiency: 0
    };
  }
} 