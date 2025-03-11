import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { SubjectPerformance, StudySession } from '../../domain/models/StudyAnalyticsModel';
import { Progress } from '../../domain/models/ProgressModel';

// モックデータ - 学習セッション
const MOCK_STUDY_SESSIONS: StudySession[] = [
  {
    id: 'session-1',
    userId: 'current-user',
    subjectId: 'subject-1',
    subjectName: '情報処理概論',
    date: new Date().toISOString().split('T')[0], // 今日
    timeOfDay: '午後 (12-17時)',
    startTime: '14:30',
    duration: 90, // 90分
    startPage: 100,
    endPage: 120,
    pagesCompleted: 20,
    location: '図書館',
    environment: '静かな環境',
    focusLevel: 4,
    mood: 3,
    efficiency: 80,
    memo: '今日は集中できた。次回は第7章から。',
    createdAt: new Date()
  },
  {
    id: 'session-2',
    userId: 'current-user',
    subjectId: 'subject-2',
    subjectName: 'データベース設計',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 昨日
    timeOfDay: '夕方 (17-20時)',
    startTime: '18:00',
    duration: 60, // 60分
    startPage: 70,
    endPage: 80,
    pagesCompleted: 10,
    location: '自宅',
    environment: 'BGMあり',
    focusLevel: 3,
    mood: 4,
    efficiency: 65,
    memo: 'SQLの部分は少し難しかった。復習が必要。',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'session-3',
    userId: 'current-user',
    subjectId: 'subject-3',
    subjectName: 'アルゴリズムとデータ構造',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 一昨日
    timeOfDay: '朝 (5-9時)',
    startTime: '08:00',
    duration: 45, // 45分
    startPage: 50,
    endPage: 60,
    pagesCompleted: 10,
    location: 'カフェ',
    environment: 'カフェ・公共施設',
    focusLevel: 5,
    mood: 5,
    efficiency: 90,
    memo: '朝の勉強は効率が良い。数学的な内容は朝やると理解しやすい。',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  }
];

// モックデータ - 科目パフォーマンス
const MOCK_SUBJECT_PERFORMANCES: SubjectPerformance[] = [
  {
    id: 'perf-1',
    userId: 'current-user',
    subjectId: 'subject-1',
    name: '情報処理概論',
    progress: 34.2,
    efficiency: 78,
    lastStudied: new Date().toISOString().split('T')[0],
    recommendedStudyTime: 60,
    studyFrequency: 3,
    strengths: ['基礎概念', 'ネットワーク'],
    weaknesses: ['アルゴリズム', 'データベース'],
    updatedAt: new Date()
  },
  {
    id: 'perf-2',
    userId: 'current-user',
    subjectId: 'subject-2',
    name: 'データベース設計',
    progress: 36.3,
    efficiency: 65,
    lastStudied: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recommendedStudyTime: 45,
    studyFrequency: 2,
    strengths: ['テーブル設計', 'SQL基礎'],
    weaknesses: ['正規化', 'パフォーマンス最適化'],
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'perf-3',
    userId: 'current-user',
    subjectId: 'subject-3',
    name: 'アルゴリズムとデータ構造',
    progress: 21.4,
    efficiency: 85,
    lastStudied: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recommendedStudyTime: 75,
    studyFrequency: 4,
    strengths: ['配列操作', 'スタックとキュー'],
    weaknesses: ['グラフアルゴリズム', '動的計画法'],
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  }
];

/**
 * 学習分析データを管理するリポジトリ
 */
export class StudyAnalyticsRepository {
  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {}

  /**
   * 学習統計を取得
   */
  async getStudyStatistics(userId: string): Promise<any> {
    console.log('学習統計を取得中...', userId);
    const sessions = await this.getStudySessions(userId);
    
    // 合計学習時間を計算
    const totalMinutes = sessions.reduce((sum, session) => sum + session.duration, 0);
    
    // 合計学習ページ数を計算
    const totalPages = sessions.reduce((sum, session) => sum + session.pagesCompleted, 0);
    
    // 学習回数
    const sessionCount = sessions.length;
    
    // 学習科目数（ユニークな科目ID）
    const uniqueSubjects = new Set(sessions.map(s => s.subjectId)).size;
    
    // 平均効率
    const avgEfficiency = sessionCount > 0 
      ? Math.round(sessions.reduce((sum, s) => sum + s.efficiency, 0) / sessionCount) 
      : 0;
    
    // 時間帯ごとの学習時間分布
    const timeOfDayDistribution = sessions.reduce((dist, session) => {
      const timeOfDay = session.timeOfDay;
      dist[timeOfDay] = (dist[timeOfDay] || 0) + session.duration;
      return dist;
    }, {} as Record<string, number>);
    
    return {
      totalMinutes,
      totalPages,
      sessionCount,
      uniqueSubjects,
      avgEfficiency,
      timeOfDayDistribution
    };
  }

  /**
   * 学習セッションを記録
   */
  async recordStudySession(userId: string, sessionData: Omit<StudySession, 'id' | 'userId' | 'createdAt'>): Promise<string> {
    console.log('学習セッションを記録中...', userId, sessionData);
    
    // 新しいセッションID生成
    const newId = `session-${Date.now()}`;
    
    // モックデータに追加（実際はFirestoreに保存）
    const newSession: StudySession = {
      id: newId,
      userId,
      ...sessionData,
      createdAt: new Date()
    };
    
    // 実際の実装ではデータを永続化
    MOCK_STUDY_SESSIONS.unshift(newSession);
    
    return newId;
  }

