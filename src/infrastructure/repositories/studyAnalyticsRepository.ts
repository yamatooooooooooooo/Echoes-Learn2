import { Firestore, collection, getDocs, doc, getDoc, setDoc, deleteDoc, addDoc, updateDoc, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { SubjectPerformance, StudySession } from '../../domain/models/StudyAnalyticsModel';
import { Progress } from '../../domain/models/ProgressModel';

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
    try {
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
        ? Math.round(sessions.reduce((sum, s) => sum + (s.efficiency || 0), 0) / sessionCount) 
        : 0;
      
      // 時間帯ごとの学習時間分布
      const timeOfDayDistribution = sessions.reduce((dist, session) => {
        const timeOfDay = session.timeOfDay || '未指定';
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
    } catch (error) {
      console.error('学習統計の取得中にエラーが発生しました:', error);
      return {
        totalMinutes: 0,
        totalPages: 0,
        sessionCount: 0,
        uniqueSubjects: 0,
        avgEfficiency: 0,
        timeOfDayDistribution: {}
      };
    }
  }

  /**
   * 学習セッションを記録
   */
  async recordStudySession(userId: string, sessionData: Omit<StudySession, 'id' | 'userId' | 'createdAt'>): Promise<string> {
    try {
      console.log('学習セッションを記録中...', userId, sessionData);
      
      // セッションデータを準備
      const newSession = {
        userId,
        ...sessionData,
        createdAt: serverTimestamp()
      };
      
      // Firestoreに保存
      const sessionsRef = collection(this.firestore, 'users', userId, 'study_sessions');
      const docRef = await addDoc(sessionsRef, newSession);
      
      return docRef.id;
    } catch (error) {
      console.error('学習セッションの記録中にエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * 学習セッションデータを取得
   */
  async getStudySessions(userId: string): Promise<StudySession[]> {
    try {
      console.log('学習セッションデータを取得中...', userId);
      
      const sessionsRef = collection(this.firestore, 'users', userId, 'study_sessions');
      const q = query(sessionsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const sessions: StudySession[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        sessions.push({
          id: doc.id,
          userId: data.userId,
          subjectId: data.subjectId,
          subjectName: data.subjectName,
          date: data.date,
          timeOfDay: data.timeOfDay,
          startTime: data.startTime,
          duration: data.duration,
          startPage: data.startPage,
          endPage: data.endPage,
          pagesCompleted: data.pagesCompleted,
          location: data.location,
          environment: data.environment,
          focusLevel: data.focusLevel,
          mood: data.mood,
          efficiency: data.efficiency,
          memo: data.memo,
          createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date()
        } as StudySession);
      });
      
      return sessions;
    } catch (error) {
      console.error('学習セッションデータの取得中にエラーが発生しました:', error);
      return [];
    }
  }

  /**
   * 科目パフォーマンスデータを取得
   */
  async getSubjectPerformances(userId: string): Promise<SubjectPerformance[]> {
    try {
      console.log('科目パフォーマンスデータを取得中...', userId);
      
      const perfRef = collection(this.firestore, 'users', userId, 'subject_performances');
      const q = query(perfRef, orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const performances: SubjectPerformance[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        performances.push({
          id: doc.id,
          userId: data.userId,
          subjectId: data.subjectId,
          name: data.name,
          progress: data.progress,
          efficiency: data.efficiency,
          lastStudied: data.lastStudied,
          recommendedStudyTime: data.recommendedStudyTime,
          studyFrequency: data.studyFrequency,
          strengths: data.strengths || [],
          weaknesses: data.weaknesses || [],
          updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()) : new Date()
        } as SubjectPerformance);
      });
      
      return performances;
    } catch (error) {
      console.error('科目パフォーマンスデータの取得中にエラーが発生しました:', error);
      return [];
    }
  }

  /**
   * 既存のデータから科目パフォーマンスデータを生成
   */
  async generateSubjectPerformancesFromData(
    userId: string, 
    subjects: Array<{ id: string; name: string; currentPage: number; totalPages: number }>,
    progressBySubject: Map<string, Progress[]>
  ): Promise<SubjectPerformance[]> {
    try {
      console.log('科目パフォーマンスデータを生成中...', userId);
      
      // 科目ごとの学習セッションを集計
      const sessions = await this.getStudySessions(userId);
      const sessionsBySubject: Record<string, StudySession[]> = {};
      
      // セッションを科目ごとに分類
      sessions.forEach(session => {
        if (!sessionsBySubject[session.subjectId]) {
          sessionsBySubject[session.subjectId] = [];
        }
        sessionsBySubject[session.subjectId].push(session);
      });
      
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
    } catch (error) {
      console.error('科目パフォーマンスデータの生成中にエラーが発生しました:', error);
      return [];
    }
  }

  /**
   * 科目パフォーマンスデータを更新
   */
  async updateSubjectPerformance(performance: SubjectPerformance): Promise<void> {
    try {
      console.log('科目パフォーマンスデータを更新中...', performance.subjectId);
      
      if (!performance.userId) {
        console.warn('ユーザーIDが指定されていません');
        return;
      }

      if (!performance.id) {
        console.log('IDが指定されていないため、新規ドキュメントとして保存します');
        // IDがないので新規ドキュメントとして追加
        const perfRef = collection(this.firestore, 'users', performance.userId, 'subject_performances');
        const docRef = await addDoc(perfRef, {
          ...performance,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log('新規パフォーマンスデータを作成しました:', docRef.id);
        return;
      }
      
      // 実際の実装ではFirestoreに保存
      const perfRef = collection(this.firestore, 'users', performance.userId, 'subject_performances');
      const docRef = doc(perfRef, performance.id);
      await setDoc(docRef, {
        ...performance,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('パフォーマンスデータの更新中にエラーが発生しました:', error);
      throw error;
    }
  }
  
  /**
   * 特定の学習セッションを取得
   */
  async getStudySession(sessionId: string): Promise<StudySession | null> {
    console.log('学習セッションを取得中...', sessionId);
    const sessionsRef = collection(this.firestore, 'users', 'current-user', 'study_sessions');
    const q = query(sessionsRef, where('id', '==', sessionId));
    const snapshot = await getDocs(q);
    
    const sessions: StudySession[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      sessions.push({
        id: data.id,
        userId: data.userId,
        subjectId: data.subjectId,
        subjectName: data.subjectName,
        date: data.date,
        timeOfDay: data.timeOfDay,
        startTime: data.startTime,
        duration: data.duration,
        startPage: data.startPage,
        endPage: data.endPage,
        pagesCompleted: data.pagesCompleted,
        location: data.location,
        environment: data.environment,
        focusLevel: data.focusLevel,
        mood: data.mood,
        efficiency: data.efficiency,
        memo: data.memo,
        createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date()
      } as StudySession);
    });
    
    return sessions.length > 0 ? sessions[0] : null;
  }
  
  /**
   * 学習セッションを更新
   */
  async updateStudySession(sessionId: string, sessionData: Partial<StudySession>): Promise<void> {
    console.log('学習セッションを更新中...', sessionId, sessionData);
    
    const sessionsRef = collection(this.firestore, 'users', 'current-user', 'study_sessions');
    const docRef = doc(sessionsRef, sessionId);
    await setDoc(docRef, {
      ...sessionData,
      updatedAt: serverTimestamp()
    });
  }
  
  /**
   * 学習セッションを削除
   */
  async deleteStudySession(sessionId: string): Promise<void> {
    console.log('学習セッションを削除中...', sessionId);
    
    const sessionsRef = collection(this.firestore, 'users', 'current-user', 'study_sessions');
    const docRef = doc(sessionsRef, sessionId);
    await deleteDoc(docRef);
  }
}

// エクスポート用のインスタンス
export const studyAnalyticsRepository = new StudyAnalyticsRepository({} as Firestore, {} as Auth); 