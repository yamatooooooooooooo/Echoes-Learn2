import { SubjectRepository } from '../../infrastructure/repositories/subjectRepository';
import { UserSettingsRepository } from '../../infrastructure/repositories/userSettingsRepository';
import { Subject } from '../models/SubjectModel';
import { UserSettings } from '../models/UserSettingsModel';
import { DailyQuota, WeeklyQuota, StudyQuota } from '../models/QuotaModel';
import { calculateDaysRemaining, isSubjectCompleted } from '../../presentation/features/subject/utils/subjectUtils';
import { Progress } from '../models/ProgressModel';
import { ProgressRepository } from '../../infrastructure/repositories/progressRepository';

// 進捗履歴を含むSubjectの拡張型
interface SubjectWithProgress extends Subject {
  progressHistory?: Progress[];
}

/**
 * ノルマ計算サービス
 * ユーザー設定と科目情報に基づいて、デイリーノルマとウィークリーノルマを計算
 */
export class QuotaService {
  private userId: string;

  constructor(
    private subjectRepository: SubjectRepository,
    private userSettingsRepository: UserSettingsRepository,
    private progressRepository: ProgressRepository,
    userId: string
  ) {
    this.userId = userId;
  }

  /**
   * 今日のノルマを計算
   */
  async calculateDailyQuota(): Promise<DailyQuota> {
    const [subjects, settings] = await Promise.all([
      this.subjectRepository.getAllSubjects(this.userId),
      this.userSettingsRepository.getUserSettings()
    ]);

    // 学習対象の科目を抽出（完了していない科目のみ）
    const activeSubjects = subjects.filter(
      subject => !isSubjectCompleted(subject)
    );

    // 同時並行科目数を考慮して、優先度の高い科目を選択
    const selectedSubjects = this.selectPrioritySubjects(
      activeSubjects, 
      settings.maxConcurrentSubjects
    );

    // 各科目の今日のノルマを計算
    const quotaItems = await this.calculateDailyQuotaItems(selectedSubjects, settings);

    // トータルの計算
    const totalPages = quotaItems.reduce((sum, item) => sum + item.pages, 0);
    const totalMinutes = quotaItems.reduce((sum, item) => sum + item.estimatedMinutes, 0);
    const isCompleted = quotaItems.every(item => item.isCompleted);

    return {
      date: new Date(),
      totalPages,
      totalMinutes,
      quotaItems,
      isCompleted
    };
  }

  /**
   * 今週のノルマを計算
   */
  async calculateWeeklyQuota(): Promise<WeeklyQuota> {
    const [subjects, settings] = await Promise.all([
      this.subjectRepository.getAllSubjects(this.userId),
      this.userSettingsRepository.getUserSettings()
    ]);

    // 学習対象の科目を抽出（完了していない科目のみ）
    const activeSubjects = subjects.filter(
      subject => !isSubjectCompleted(subject)
    );

    // 同時並行科目数を考慮して、優先度の高い科目を選択
    const selectedSubjects = this.selectPrioritySubjects(
      activeSubjects, 
      settings.maxConcurrentSubjects
    );

    // 各科目の週間ノルマを計算
    const quotaItems = await this.calculateWeeklyQuotaItems(selectedSubjects, settings);

    // トータルの計算
    const totalPages = quotaItems.reduce((sum, item) => sum + item.pages, 0);
    const totalMinutes = quotaItems.reduce((sum, item) => sum + item.estimatedMinutes, 0);
    const isCompleted = quotaItems.every(item => item.isCompleted);

    // 週の開始日と終了日
    const today = new Date();
    const startDate = this.getStartOfWeek(today);
    const endDate = this.getEndOfWeek(today);

    // 日ごとの配分（単純に均等分配）
    const dailyDistribution = this.distributePagesPerDay(
      totalPages, 
      settings.studyDaysPerWeek
    );

    return {
      startDate,
      endDate,
      totalPages,
      totalMinutes,
      quotaItems,
      dailyDistribution,
      isCompleted
    };
  }