  /**
   * 学習セッションデータを取得
   */
  async getStudySessions(userId: string): Promise<StudySession[]> {
    console.log('学習セッションデータを取得中...', userId);
    // モックデータをフィルタリング
    return MOCK_STUDY_SESSIONS.filter(session => session.userId === userId);
  }

  /**
   * 科目パフォーマンスデータを取得
   */
  async getSubjectPerformances(userId: string): Promise<SubjectPerformance[]> {
    console.log('科目パフォーマンスデータを取得中...', userId);
    // モックデータをフィルタリング
    return MOCK_SUBJECT_PERFORMANCES.filter(perf => perf.userId === userId);
  }

  /**
   * 既存のデータから科目パフォーマンスデータを生成
   */
  async generateSubjectPerformancesFromData(
    userId: string, 
    subjects: Array<{ id: string; name: string; currentPage: number; totalPages: number }>,
    progressBySubject: Map<string, Progress[]>
  ): Promise<SubjectPerformance[]> {
    console.log('科目パフォーマンスデータを生成中...', userId);
    
    // 科目ごとの学習セッションを集計
    const sessionsBySubject = MOCK_STUDY_SESSIONS
      .filter(s => s.userId === userId)
      .reduce((acc, session) => {
        if (!acc[session.subjectId]) acc[session.subjectId] = [];
        acc[session.subjectId].push(session);
        return acc;
      }, {} as Record<string, StudySession[]>);
    
    const performances: SubjectPerformance[] = subjects.map(subject => {
      const progress = subject.currentPage / subject.totalPages * 100;
      const subjectSessions = sessionsBySubject[subject.id] || [];
      
      // 効率を計算（セッションがある場合は平均、ない場合はランダム）
      const efficiency = subjectSessions.length > 0
        ? Math.round(subjectSessions.reduce((sum, s) => sum + s.efficiency, 0) / subjectSessions.length)
        : Math.floor(60 + Math.random() * 30); // 60-90のランダム値
      
      // 最後に学習した日付
      const lastStudied = subjectSessions.length > 0
        ? subjectSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
        : new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // 推奨学習時間（ランダム）
      const recommendedStudyTime = Math.floor(30 + Math.random() * 60); // 30-90分
      
      // 週あたりの推奨頻度（ランダム）
      const studyFrequency = Math.floor(1 + Math.random() * 4); // 1-5回
      
      // 強みと弱み（仮のデータ）
      const strengths = ['基礎理解', '応用力', '記憶力', '問題解決能力', '集中力'].slice(0, 1 + Math.floor(Math.random() * 2));
      const weaknesses = ['時間管理', '長文読解', '応用問題', '抽象概念', '定義の暗記'].slice(0, 1 + Math.floor(Math.random() * 2));
      
      return {
        userId,
        subjectId: subject.id,
        name: subject.name,
        progress,
        efficiency,
        lastStudied,
        recommendedStudyTime,
        studyFrequency,
        strengths,
        weaknesses,
        updatedAt: new Date()
      };
    });
    
    return performances;
  }

  /**
   * 科目パフォーマンスデータを更新
   */
  async updateSubjectPerformance(performance: SubjectPerformance): Promise<void> {
    console.log('科目パフォーマンスデータを更新中...', performance.subjectId);
    
    // モックデータの更新（実際はFirestoreに保存）
    const index = MOCK_SUBJECT_PERFORMANCES.findIndex(p => p.id === performance.id);
    if (index !== -1) {
      MOCK_SUBJECT_PERFORMANCES[index] = {
        ...performance,
        updatedAt: new Date()
      };
    } else {
      MOCK_SUBJECT_PERFORMANCES.push({
        id: `perf-${Date.now()}`,
        ...performance,
        updatedAt: new Date()
      });
    }
  }
  
  /**
   * 特定の学習セッションを取得
   */
  async getStudySession(sessionId: string): Promise<StudySession | null> {
    console.log('学習セッションを取得中...', sessionId);
    return MOCK_STUDY_SESSIONS.find(s => s.id === sessionId) || null;
  }
  
  /**
   * 学習セッションを更新
   */
  async updateStudySession(sessionId: string, sessionData: Partial<StudySession>): Promise<void> {
    console.log('学習セッションを更新中...', sessionId, sessionData);
    
    const index = MOCK_STUDY_SESSIONS.findIndex(s => s.id === sessionId);
    if (index !== -1) {
      MOCK_STUDY_SESSIONS[index] = {
        ...MOCK_STUDY_SESSIONS[index],
        ...sessionData
      };
    }
  }
  
  /**
   * 学習セッションを削除
   */
  async deleteStudySession(sessionId: string): Promise<void> {
    console.log('学習セッションを削除中...', sessionId);
    
    const index = MOCK_STUDY_SESSIONS.findIndex(s => s.id === sessionId);
    if (index !== -1) {
      MOCK_STUDY_SESSIONS.splice(index, 1);
    }
  }
}

// エクスポート用のインスタンス
export const studyAnalyticsRepository = new StudyAnalyticsRepository({} as Firestore, {} as Auth); 