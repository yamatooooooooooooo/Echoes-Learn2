import { useState, useEffect, useCallback } from 'react';
import { SubjectRepository } from '../../../../infrastructure/repositories/subjectRepository';
import { ProgressRepository } from '../../../../infrastructure/repositories/progressRepository';
import { Progress } from '../../../../domain/models/ProgressModel';
import { StudyAnalyticsRepository } from '../../../../infrastructure/repositories/studyAnalyticsRepository';
import { StudySession, SubjectPerformance } from '../../../../domain/models/StudyAnalyticsModel';
import { useFirebase } from '../../../../contexts/FirebaseContext';
import { onAuthStateChanged } from 'firebase/auth';
import { Subject } from '../../../../domain/models/SubjectModel';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useServices } from '../../../../hooks/useServices';
import { useAuth } from '../../../../contexts/AuthContext';
import { RadarChartData } from '../../../../domain/services/visualizationService';

// インターフェースの定義
interface RecentProgress extends Progress {
  subjectName: string;
}

interface DailyProgressData {
  date: string;
  pagesRead: number;
  progressRate: number;
}

// 試験データのインターフェース
interface ExamData {
  subjectId: string;
  subjectName: string;
  examDate: string | Date;
  reportDeadline?: string | Date;
  remainingDays: number;
  completion: number;
}

export interface DashboardData {
  totalSubjects: number;
  completedSubjects: number;
  totalPages: number;
  completedPages: number;
  upcomingExams: ExamData[];
  recentProgress: RecentProgress[];
  inProgressSubjects: number;
  notStartedSubjects: number;
  weeklyProgressData: DailyProgressData[];
  studySessions: StudySession[];
  subjectPerformances: SubjectPerformance[];
  subjects: Subject[];
  radarChartData: RadarChartData[];
}