  /**
   * 優先度に基づいて科目を選択
   * 同時並行可能な最大科目数を考慮
   */
  private selectPrioritySubjects(subjects: Subject[], maxConcurrent: number): Subject[] {
    // 進捗100%の科目は既に完了しているため、ノルマ計算から除外する
    const incompleteSubjects = subjects.filter(subject => !isSubjectCompleted(subject));
    
    if (incompleteSubjects.length === 0) {
      return [];
    }
    
    // 各科目に一時的なスコアを計算（数値で比較するため）
    const subjectsWithScores = incompleteSubjects.map(subject => {
      // 試験日までの残り日数
      const daysRemaining = calculateDaysRemaining(subject.examDate) || Infinity;
      
      // 進捗率計算
      const progressPercent = subject.currentPage / subject.totalPages * 100;
      
      // 優先度スコアの計算
      let score = 0;
      
      // 日数に基づくスコア（少ないほど高スコア）
      if (daysRemaining <= 3) {
        score += 100; // 3日以内は最優先
      } else if (daysRemaining <= 7) {
        score += 80; // 1週間以内は高優先
      } else if (daysRemaining <= 14) {
        score += 60; // 2週間以内は中優先
      } else if (daysRemaining <= 30) {
        score += 40; // 1ヶ月以内
      } else if (daysRemaining <= 60) {
        score += 20; // 2ヶ月以内
      }
      
      // 現在の優先度も考慮（ユーザーが手動設定したものを優先）
      if (subject.priority === 'high') {
        score += 15;
      } else if (subject.priority === 'medium') {
        score += 10;
      }
      
      // 進捗率による調整
      if (progressPercent < 30) {
        score += 15; // 進捗30%未満
      } else if (progressPercent < 50) {
        score += 10; // 進捗50%未満
      } else if (progressPercent < 70) {
        score += 5; // 進捗70%未満
      }
      
      // 重要度による調整
      if (subject.importance === 'high') {
        score += 10;
      }
      
      return { subject, score, daysRemaining };
    });
    
    // スコアの高い順にソート
    subjectsWithScores.sort((a, b) => b.score - a.score);
    
    // 最大同時並行数まで選択
    const selectedSubjects = subjectsWithScores.slice(0, maxConcurrent);
    
    // 最低スコア閾値を計算（最高スコアの50%を基準とする）
    // これによりスコアが極端に低い科目は「high」にならないようにする
    const highestScore = selectedSubjects.length > 0 ? selectedSubjects[0].score : 0;
    const scoreThreshold = highestScore * 0.5; // 最高スコアの50%以上のみ「high」の候補
    
    // 選択された科目から、各科目の優先度を決定
    return selectedSubjects.map((item, index) => {
      const updatedSubject = { ...item.subject };
      
      // 最もスコアが高い科目だけを「high」にする
      if (index === 0 && selectedSubjects.length > 1) {
        updatedSubject.priority = 'high';
      } 
      // その他のスコアが閾値以上の科目は「medium」に設定
      else if (item.score >= scoreThreshold) {
        updatedSubject.priority = 'medium';
      } 
      // スコアが閾値未満の場合は「low」
      else {
        updatedSubject.priority = 'low';
      }
      
      return updatedSubject;
    });
  }

  /**
   * 各科目の今日のノルマを計算
   */
  private async calculateDailyQuotaItems(subjects: Subject[], settings: UserSettings): Promise<StudyQuota[]> {
    // 進捗100%の科目を除外
    const incompleteSubjects = subjects.filter(subject => !isSubjectCompleted(subject));
    
    if (incompleteSubjects.length === 0) {
      return [];
    }
    
    // 1日の合計可能な勉強時間（分）
    const totalDailyMinutes = settings.dailyStudyHours * 60;
    
    // 科目ごとの優先度に応じた時間配分比率
    const priorityWeights = this.calculatePriorityWeights(incompleteSubjects);
    
    // 本日の日付
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // 各科目のノルマと進捗状況を計算（Promise.allで並列処理）
    const quotaPromises = incompleteSubjects.map(async subject => {
      // 残りのページ数
      const remainingPages = subject.totalPages - (subject.currentPage || 0);
      
      // この科目に割り当てる時間（分）
      const allocatedMinutes = totalDailyMinutes * priorityWeights[subject.id];
      
      // 1ページあたりの時間から計算できるページ数
      const possiblePages = Math.floor(allocatedMinutes / settings.averagePageReadingTime);
      
      // 試験日までの実質的な残り日数（バッファを考慮）
      let effectiveDaysRemaining = Infinity;
      
      // 試験日が設定されている場合は、バッファを考慮した実質的な残り日数を計算
      if (subject.examDate) {
        const daysRemaining = calculateDaysRemaining(subject.examDate);
        // バッファ日数を引いた日数（最低1日）
        effectiveDaysRemaining = Math.max(1, daysRemaining - settings.examBufferDays);
      }
      
      // 試験日が設定されている場合は、残り日数を考慮して1日あたりの必要ページ数を計算
      let requiredPagesPerDay = remainingPages;
      if (effectiveDaysRemaining < Infinity) {
        requiredPagesPerDay = Math.ceil(remainingPages / effectiveDaysRemaining);
      }
      
      // 今日のノルマページ数（残りページ、可能ページ、1日あたり必要ページ数の中で適切な値）
      const pagesToday = Math.min(
        remainingPages, 
        Math.max(possiblePages, requiredPagesPerDay)
      );
      
      // 推定学習時間
      const estimatedMinutes = pagesToday * settings.averagePageReadingTime;
      
      // 本日の進捗記録を取得して、ノルマ達成状況を確認
      // 将来的にはProgressServiceを使用して取得するが、現時点ではリポジトリから直接取得
      const todaysProgress = await this.getTodaysProgress(subject.id);
      
      // 今日の進捗（全ての進捗記録のページ数を合計）
      const todaysTotalPages = todaysProgress.reduce((sum, p) => sum + p.pagesRead, 0);
      
      // ノルマ達成状況
      const isCompleted = todaysTotalPages >= pagesToday;
      
      return {
        subjectId: subject.id,
        subjectName: subject.name,
        priority: subject.priority || 'medium',
        pages: pagesToday,
        estimatedMinutes,
        progress: todaysTotalPages,
        isCompleted
      };
    });
    
    return Promise.all(quotaPromises);
  }

