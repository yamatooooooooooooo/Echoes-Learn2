import { SubjectRepository } from '../../infrastructure/repositories/subjectRepository';
import { UserSettingsRepository } from '../../infrastructure/repositories/userSettingsRepository';
import { Subject } from '../models/SubjectModel';
import { UserSettings } from '../models/UserSettingsModel';
import { DailyQuota, WeeklyQuota, StudyQuota } from '../models/QuotaModel';
import { calculateDaysRemaining } from '../../presentation/features/subject/utils/subjectUtils';
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
      subject => subject.currentPage < subject.totalPages
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
      subject => subject.currentPage < subject.totalPages
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
    // 各科目に一時的なスコアを計算（数値で比較するため）
    const subjectsWithScores = subjects.map(subject => {
      // 試験日までの残り日数
      const daysRemaining = calculateDaysRemaining(subject.examDate) || Infinity;
      
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
      const progress = subject.currentPage / subject.totalPages * 100;
      if (progress < 30) {
        score += 15; // 進捗30%未満
      } else if (progress < 50) {
        score += 10; // 進捗50%未満
      } else if (progress < 70) {
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
    // 全ての並行科目に「high」を割り当てるが、スコア閾値を下回る場合は「medium」にする
    return selectedSubjects.map((item, index) => {
      const updatedSubject = { ...item.subject };
      
      // 全ての科目に対して、スコア閾値を超えていれば「high」に設定
      if (item.score >= scoreThreshold) {
        updatedSubject.priority = 'high';
      } 
      // スコアが閾値未満の場合は「medium」
      else if (item.daysRemaining <= 30) {
        updatedSubject.priority = 'medium';
      } 
      // それ以外は「low」
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
    // 1日の合計可能な勉強時間（分）
    const totalDailyMinutes = settings.dailyStudyHours * 60;
    
    // 科目ごとの優先度に応じた時間配分比率
    const priorityWeights = this.calculatePriorityWeights(subjects);
    
    // 本日の日付
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // 各科目のノルマと進捗状況を計算（Promise.allで並列処理）
    const quotaPromises = subjects.map(async subject => {
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
      
      // 今日の進捗を取得
      const allProgress = await this.progressRepository.getSubjectProgress(
        this.userId,
        subject.id
      );
      const todaysProgress = allProgress.filter(p => {
        // 日付比較を確実に行うための処理
        return p.recordDate === todayStr;
      });
      
      console.log(`科目: ${subject.name}, 今日の日付: ${todayStr}, 進捗レコード: `, todaysProgress);
      
      // 今日読んだページ数の合計
      const pagesRead = todaysProgress.reduce((sum, p) => sum + p.pagesRead, 0);
      
      // 進捗率の計算（小数点以下切り捨て）
      const progressPercentage = pagesToday > 0 
        ? Math.floor((pagesRead / pagesToday) * 100)
        : 0;
      
      // ノルマ達成判定
      const isCompleted = pagesRead >= pagesToday;
      
      return {
        subjectId: subject.id,
        subjectName: subject.name,
        pages: pagesToday,
        estimatedMinutes,
        priority: subject.priority || 'low',
        examDate: subject.examDate,
        isCompleted,
        pagesRead,
        progressPercentage
      };
    });
    
    // すべてのPromiseが完了するのを待つ
    return Promise.all(quotaPromises);
  }

  /**
   * 各科目の週間ノルマを計算
   */
  private async calculateWeeklyQuotaItems(subjects: Subject[], settings: UserSettings): Promise<StudyQuota[]> {
    // 週の合計可能な勉強時間（分）
    const totalWeeklyMinutes = settings.dailyStudyHours * 60 * settings.studyDaysPerWeek;
    
    // 科目ごとの優先度に応じた時間配分比率
    const priorityWeights = this.calculatePriorityWeights(subjects);
    
    // 今週の期間
    const startOfWeek = this.getStartOfWeek(new Date());
    const endOfWeek = this.getEndOfWeek(new Date());
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
    const endOfWeekStr = endOfWeek.toISOString().split('T')[0];
    
    // 各科目の週間ノルマと進捗状況を計算
    const quotaPromises = subjects.map(async subject => {
      // 残りのページ数
      const remainingPages = subject.totalPages - (subject.currentPage || 0);
      
      // この科目の優先度に基づいて全体から割合を計算
      const weightedRatio = priorityWeights[subject.id];
      
      // 週間の可能な合計学習時間（分）
      const totalWeeklyMinutes = settings.studyDaysPerWeek * settings.dailyStudyHours * 60;
      
      // 割り当てる時間（分）
      const allocatedMinutes = totalWeeklyMinutes * weightedRatio;
      
      // この科目に割り当てる週間のページ数
      const possiblePages = Math.floor(allocatedMinutes / settings.averagePageReadingTime);
      
      // 試験日までの実質的な残り週数（バッファを考慮）
      let effectiveWeeksRemaining = Infinity;
      
      // 試験日が設定されている場合は、バッファを考慮した実質的な残り週数を計算
      if (subject.examDate) {
        const daysRemaining = calculateDaysRemaining(subject.examDate);
        // バッファ日数を引いた後の日数
        const effectiveDaysRemaining = Math.max(1, daysRemaining - settings.examBufferDays);
        // 日数から週数に変換（切り上げ）
        effectiveWeeksRemaining = Math.ceil(effectiveDaysRemaining / 7);
      }
      
      // 試験日に基づいて必要な週間ページ数を計算
      let requiredPagesPerWeek = remainingPages;
      if (effectiveWeeksRemaining < Infinity) {
        requiredPagesPerWeek = Math.ceil(remainingPages / effectiveWeeksRemaining);
      }
      
      // 週間のノルマページ数（可能ページと必要ページの大きい方、ただし残りページを超えない）
      const pagesThisWeek = Math.min(
        remainingPages, 
        Math.max(possiblePages, requiredPagesPerWeek)
      );
      
      // 推定学習時間
      const estimatedMinutes = pagesThisWeek * settings.averagePageReadingTime;
      
      // 今週の進捗を取得 - 先週の日曜日から今週の土曜日まで
      const allProgress = await this.progressRepository.getSubjectProgress(
        this.userId,
        subject.id
      );
      
      // 今週の進捗を抽出
      const thisWeeksProgress = allProgress.filter(p => {
        const recordDate = p.recordDate;
        return recordDate >= startOfWeekStr && recordDate <= endOfWeekStr;
      });
      
      console.log(`科目: ${subject.name}, 週間範囲: ${startOfWeekStr} - ${endOfWeekStr}, 進捗レコード: `, thisWeeksProgress);
      
      // 今週読んだページ数の合計
      const pagesRead = thisWeeksProgress.reduce((sum, p) => sum + p.pagesRead, 0);
      
      // 進捗率の計算（小数点以下切り捨て）
      const progressPercentage = pagesThisWeek > 0 
        ? Math.floor((pagesRead / pagesThisWeek) * 100)
        : 0;
      
      // ノルマ達成判定
      const isCompleted = pagesRead >= pagesThisWeek;
      
      return {
        subjectId: subject.id,
        subjectName: subject.name,
        pages: pagesThisWeek,
        estimatedMinutes,
        priority: subject.priority || 'low',
        examDate: subject.examDate,
        isCompleted,
        pagesRead,
        progressPercentage
      };
    });
    
    // すべてのPromiseが完了するのを待つ
    return Promise.all(quotaPromises);
  }

  /**
   * 科目の優先度に基づいて時間配分の重みを計算
   */
  private calculatePriorityWeights(subjects: Subject[]): Record<string, number> {
    // 優先度ごとの基本的な重み
    const priorityWeights = {
      high: 3,
      medium: 2,
      low: 1
    };
    
    // 各科目の重みを計算
    const subjectWeights: Record<string, number> = {};
    let totalWeight = 0;
    
    subjects.forEach(subject => {
      // 基本の優先度の重み
      let weight = priorityWeights[subject.priority || 'low'];
      
      // 試験日までの残り日数に基づく追加の重み
      if (subject.examDate) {
        const daysRemaining = calculateDaysRemaining(subject.examDate);
        
        // 残り日数に基づく乗数（日数が少ないほど大きな乗数）
        let daysMultiplier = 1;
        if (daysRemaining <= 3) {
          daysMultiplier = 3.0; // 3日以内は3倍
        } else if (daysRemaining <= 7) {
          daysMultiplier = 2.5; // 1週間以内は2.5倍
        } else if (daysRemaining <= 14) {
          daysMultiplier = 2.0; // 2週間以内は2倍
        } else if (daysRemaining <= 30) {
          daysMultiplier = 1.5; // 1ヶ月以内は1.5倍
        }
        
        // 重みに日数の乗数を適用
        weight *= daysMultiplier;
      }
      
      subjectWeights[subject.id] = weight;
      totalWeight += weight;
    });
    
    // 正規化（合計が1になるように）
    if (totalWeight > 0) {
      for (const id in subjectWeights) {
        subjectWeights[id] /= totalWeight;
      }
    } else {
      // 重みの合計が0の場合は均等配分
      const equalShare = 1 / subjects.length;
      subjects.forEach(subject => {
        subjectWeights[subject.id] = equalShare;
      });
    }
    
    return subjectWeights;
  }

  /**
   * 週の開始日（日曜日）を取得
   */
  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day); // 日曜日に設定
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * 週の終了日（土曜日）を取得
   */
  private getEndOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() + (6 - day)); // 土曜日に設定
    d.setHours(23, 59, 59, 999);
    return d;
  }

  /**
   * 週間の総ページ数を日ごとに分配
   */
  private distributePagesPerDay(totalPages: number, studyDaysPerWeek: number): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    // 現在の日付
    const today = new Date();
    
    // 各日に均等に配分
    const pagesPerDay = Math.ceil(totalPages / studyDaysPerWeek);
    
    // 今日から1週間分の日付を生成
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      // 日付をキーとしてフォーマット (YYYY-MM-DD)
      const dateKey = date.toISOString().split('T')[0];
      
      // 学習日数分だけ配分
      if (i < studyDaysPerWeek) {
        distribution[dateKey] = pagesPerDay;
      } else {
        distribution[dateKey] = 0;
      }
    }
    
    return distribution;
  }
} 