import {
  differenceInDays,
  format,
  startOfDay,
  isSameDay,
  isWithinInterval,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ja } from 'date-fns/locale';

interface UserData {
  examDate: Date | null;
  daysPerWeek: number | null;
  hoursPerDay: number | null;
  parallelSubjects: number | null;
  bufferDays: number | null;
}

interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  totalTasks: number;
  completedTasks: number;
  averageTaskTime: number | null; // 各タスク完了にかかる平均時間(分)
}

interface DailyProgress {
  subjectId: string;
  subjectName: string;
  taskProgress: number; // 0-100 (%)
  timeProgress: number; // 0-100 (%)
}

interface WeeklyProgress {
  subjectId: string;
  subjectName: string;
  taskProgress: number; // 0-100 (%)
  timeProgress: number; // 0-100 (%)
}

// デイリーノルマとウィークリーノルマを計算する関数
export const calculateNorma = (
  userData: UserData,
  subjectProgress: SubjectProgress[],
  dailyLearningData: {
    subjectId: string;
    completedTasks: number;
    learningTime: number;
    date: Date;
  }[], // 今日の学習データ
  weeklyLearningData: {
    subjectId: string;
    completedTasks: number;
    learningTime: number;
    date: Date;
  }[] // 今週の学習データ
) => {
  // 0. 前提条件の確認
  if (
    !userData.examDate ||
    !userData.daysPerWeek ||
    !userData.hoursPerDay ||
    !userData.parallelSubjects
  ) {
    return null; // 情報が不足している場合は null を返す
  }

  // この時点で全ての必須値がnullでないことが確認されているため、以下でnon-null assertion（!）を使用

  // 1. 試験日までの残り日数を計算
  const today = startOfDay(new Date());
  const examDate = startOfDay(userData.examDate);
  const daysUntilExam = differenceInDays(examDate, today);

  // 2. バッファを考慮した残り日数を計算
  const effectiveDaysLeft = Math.max(0, daysUntilExam - (userData.bufferDays || 0));

  // 3. 各科目の残タスク数を計算
  const remainingTasksBySubject = subjectProgress.map((subject) => ({
    subjectId: subject.subjectId,
    subjectName: subject.subjectName,
    remainingTasks: Math.max(0, subject.totalTasks - subject.completedTasks), // 残タスク数が負の値にならないように
  }));

  // 4. 各科目の1日あたりのタスク数ノルマを計算 (均等配分)
  // - 残り日数が0の場合は、残タスク数をノルマとする
  const dailyTaskNormaBySubject = remainingTasksBySubject.map((subject) => ({
    subjectId: subject.subjectId,
    subjectName: subject.subjectName,
    dailyTaskNorma:
      effectiveDaysLeft === 0
        ? subject.remainingTasks
        : Math.max(
            0,
            Math.ceil(subject.remainingTasks / effectiveDaysLeft / userData.parallelSubjects!)
          ), // 0で割ることを避ける
  }));

  // 5. 各科目の1週間あたりのタスク数ノルマを計算
  const weeklyTaskNormaBySubject = remainingTasksBySubject.map((subject) => ({
    subjectId: subject.subjectId,
    subjectName: subject.subjectName,
    weeklyTaskNorma:
      effectiveDaysLeft === 0
        ? subject.remainingTasks
        : Math.max(
            0,
            Math.ceil(
              ((subject.remainingTasks / effectiveDaysLeft) * userData.daysPerWeek!) /
                userData.parallelSubjects!
            )
          ),
  }));

  // 6. 各科目の1日あたりの学習時間のノルマを計算(分)
  const dailyTimeNormaBySubject = dailyTaskNormaBySubject.map((subject) => ({
    subjectId: subject.subjectId,
    subjectName: subject.subjectName,
    dailyTimeNorma: Math.max(0, (userData.hoursPerDay! * 60) / userData.parallelSubjects!),
  }));

  // 7. 各科目の1週間の学習時間のノルマを計算(分)
  const weeklyTimeNormaBySubject = weeklyTaskNormaBySubject.map((subject) => ({
    subjectId: subject.subjectId,
    subjectName: subject.subjectName,
    weeklyTimeNorma: Math.max(
      0,
      (userData.hoursPerDay! * userData.daysPerWeek! * 60) / userData.parallelSubjects!
    ),
  }));

  // 8. 今日の日付と曜日を取得
  const todayFormatted = format(today, 'yyyy-MM-dd (E)', { locale: ja });

  // 9. 今日のタスク進捗を計算
  const todayTaskProgress: DailyProgress[] = dailyTaskNormaBySubject.map((norma) => {
    const completedToday = dailyLearningData
      .filter((data) => data.subjectId === norma.subjectId)
      .reduce((sum, data) => sum + data.completedTasks, 0);
    return {
      subjectId: norma.subjectId,
      subjectName: norma.subjectName,
      taskProgress:
        norma.dailyTaskNorma === 0
          ? 100
          : Math.min(100, Math.round((completedToday / norma.dailyTaskNorma) * 100)),
      timeProgress: 0, // 一時的に0を設定（後で更新）
    };
  });

  // 10. 今日の学習時間進捗を計算
  const todayTimeProgress: DailyProgress[] = dailyTimeNormaBySubject.map((norma) => {
    const timeToday = dailyLearningData
      .filter((data) => data.subjectId === norma.subjectId)
      .reduce((sum, data) => sum + data.learningTime, 0);
    return {
      subjectId: norma.subjectId,
      subjectName: norma.subjectName,
      taskProgress: 0, // 一時的に0を設定（後で統合）
      timeProgress:
        norma.dailyTimeNorma === 0
          ? 100
          : Math.min(100, Math.round((timeToday / norma.dailyTimeNorma) * 100)),
    };
  });

  // 学習時間進捗とタスク進捗の統合
  const todayProgress: DailyProgress[] = todayTaskProgress.map((taskProg, index) => ({
    subjectId: taskProg.subjectId,
    subjectName: taskProg.subjectName,
    taskProgress: taskProg.taskProgress,
    timeProgress: todayTimeProgress[index].timeProgress,
  }));

  // 11. 今週のタスク進捗を計算
  const weekTaskProgress: WeeklyProgress[] = weeklyTaskNormaBySubject.map((norma) => {
    const completedThisWeek = weeklyLearningData
      .filter((data) => data.subjectId === norma.subjectId)
      .reduce((sum, data) => sum + data.completedTasks, 0);
    return {
      subjectId: norma.subjectId,
      subjectName: norma.subjectName,
      taskProgress:
        norma.weeklyTaskNorma === 0
          ? 100
          : Math.min(100, Math.round((completedThisWeek / norma.weeklyTaskNorma) * 100)),
      timeProgress: 0, // 一時的に0を設定（後で統合）
    };
  });

  // 12. 今週の学習時間進捗を計算
  const weekTimeProgress: WeeklyProgress[] = weeklyTimeNormaBySubject.map((norma) => {
    const timeThisWeek = weeklyLearningData
      .filter((data) => data.subjectId === norma.subjectId)
      .reduce((sum, data) => sum + data.learningTime, 0);
    return {
      subjectId: norma.subjectId,
      subjectName: norma.subjectName,
      taskProgress: 0, // 一時的に0を設定（後で統合）
      timeProgress:
        norma.weeklyTimeNorma === 0
          ? 100
          : Math.min(100, Math.round((timeThisWeek / norma.weeklyTimeNorma) * 100)),
    };
  });

  // 今週の学習時間進捗とタスク進捗の統合
  const weekProgress: WeeklyProgress[] = weekTaskProgress.map((taskProg, index) => ({
    subjectId: taskProg.subjectId,
    subjectName: taskProg.subjectName,
    taskProgress: taskProg.taskProgress,
    timeProgress: weekTimeProgress[index].timeProgress,
  }));

  return {
    daysUntilExam,
    effectiveDaysLeft,
    dailyTaskNormaBySubject,
    weeklyTaskNormaBySubject,
    today: todayFormatted,
    dailyTimeNormaBySubject,
    weeklyTimeNormaBySubject,
    todayTaskProgress: todayProgress, // 今日のタスク進捗
    todayTimeProgress: todayProgress, // 今日の学習時間進捗（同じ配列を使用、実際には使用しない）
    weekTaskProgress: weekProgress, // 今週のタスク進捗
    weekTimeProgress: weekProgress, // 今週の学習時間進捗（同じ配列を使用、実際には使用しない）
  };
};