  /**
   * 各科目の今週のノルマを計算
   */
  private async calculateWeeklyQuotaItems(subjects: Subject[], settings: UserSettings): Promise<StudyQuota[]> {
    // 進捗100%の科目を除外
    const incompleteSubjects = subjects.filter(subject => !isSubjectCompleted(subject));
    
    if (incompleteSubjects.length === 0) {
      return [];
    }
    
    // 週ごとの合計可能な勉強時間（分）
    const totalWeeklyMinutes = settings.dailyStudyHours * 60 * settings.studyDaysPerWeek;
    
    // 科目ごとの優先度に応じた時間配分比率
    const priorityWeights = this.calculatePriorityWeights(incompleteSubjects);
    
    // 今週の日付範囲
    const today = new Date();
    const startOfWeek = this.getStartOfWeek(today);
    const endOfWeek = this.getEndOfWeek(today);
    
    // 各科目のノルマと進捗状況を計算（Promise.allで並列処理）
    const quotaPromises = incompleteSubjects.map(async subject => {
      // 残りのページ数
      const remainingPages = subject.totalPages - (subject.currentPage || 0);
      
      // この科目に割り当てる時間（分）
      const allocatedMinutes = totalWeeklyMinutes * priorityWeights[subject.id];
      
      // 1ページあたりの時間から計算できるページ数
      const possiblePages = Math.floor(allocatedMinutes / settings.averagePageReadingTime);
      
      // 試験日までの実質的な残り週数（バッファを考慮）
      let effectiveWeeksRemaining = Infinity;
      
      // 試験日が設定されている場合は、バッファを考慮した実質的な残り週数を計算
      if (subject.examDate) {
        const daysRemaining = calculateDaysRemaining(subject.examDate);
        // 残り日数をバッファを考慮して週数に変換（最低1週間）
        effectiveWeeksRemaining = Math.max(1, Math.floor((daysRemaining - settings.examBufferDays) / 7));
      }
      
      // 試験日が設定されている場合は、残り週数を考慮して1週間あたりの必要ページ数を計算
      let requiredPagesPerWeek = remainingPages;
      if (effectiveWeeksRemaining < Infinity) {
        requiredPagesPerWeek = Math.ceil(remainingPages / effectiveWeeksRemaining);
      }
      
      // 今週のノルマページ数（残りページ、可能ページ、1週間あたり必要ページ数の中で適切な値）
      const pagesToday = Math.min(
        remainingPages, 
        Math.max(possiblePages, requiredPagesPerWeek)
      );
      
      // 推定学習時間
      const estimatedMinutes = pagesToday * settings.averagePageReadingTime;
      
      // 今週の進捗記録を取得して、ノルマ達成状況を確認
      const thisWeeksProgress = await this.getProgressInDateRange(
        subject.id, 
        startOfWeek, 
        endOfWeek
      );
      
      // 今週の進捗（全ての進捗記録のページ数を合計）
      const thisWeekTotalPages = thisWeeksProgress.reduce((sum, p) => sum + p.pagesRead, 0);
      
      // ノルマ達成状況
      const isCompleted = thisWeekTotalPages >= pagesToday;
      
      return {
        subjectId: subject.id,
        subjectName: subject.name,
        priority: subject.priority || 'medium',
        pages: pagesToday,
        estimatedMinutes,
        progress: thisWeekTotalPages,
        isCompleted
      };
    });
    
    return Promise.all(quotaPromises);
  }

