import React, { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress, Grid, Paper, CircularProgress } from '@mui/material';
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { calculateNorma } from '../utils/normaCalculator';
import { startOfWeek, endOfWeek, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { ja } from 'date-fns/locale';

interface NormaDisplayProps {
  userId: string;
}

const NormaDisplay: React.FC<NormaDisplayProps> = ({ userId }) => {
  const [userData, setUserData] = useState<any>(null);
  const [subjectProgress, setSubjectProgress] = useState<any[]>([]);
  const [dailyLearningData, setDailyLearningData] = useState<any[]>([]);
  const [weeklyLearningData, setWeeklyLearningData] = useState<any[]>([]);
  const [normaData, setNormaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. ユーザーデータの取得
        const userDocRef = doc(firestore, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          throw new Error('ユーザーデータが見つかりません');
        }

        const userData = userDocSnap.data();

        // 必要なデータを適切な型に変換
        const userDataForNorma = {
          examDate: userData.goals?.examDate?.toDate() || null,
          daysPerWeek: userData.goals?.daysPerWeek || null,
          hoursPerDay: userData.goals?.hoursPerDay || null,
          parallelSubjects: userData.goals?.parallelSubjects || null,
          bufferDays: userData.goals?.bufferDays || null,
        };

        // 2. 科目進捗データの取得
        const subjectsCollectionRef = collection(firestore, 'users', userId, 'subjects');
        const subjectsSnapshot = await getDocs(subjectsCollectionRef);

        const subjectsData = subjectsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            subjectId: doc.id,
            subjectName: data.name,
            totalTasks: data.totalTasks || 0,
            completedTasks: data.completedTasks || 0,
            averageTaskTime: data.averageTaskTime || null,
          };
        });

        // 3. 今日の学習データを取得
        const today = new Date();
        const startOfToday = startOfDay(today);
        const endOfToday = endOfDay(today);

        const progressRecordsRef = collection(firestore, 'users', userId, 'progressRecords');
        const todayQuery = query(
          progressRecordsRef,
          where('timestamp', '>=', Timestamp.fromDate(startOfToday)),
          where('timestamp', '<=', Timestamp.fromDate(endOfToday))
        );

        const todayRecordsSnapshot = await getDocs(todayQuery);

        const todayRecords = todayRecordsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            subjectId: data.subjectId,
            completedTasks: data.completedTasks || 0,
            learningTime: data.learningTime || 0,
            date: data.timestamp.toDate(),
          };
        });

        // 4. 今週の学習データを取得
        const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // 月曜始まり
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

        const weekQuery = query(
          progressRecordsRef,
          where('timestamp', '>=', Timestamp.fromDate(weekStart)),
          where('timestamp', '<=', Timestamp.fromDate(weekEnd))
        );

        const weekRecordsSnapshot = await getDocs(weekQuery);

        const weekRecords = weekRecordsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            subjectId: data.subjectId,
            completedTasks: data.completedTasks || 0,
            learningTime: data.learningTime || 0,
            date: data.timestamp.toDate(),
          };
        });

        setUserData(userDataForNorma);
        setSubjectProgress(subjectsData);
        setDailyLearningData(todayRecords);
        setWeeklyLearningData(weekRecords);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  useEffect(() => {
    if (userData && subjectProgress && dailyLearningData && weeklyLearningData) {
      const calculatedNormaData = calculateNorma(
        userData,
        subjectProgress,
        dailyLearningData,
        weeklyLearningData
      );
      setNormaData(calculatedNormaData);
    }
  }, [userData, subjectProgress, dailyLearningData, weeklyLearningData]);

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">エラー: {error}</Typography>
      </Box>
    );
  }

  if (!normaData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>ノルマの計算に必要な情報が不足しています。</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        学習ノルマ
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        {normaData.today}
      </Typography>

      <Grid container spacing={3}>
        {/* デイリーノルマ */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: '#fff',
              borderRadius: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              今日のノルマ
            </Typography>

            {/* タスク進捗 (全体) */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body1" sx={{ mr: 1 }}>
                タスク進捗:
              </Typography>
              <LinearProgress
                variant="determinate"
                value={
                  normaData.dailyTaskNormaBySubject.reduce(
                    (sum: number, sub: any) => sum + sub.dailyTaskNorma,
                    0
                  ) === 0
                    ? 100
                    : Math.min(
                        100,
                        Math.round(
                          normaData.todayTaskProgress.reduce(
                            (sum: number, sub: any) => sum + sub.taskProgress,
                            0
                          ) / normaData.dailyTaskNormaBySubject.length
                        )
                      )
                }
                sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {normaData.dailyTaskNormaBySubject.reduce(
                  (sum: number, sub: any) => sum + sub.dailyTaskNorma,
                  0
                ) === 0
                  ? 100
                  : Math.min(
                      100,
                      Math.round(
                        normaData.todayTaskProgress.reduce(
                          (sum: number, sub: any) => sum + sub.taskProgress,
                          0
                        ) / normaData.dailyTaskNormaBySubject.length
                      )
                    )}
                %
              </Typography>
            </Box>

            {/* 時間進捗 (全体) */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" sx={{ mr: 1 }}>
                学習時間進捗:
              </Typography>
              <LinearProgress
                variant="determinate"
                value={
                  normaData.dailyTimeNormaBySubject.reduce(
                    (sum: number, sub: any) => sum + sub.dailyTimeNorma,
                    0
                  ) === 0
                    ? 100
                    : Math.min(
                        100,
                        Math.round(
                          normaData.todayTimeProgress.reduce(
                            (sum: number, sub: any) => sum + sub.timeProgress,
                            0
                          ) / normaData.dailyTimeNormaBySubject.length
                        )
                      )
                }
                sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
                color="success"
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {normaData.dailyTimeNormaBySubject.reduce(
                  (sum: number, sub: any) => sum + sub.dailyTimeNorma,
                  0
                ) === 0
                  ? 100
                  : Math.min(
                      100,
                      Math.round(
                        normaData.todayTimeProgress.reduce(
                          (sum: number, sub: any) => sum + sub.timeProgress,
                          0
                        ) / normaData.dailyTimeNormaBySubject.length
                      )
                    )}
                %
              </Typography>
            </Box>

            {/* 科目ごとの内訳 */}
            {normaData.dailyTaskNormaBySubject.map((subjectNorma: any, index: number) => (
              <Box
                key={subjectNorma.subjectId}
                sx={{ mb: 1, p: 1, borderRadius: '4px', backgroundColor: '#f9f9f9' }}
              >
                <Typography variant="body2">{subjectNorma.subjectName}:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ mr: 1 }}>
                    タスク: {normaData.todayTaskProgress[index].taskProgress}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={normaData.todayTaskProgress[index].taskProgress}
                    sx={{ flexGrow: 1, height: 8, borderRadius: 4, mr: 1 }}
                  />
                  <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
                    (
                    {dailyLearningData
                      .filter((data) => data.subjectId === subjectNorma.subjectId)
                      .reduce((sum, data) => sum + data.completedTasks, 0)}{' '}
                    / {subjectNorma.dailyTaskNorma})
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ mr: 1 }}>
                    時間: {normaData.todayTimeProgress[index].timeProgress}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={normaData.todayTimeProgress[index].timeProgress}
                    sx={{ flexGrow: 1, height: 8, borderRadius: 4, mr: 1 }}
                    color="success"
                  />
                  <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
                    (
                    {dailyLearningData
                      .filter((data) => data.subjectId === subjectNorma.subjectId)
                      .reduce((sum, data) => sum + data.learningTime, 0)}
                    分 / {subjectNorma.dailyTimeNorma}分)
                  </Typography>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* ウィークリーノルマ */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: '#fff',
              borderRadius: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              今週のノルマ
            </Typography>

            {/* タスク進捗 (全体) */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body1" sx={{ mr: 1 }}>
                タスク進捗:
              </Typography>
              <LinearProgress
                variant="determinate"
                value={
                  normaData.weeklyTaskNormaBySubject.reduce(
                    (sum: number, sub: any) => sum + sub.weeklyTaskNorma,
                    0
                  ) === 0
                    ? 100
                    : Math.min(
                        100,
                        Math.round(
                          normaData.weekTaskProgress.reduce(
                            (sum: number, sub: any) => sum + sub.taskProgress,
                            0
                          ) / normaData.weeklyTaskNormaBySubject.length
                        )
                      )
                }
                sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {normaData.weeklyTaskNormaBySubject.reduce(
                  (sum: number, sub: any) => sum + sub.weeklyTaskNorma,
                  0
                ) === 0
                  ? 100
                  : Math.min(
                      100,
                      Math.round(
                        normaData.weekTaskProgress.reduce(
                          (sum: number, sub: any) => sum + sub.taskProgress,
                          0
                        ) / normaData.weeklyTaskNormaBySubject.length
                      )
                    )}
                %
              </Typography>
            </Box>

            {/* 時間進捗 (全体) */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" sx={{ mr: 1 }}>
                学習時間進捗:
              </Typography>
              <LinearProgress
                variant="determinate"
                value={
                  normaData.weeklyTimeNormaBySubject.reduce(
                    (sum: number, sub: any) => sum + sub.weeklyTimeNorma,
                    0
                  ) === 0
                    ? 100
                    : Math.min(
                        100,
                        Math.round(
                          normaData.weekTimeProgress.reduce(
                            (sum: number, sub: any) => sum + sub.timeProgress,
                            0
                          ) / normaData.weeklyTimeNormaBySubject.length
                        )
                      )
                }
                sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
                color="success"
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {normaData.weeklyTimeNormaBySubject.reduce(
                  (sum: number, sub: any) => sum + sub.weeklyTimeNorma,
                  0
                ) === 0
                  ? 100
                  : Math.min(
                      100,
                      Math.round(
                        normaData.weekTimeProgress.reduce(
                          (sum: number, sub: any) => sum + sub.timeProgress,
                          0
                        ) / normaData.weeklyTimeNormaBySubject.length
                      )
                    )}
                %
              </Typography>
            </Box>

            {/* 科目ごとの内訳 */}
            {normaData.weeklyTaskNormaBySubject.map((subjectNorma: any, index: number) => (
              <Box
                key={subjectNorma.subjectId}
                sx={{ mb: 1, p: 1, borderRadius: '4px', backgroundColor: '#f9f9f9' }}
              >
                <Typography variant="body2">{subjectNorma.subjectName}:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ mr: 1 }}>
                    タスク: {normaData.weekTaskProgress[index].taskProgress}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={normaData.weekTaskProgress[index].taskProgress}
                    sx={{ flexGrow: 1, height: 8, borderRadius: 4, mr: 1 }}
                  />
                  <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
                    (
                    {weeklyLearningData
                      .filter((data) => data.subjectId === subjectNorma.subjectId)
                      .reduce((sum, data) => sum + data.completedTasks, 0)}{' '}
                    / {subjectNorma.weeklyTaskNorma})
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ mr: 1 }}>
                    時間: {normaData.weekTimeProgress[index].timeProgress}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={normaData.weekTimeProgress[index].timeProgress}
                    sx={{ flexGrow: 1, height: 8, borderRadius: 4, mr: 1 }}
                    color="success"
                  />
                  <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
                    (
                    {weeklyLearningData
                      .filter((data) => data.subjectId === subjectNorma.subjectId)
                      .reduce((sum, data) => sum + data.learningTime, 0)}
                    分 / {subjectNorma.weeklyTimeNorma}分)
                  </Typography>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* 残り日数 */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: '#fff',
              borderRadius: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              試験まで
            </Typography>
            <Typography variant="body1">
              残り日数: {normaData.daysUntilExam}日 (バッファ考慮: {normaData.effectiveDaysLeft}日)
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NormaDisplay;
