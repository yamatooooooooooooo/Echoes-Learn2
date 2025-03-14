import { AnalysisResult, AnalysisPeriod, AnalysisMetric } from '../../models/LearningAnalyticsModel';

/**
 * 学習進捗分析のリポジトリインターフェース
 */
export interface ILearningAnalyticsRepository {
  /**
   * 特定の期間の学習データを取得し分析する
   * @param userId ユーザーID
   * @param period 分析期間（日別、週別、月別）
   * @param metric 分析指標（学習時間、ページ数、頻度、満足度）
   * @param startDate 開始日
   * @param endDate 終了日
   * @param subjectId 特定の科目に絞る場合の科目ID（省略可）
   */
  analyzeProgress(
    userId: string, 
    period: AnalysisPeriod, 
    metric: AnalysisMetric,
    startDate: Date,
    endDate: Date,
    subjectId?: string
  ): Promise<AnalysisResult>;
  
  /**
   * 学習分析データを取得する
   * @param userId ユーザーID
   * @param period 分析期間（日別、週別、月別）
   * @param metric 分析指標（学習時間、ページ数、頻度、満足度）
   * @param subjectId 特定の科目に絞る場合の科目ID（省略可）
   */
  getLearningAnalytics(
    userId: string,
    period?: AnalysisPeriod,
    metric?: AnalysisMetric,
    subjectId?: string
  ): Promise<AnalysisResult>;
} 