export const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { firestore, auth } = useFirebase();
  const { subjectRepository, progressRepository } = useServices();
  const { currentUser } = useAuth();

  // 日付フォーマット関数
  const formatDate = useCallback((date: Date | string | undefined): string => {
    if (!date) return '未設定';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // 無効な日付の場合
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      
      return dateObj.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('日付のフォーマットエラー:', error);
      return 'Invalid Date';
    }
  }, []);

  // 過去7日間の日付を生成
  const generateLast7Days = useCallback((): Date[] => {
    const dates: Date[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      // 時間部分をリセット（00:00:00）
      date.setHours(0, 0, 0, 0);
      dates.push(date);
    }
    
    return dates;
  }, []);

  // 日付を文字列形式にフォーマット
  const formatDateToString = useCallback((date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }, []);

  // ダッシュボードデータを読み込む
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Firebase認証からのユーザーID取得
      const currentUser = auth.currentUser;
      const userId = currentUser?.uid;
      
      if (!userId) {
        setError("認証されていません。再度ログインしてください。");
        setIsLoading(false);
        return;
      }
      
      // リポジトリの初期化（実際のFirebaseインスタンスを使用）
      const subjectRepository = new SubjectRepository(firestore, auth);
      const progressRepository = new ProgressRepository(firestore, auth);
      const studyAnalyticsRepository = new StudyAnalyticsRepository(firestore, auth);
      
      // 全ての科目を取得
      const subjects = await subjectRepository.getAllSubjects(userId);
      
      // データが存在しないかどうかのチェック
      if (!Array.isArray(subjects)) {
        setDashboardData({
          totalSubjects: 0,
          completedSubjects: 0,
          totalPages: 0,
          completedPages: 0,
          upcomingExams: [],
          recentProgress: [],
          inProgressSubjects: 0,
          notStartedSubjects: 0,
          weeklyProgressData: [],
          studySessions: [],
          subjectPerformances: [],
          subjects: [],
          radarChartData: []
        });
        setIsLoading(false);
        return;
      }
      
      // 科目の状態をカウント
      let completedSubjects = 0;
      let inProgressSubjects = 0;
      let notStartedSubjects = 0;
      
      subjects.forEach(subject => {
        if (subject.currentPage === 0) {
          notStartedSubjects++;
        } else if (subject.currentPage >= subject.totalPages) {
          completedSubjects++;
        } else {
          inProgressSubjects++;
        }
      });
      
      // ページ数を集計
      const totalPages = subjects.reduce((sum, s) => sum + (s.totalPages || 0), 0);
      const completedPages = subjects.reduce((sum, s) => sum + (s.currentPage || 0), 0);
      
      // 今後の試験の取得
      let upcomingExams: ExamData[] = [];
      try {
        // 科目データのログを出力して確認
        console.log('Dashboard subjects for exams:', subjects);
        
        upcomingExams = subjects
          .filter(s => {
            // 試験日が設定されているかつ有効な日付のみを抽出
            if (!s.examDate) {
              console.log(`Subject ${s.id} (${s.name}) has no exam date`);
              return false;
            }
            
            try {
              const examDate = new Date(s.examDate);
              // 無効な日付またはNaNの場合はfalseを返す
              if (isNaN(examDate.getTime())) {
                console.log(`Subject ${s.id} (${s.name}) has invalid exam date: ${s.examDate}`);
                return false;
              }
              // 未来の日付のみ抽出
              const isUpcoming = examDate > new Date();
              if (!isUpcoming) {
                console.log(`Subject ${s.id} (${s.name}) has past exam date: ${examDate.toISOString()}`);
              }
              return isUpcoming;
            } catch (error) {
              console.error(`Error processing exam date for subject ${s.id} (${s.name}):`, error);
              return false;
            }
          })
          .sort((a, b) => {
            const dateA = new Date(a.examDate || new Date()).getTime();
            const dateB = new Date(b.examDate || new Date()).getTime();
            return dateA - dateB;
          })
          .map(s => {
            // 文字列として確実に扱うために型変換
            const examDateStr = typeof s.examDate === 'string' 
              ? s.examDate 
              : (s.examDate as Date).toISOString();
            
            const examDate = new Date(examDateStr);
            const remainingDays = Math.ceil(
              (examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );
            
            return {
              subjectId: s.id,
              subjectName: s.name,
              examDate: s.examDate,
              reportDeadline: s.reportDeadline,
              remainingDays: remainingDays,
              completion: Math.round(((s.currentPage || 0) / (s.totalPages || 1)) * 100)
            };
          });
        
        console.log('Upcoming exams after processing:', upcomingExams);
      } catch (error) {
        console.error('試験データの処理中にエラーが発生しました:', error);
        upcomingExams = [];
      }
      
      // 最近の進捗履歴
      let allProgress: Progress[] = [];
      try {
        // 全ての進捗を取得し、クライアント側でソート
        allProgress = await progressRepository.getAllProgress(auth.currentUser?.uid || '');
        // 日付でソートして最新10件を取得
        allProgress = allProgress
          .sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime())
          .slice(0, 10);
      } catch (error) {
        console.error('進捗データの取得中にエラーが発生しました:', error);
        allProgress = [];
      }
      
      // 最新の進捗ログを取得
      let recentProgress: RecentProgress[] = [];
      try {
        recentProgress = allProgress
          .map(p => {
            // 対応する科目を検索
            const subject = subjects.find(s => s.id === p.subjectId);
            
            return {
              ...p,
              subjectName: subject ? subject.name : `[ID: ${p.subjectId?.substring(0, 6) || 'unknown'}...]`
            };
          });
      } catch (error) {
        console.error('最近の進捗データの処理中にエラーが発生しました:', error);
        recentProgress = [];
      }
      
      // 週間進捗データの生成
      const last7Days = generateLast7Days();
      let weeklyProgressData: DailyProgressData[] = [];
      
      try {
        // 日付ごとの読了ページ
        const progressByDate: {[key: string]: number} = {};
        
        // 日付ごとの総ページを計算
        for (const p of allProgress) {
          const date = typeof p.recordDate === 'string' ? p.recordDate : formatDateToString(new Date(p.recordDate));
          if (date) {
            progressByDate[date] = (progressByDate[date] || 0) + (p.pagesRead || 0);
          }
        }
        
        // 過去7日間のデータを作成
        for (const dateObj of last7Days) {
          const dateStr = formatDateToString(dateObj);
          const pagesRead = progressByDate[dateStr] || 0;
          const progressRate = totalPages > 0 
            ? Math.min(100, Math.round((pagesRead / totalPages) * 100)) 
            : 0;
          
          weeklyProgressData.push({
            date: dateStr,
            pagesRead,
            progressRate
          });
        }
      } catch (error) {
        console.error('週間進捗データの処理中にエラーが発生しました:', error);
        weeklyProgressData = last7Days.map(dateObj => ({
          date: formatDateToString(dateObj),
          pagesRead: 0,
          progressRate: 0
        }));
      }
      
      // 学習統計データを取得
      let studySessions: StudySession[] = [];
      let subjectPerformances: SubjectPerformance[] = [];
      
      try {
        // 学習セッションデータの取得
        studySessions = await studyAnalyticsRepository.getStudySessions(userId);
        // 科目パフォーマンスデータの取得
        subjectPerformances = await studyAnalyticsRepository.getSubjectPerformances(userId);
        
        // データが少なすぎる場合は既存データから生成
        if (subjectPerformances.length < subjects.length) {
          try {
            // 科目ごとの進捗データマップを作成
            const progressBySubject = new Map<string, Progress[]>();
            
            for (const subject of subjects) {
              try {
                const subjectProgress = await progressRepository.getSubjectProgress(
                  auth.currentUser?.uid || '',
                  subject.id
                );
                progressBySubject.set(subject.id, subjectProgress);
              } catch (err) {
                console.error(`科目(${subject.id})の進捗データ取得エラー:`, err);
                progressBySubject.set(subject.id, []);
              }
            }
            
            // 科目パフォーマンスデータを生成
            const generatedPerformances = await studyAnalyticsRepository.generateSubjectPerformancesFromData(
              userId,
              subjects.map(s => ({ 
                id: s.id, 
                name: s.name, 
                currentPage: s.currentPage || 0, 
                totalPages: s.totalPages || 1 
              })),
              progressBySubject
            );
            
            // 各科目のパフォーマンスデータを保存または更新
            for (const performance of generatedPerformances) {
              try {
                await studyAnalyticsRepository.updateSubjectPerformance(performance);
              } catch (err) {
                console.error(`パフォーマンスデータ更新エラー(${performance.subjectId}):`, err);
              }
            }
            
            // 最新データを再取得
            try {
              const updatedPerformances = await studyAnalyticsRepository.getSubjectPerformances(userId);
              if (Array.isArray(updatedPerformances) && updatedPerformances.length > 0) {
                subjectPerformances = updatedPerformances;
              }
            } catch (err) {
              console.error('更新後のパフォーマンスデータ取得エラー:', err);
            }
          } catch (generateError) {
            console.error('パフォーマンスデータ生成中にエラー:', generateError);
          }
        }
      } catch (error) {
        console.error('学習分析データの取得または生成中にエラー:', error);
        // エラーが発生してもダッシュボード全体の表示を妨げないために空配列をセット
        studySessions = [];
        subjectPerformances = [];
      }
      
      // レーダーチャートデータの生成
      const radarChartData = subjects
        .filter(subject => {
          const examDate = new Date(subject.examDate);
          const today = new Date();
          return examDate >= today && subject.currentPage < subject.totalPages;
        })
        .map(subject => ({
          subject: subject.name,
          progress: calculateProgress(subject)
        }));
      
      // ダッシュボードデータの設定
      setDashboardData({
        totalSubjects: subjects.length,
        completedSubjects,
        totalPages,
        completedPages,
        upcomingExams,
        recentProgress,
        inProgressSubjects,
        notStartedSubjects,
        weeklyProgressData,
        studySessions,
        subjectPerformances,
        subjects,
        radarChartData
      });
      
    } catch (error) {
      console.error('ダッシュボードデータの取得に失敗しました', error);
      setError('データの取得中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  }, [formatDateToString, generateLast7Days, firestore, auth, subjectRepository, progressRepository]);

  // コンポーネントマウント時にAuthの状態を監視してデータを読み込む
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadDashboardData();
      } else {
        setError("認証されていません。ログインしてください。");
        setIsLoading(false);
      }
    });
    
    // クリーンアップ関数
    return () => unsubscribe();
  }, [auth, loadDashboardData]);

  // データ更新関数
  const refreshData = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return { dashboardData, isLoading, error, formatDate, refreshData };
};

// 進捗率を計算するヘルパー関数
const calculateProgress = (subject: Subject): number => {
  if (!subject.totalPages || subject.totalPages <= 0) {
    return 0;
  }
  
  const currentPage = subject.currentPage || 0;
  const progress = Math.round((currentPage / subject.totalPages) * 100);
  
  return Math.max(0, Math.min(100, progress));
}; 