  /**
   * 科目ごとの優先度に基づいた時間配分比率を計算
   */
  private calculatePriorityWeights(subjects: Subject[]): Record<string, number> {
    const weights: Record<string, number> = {};
    
    // 優先度ごとの重み
    const priorityFactors = {
      high: 3,    // 高優先度の科目は3倍の時間
      medium: 2,  // 中優先度の科目は2倍の時間
      low: 1      // 低優先度の科目は基本時間
    };
    
    // 優先度ごとの合計重み
    let totalWeight = 0;
    
    // 各科目の重みを計算
    subjects.forEach(subject => {
      const priority = subject.priority || 'medium';
      const weight = priorityFactors[priority];
      weights[subject.id] = weight;
      totalWeight += weight;
    });
    
    // 正規化（合計が1になるように）
    if (totalWeight > 0) {
      for (const id in weights) {
        weights[id] = weights[id] / totalWeight;
      }
    }
    
    return weights;
  }

  /**
   * 今日の進捗記録を取得
   */
  private async getTodaysProgress(subjectId: string): Promise<Progress[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.getProgressInDateRange(subjectId, today, tomorrow);
  }

  /**
   * 指定期間内の進捗記録を取得
   */
  private async getProgressInDateRange(
    subjectId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<Progress[]> {
    try {
      // 科目の全進捗記録を取得
      const allProgress = await this.progressRepository.getSubjectProgress(
        this.userId, 
        subjectId
      );
      
      // 指定期間内の進捗をフィルタリング
      return allProgress.filter(progress => {
        const recordDate = new Date(progress.recordDate);
        return recordDate >= startDate && recordDate < endDate;
      });
    } catch (error) {
      console.error('Progress retrieval failed:', error);
      return [];
    }
  }

  /**
   * 週の開始日（月曜日）を取得
   */
  private getStartOfWeek(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // 日曜日の場合は-6
    const monday = new Date(date);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  /**
   * 週の終了日（日曜日）を取得
   */
  private getEndOfWeek(date: Date): Date {
    const startOfWeek = this.getStartOfWeek(date);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return endOfWeek;
  }

  /**
   * 週間ノルマを日ごとに分配
   */
  private distributePagesPerDay(totalPages: number, studyDaysPerWeek: number): Record<string, number> {
    const distribution: Record<string, number> = {};
    const today = new Date();
    
    // 各曜日の名前（日本語）
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    
    // 1日あたりのページ数（切り上げ）
    const pagesPerDay = Math.ceil(totalPages / studyDaysPerWeek);
    
    // 週の開始日（月曜日）
    const startOfWeek = this.getStartOfWeek(today);
    
    // 今日が週の何日目か（0=月, 1=火, ..., 6=日）
    const dayOfWeek = (today.getDay() + 6) % 7; // 月曜日を0とする
    
    // 残りの勉強可能日数
    let remainingDays = Math.min(studyDaysPerWeek, 7 - dayOfWeek);
    
    // 既に過ぎた日は0ページとする
    for (let i = 0; i < dayOfWeek; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      
      // 過ぎた日
      distribution[`${dateKey} (${dayNames[(i + 1) % 7]})`] = 0;
    }
    
    // 残りのページを残りの日数で分配
    let remainingPages = totalPages;
    
    // 今日を含む残りの日に割り当て
    for (let i = dayOfWeek; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      
      if (remainingDays > 0) {
        // まだ勉強可能日が残っている
        const pagesForThisDay = Math.min(pagesPerDay, remainingPages);
        distribution[`${dateKey} (${dayNames[(i + 1) % 7]})`] = pagesForThisDay;
        remainingPages -= pagesForThisDay;
        remainingDays--;
      } else {
        // もう勉強予定日は終わった
        distribution[`${dateKey} (${dayNames[(i + 1) % 7]})`] = 0;
      }
    }
    
    return distribution;
  }
} 