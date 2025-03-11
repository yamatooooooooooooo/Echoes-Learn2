const { onRequest, onCall } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineString, defineInt } = require('firebase-functions/params');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

/**
 * 科目が新規作成された時に、進捗計画を自動生成するFunction
 * 
 * HTTPSエンドポイント: 科目IDを受け取り進捗計画を生成
 * 
 * 計算ロジック:
 * 1. 試験日とバッファ日数を考慮して、実質的な学習期間を計算
 * 2. 総ページ数を学習日数で割って、1日あたりの目標ページ数を計算
 * 3. 日ごとの進捗計画をFirestoreのprogressPlansコレクションに保存
 */
exports.createProgressPlanV2 = onCall({ maxInstances: 10 }, async (request) => {
    try {
      const { subjectId } = request.data;
      
      if (!subjectId) {
        throw new Error('科目IDが必要です');
      }
      
      // Firestoreから科目データを取得
      const subjectDoc = await db.collection('subjects').doc(subjectId).get();
      
      if (!subjectDoc.exists) {
        throw new Error('指定されたIDの科目が見つかりません');
      }
      
      const subjectData = subjectDoc.data();
      
      // 必要なデータが揃っているか確認
      if (!subjectData.totalPages || !subjectData.examDate) {
        console.log('必要なデータが不足しています:', subjectId);
        return { success: false, error: '必要なデータが不足しています' };
      }
      
      // 科目データ
      const totalPages = subjectData.totalPages;
      const examDate = new Date(subjectData.examDate);
      const bufferDays = subjectData.bufferDays || 0;
      
      // 現在の日付
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 時間をリセット
      
      // 試験日から実際の学習終了日を計算（バッファ日数を考慮）
      const learningEndDate = new Date(examDate);
      learningEndDate.setDate(learningEndDate.getDate() - bufferDays);
      
      // 残りの学習日数を計算
      const remainingDays = Math.ceil((learningEndDate - today) / (1000 * 60 * 60 * 24));
      
      // 学習日数が0以下の場合（試験日が過ぎている、またはバッファ日数が大きすぎる場合）
      if (remainingDays <= 0) {
        console.log('学習期間が設定できません:', subjectId);
        
        // エラー情報をsubjectsドキュメントに保存
        await subjectDoc.ref.update({
          progressPlanError: '試験日または学習期間の設定に問題があります'
        });
        
        return { success: false, error: '試験日または学習期間の設定に問題があります' };
      }
      
      // 1日あたりの目標ページ数を計算（小数点以下切り上げ）
      let pagesPerDay = Math.ceil(totalPages / remainingDays);
      
      // 進捗計画データ
      const progressPlan = {
        subjectId: subjectId,
        subjectName: subjectData.name,
        totalPages: totalPages,
        examDate: subjectData.examDate,
        bufferDays: bufferDays,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        dailyTargets: []
      };
      
      // 日ごとの進捗目標を計算
      let remainingPages = totalPages;
      let currentDate = new Date(today);
      
      while (currentDate <= learningEndDate && remainingPages > 0) {
        // その日の目標ページ数（残りページが1日の目標より少ない場合は残りページ数を使用）
        const targetPages = Math.min(pagesPerDay, remainingPages);
        
        // 日付をYYYY-MM-DD形式に変換
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // 日ごとの目標を追加
        progressPlan.dailyTargets.push({
          date: dateStr,
          targetPages: targetPages,
          completed: false
        });
        
        // 残りページ数を更新
        remainingPages -= targetPages;
        
        // 次の日へ
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // progressPlansコレクションに保存
      await db.collection('progressPlans').doc(subjectId).set(progressPlan);
      
      // subjectsドキュメントに計画作成済みフラグを追加
      await subjectDoc.ref.update({
        hasProgressPlan: true,
        pagesPerDay: pagesPerDay
      });
      
      console.log(`進捗計画を作成しました: ${subjectId}, 1日あたり${pagesPerDay}ページ`);
      
      return { success: true, pagesPerDay: pagesPerDay };
    } catch (error) {
      console.error('進捗計画の作成中にエラーが発生しました:', error);
      return { success: false, error: error.message };
    }
});

/**
 * [オプション] 日次の進捗スケジュールを再計算するFunction
 * 
 * Callable Function: クライアントから直接呼び出せるように
 * 進捗記録時や日程変更時に再計算するために使用
 */
exports.recalculateProgressPlanV2 = onCall({ maxInstances: 10 }, async (request) => {
  try {
    const { subjectId } = request.data;
    
    if (!subjectId) {
      throw new Error('科目IDが指定されていません');
    }
    
    // 科目データを取得
    const subjectDoc = await db.collection('subjects').doc(subjectId).get();
    
    if (!subjectDoc.exists) {
      throw new Error('指定された科目が見つかりません');
    }
    
    // 既存の進捗データを取得（実際の進捗を考慮して再計算するため）
    const progressSnapshot = await db.collection('progress')
      .where('subjectId', '==', subjectId)
      .orderBy('recordDate', 'desc')
      .get();
    
    // 最新の進捗状況（最後に読んだページ）を特定
    let lastPageRead = 0;
    
    if (!progressSnapshot.empty) {
      const latestProgress = progressSnapshot.docs[0].data();
      lastPageRead = latestProgress.endPage;
    }
    
    // 残りのページ数を計算
    const subjectData = subjectDoc.data();
    const remainingPages = subjectData.totalPages - lastPageRead;
    
    // 現在の日付
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 試験日
    const examDate = new Date(subjectData.examDate);
    
    // バッファ日数を考慮した学習終了日
    const bufferDays = subjectData.bufferDays || 0;
    const learningEndDate = new Date(examDate);
    learningEndDate.setDate(learningEndDate.getDate() - bufferDays);
    
    // 残りの学習日数
    const remainingDays = Math.max(1, Math.ceil((learningEndDate - today) / (1000 * 60 * 60 * 24)));
    
    // 1日あたりの目標ページ数
    const pagesPerDay = Math.ceil(remainingPages / remainingDays);
    
    // 新しい進捗計画を作成
    const newProgressPlan = {
      subjectId: subjectId,
      subjectName: subjectData.name,
      totalPages: subjectData.totalPages,
      examDate: subjectData.examDate,
      bufferDays: bufferDays,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      lastPageRead: lastPageRead,
      remainingPages: remainingPages,
      pagesPerDay: pagesPerDay,
      dailyTargets: []
    };
    
    // 日ごとの進捗目標を計算
    let remainingPagesToAssign = remainingPages;
    let currentDate = new Date(today);
    
    while (currentDate <= learningEndDate && remainingPagesToAssign > 0) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dailyTarget = Math.min(pagesPerDay, remainingPagesToAssign);
      
      newProgressPlan.dailyTargets.push({
        date: dateStr,
        targetPages: dailyTarget,
        targetStartPage: subjectData.totalPages - remainingPagesToAssign + 1,
        targetEndPage: subjectData.totalPages - remainingPagesToAssign + dailyTarget,
        completed: false
      });
      
      remainingPagesToAssign -= dailyTarget;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // progressPlansコレクションを更新
    await db.collection('progressPlans').doc(subjectId).set(newProgressPlan);
    
    // 科目ドキュメントも更新
    await db.collection('subjects').doc(subjectId).update({
      hasProgressPlan: true,
      pagesPerDay: pagesPerDay,
      lastRecalculated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      success: true,
      message: `進捗計画を再計算しました。1日あたり${pagesPerDay}ページの学習が必要です。`,
      pagesPerDay: pagesPerDay,
      remainingDays: remainingDays
    };
  } catch (error) {
    console.error('進捗計画の再計算でエラーが発生しました:', error);
    throw new Error('進捗計画の再計算に失敗しました: ' + error.message);
  }
});

/**
 * 進捗記録時に科目の優先度を自動更新するHTTPS関数
 * 
 * HTTPSエンドポイント: 進捗ログIDから科目の優先度を更新
 * 
 * 計算ロジック:
 * 1. 指定された科目の進捗率を計算
 * 2. 試験日までの残り日数を計算
 * 3. 残りページ数と残り日数から優先度スコアを算出
 * 4. 優先度スコアを計算し、科目データを更新
 */
exports.updateSubjectPriorityV2 = onCall({ maxInstances: 10 }, async (request) => {
    try {
      const { subjectId, logId } = request.data;
      
      if (!subjectId) {
        throw new Error('科目IDが必要です');
      }
      
      let logData;
      
      // logIdが指定されている場合は、そのログデータを取得
      if (logId) {
        const logDoc = await db.collection('progress').doc(logId).get();
        if (!logDoc.exists) {
          throw new Error('指定された進捗ログが見つかりません');
        }
        logData = logDoc.data();
      }
      
      // 科目データを取得
      const subjectDoc = await db.collection('subjects').doc(subjectId).get();
      
      if (!subjectDoc.exists) {
        throw new Error('指定された科目が見つかりません');
      }
      
      // 以降は元のコード（関数名を updateSubjectPriorityInternal に変更）を呼び出す
      const result = await updateSubjectPriorityInternal(subjectId, logData);
      
      return result;
    } catch (error) {
      console.error('科目の優先度更新中にエラーが発生しました:', error);
      return { success: false, error: error.message };
    }
});

/**
 * 科目が新規作成された時に、進捗計画を自動生成するためのトリガー
 * Firestoreトリガー: subjects/{subjectId}ドキュメントの作成時に実行
 */
exports.onNewSubjectCreatedV2 = onDocumentCreated('subjects/{subjectId}', async (event) => {
  try {
    // 新しく作成された科目のデータ
    const snapshot = event.data;
    if (!snapshot) {
      console.log('データが存在しません');
      return null;
    }
    
    const subjectId = event.params.subjectId;
    
    // HTTPSの関数を内部から直接呼び出す
    const progressPlanResult = await createProgressPlanInternal(subjectId);
    console.log('進捗計画の作成結果:', progressPlanResult);
    
    return null;
  } catch (error) {
    console.error('科目作成トリガーでエラーが発生しました:', error);
    return null;
  }
});

/**
 * 進捗記録時に科目の優先度を自動更新するトリガー
 * Firestoreトリガー: progress/{logId}ドキュメントの作成時に実行
 */
exports.onNewProgressCreatedV2 = onDocumentCreated('progress/{logId}', async (event) => {
    try {
      // 新しく作成された進捗ログのデータ
      const snapshot = event.data;
      if (!snapshot) {
        console.log('データが存在しません');
        return null;
      }
      
      const logData = snapshot.data();
      const subjectId = logData.subjectId;
      
      if (!subjectId) {
        console.log('進捗ログに科目IDがありません');
        return null;
      }
      
      // 内部関数を呼び出して優先度を更新
      const result = await updateSubjectPriorityInternal(subjectId, logData);
      console.log('優先度更新結果:', result);
      
      return null;
    } catch (error) {
      console.error('進捗作成トリガーでエラーが発生しました:', error);
      return null;
    }
});

// 内部的に使用するための優先度更新ヘルパー関数
async function updateSubjectPriorityInternal(subjectId, logData = null) {
    try {
      // 科目データを取得
      const subjectDoc = await db.collection('subjects').doc(subjectId).get();
      
      if (!subjectDoc.exists) {
        return { success: false, error: '指定された科目が見つかりません' };
      }
      
      const subjectData = subjectDoc.data();
      
      // 残りページ数を計算
      const currentPage = subjectData.currentPage || 0;
      const totalPages = subjectData.totalPages || 0;
      const remainingPages = totalPages - currentPage;
      
      // 進捗率を計算
      const progressPercentage = Math.floor((currentPage / totalPages) * 100);
      
      // 試験日があるかチェック
      if (!subjectData.examDate) {
        console.log('試験日が設定されていないので優先度を更新できません:', subjectId);
        return { success: false, error: '試験日が設定されていません' };
      }
      
      // 試験日までの残り日数を計算
      const examDate = new Date(subjectData.examDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 時間をリセット
      
      const daysRemaining = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
      
      // 優先度スコアを計算（アルゴリズムは調整可能）
      let priorityScore = 0;
      
      if (daysRemaining <= 0) {
        // 試験日を過ぎている場合は最高優先度
        priorityScore = 10;
      } else if (remainingPages <= 0) {
        // 読了済みの場合は最低優先度
        priorityScore = 1;
      } else {
        // 残りページと残り日数から優先度を計算
        // 残りページが多く、残り日数が少ないほど優先度が高い
        priorityScore = Math.min(10, Math.ceil((remainingPages / daysRemaining) * 0.5));
        
        // 試験日が近いほどボーナス
        if (daysRemaining < 7) priorityScore += 3;
        else if (daysRemaining < 14) priorityScore += 2;
        else if (daysRemaining < 30) priorityScore += 1;
      }
      
      // 優先度スコアを優先度レベルに変換
      let priority = 'low';
      if (priorityScore >= 7) priority = 'high';
      else if (priorityScore >= 4) priority = 'medium';
      
      // 科目データを更新
      await subjectDoc.ref.update({
        priority: priority,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`科目の優先度を更新しました: ${subjectId}, 優先度: ${priority}, スコア: ${priorityScore}`);
      
      return { 
        success: true, 
        priority: priority, 
        score: priorityScore,
        remainingPages: remainingPages,
        daysRemaining: daysRemaining
      };
    } catch (error) {
      console.error('優先度の更新中にエラーが発生しました:', error);
      return { success: false, error: error.message };
    }
}

/**
 * 毎日午前0時に実行され、優先順位の高い科目からデイリーノルマを作成するFunction
 * 
 * スケジュール: 毎日午前0時（日本時間）に実行
 * 
 * 計算ロジック:
 * 1. 優先順位の高い科目を取得
 * 2. 同時進行科目数に基づいてデイリーノルマを計算
 * 3. 計算結果をdailyNormsコレクションに保存
 */
exports.generateDailyNormsV2 = onSchedule('every day 00:00', async (event) => {
    try {
      // 本日の日付を取得
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // 未完了の科目一覧を取得
      const subjectsSnapshot = await db.collection('subjects')
        .where('isCompleted', '==', false)
        .get();
      
      if (subjectsSnapshot.empty) {
        console.log('学習中の科目がありません');
        return null;
      }
      
      // 各科目のノルマを生成
      const batch = db.batch();
      let totalNorms = 0;
      
      subjectsSnapshot.forEach(doc => {
        const subject = doc.data();
        
        // 進捗計画があれば利用
        if (subject.hasProgressPlan) {
          // 今日の進捗計画を取得（あれば）
          db.collection('progressPlans')
            .doc(`${doc.id}_${todayStr}`)
            .get()
            .then(planDoc => {
              if (planDoc.exists) {
                const plan = planDoc.data();
                const normRef = db.collection('dailyNorms').doc(`${doc.id}_${todayStr}`);
                
                batch.set(normRef, {
                  subjectId: doc.id,
                  subjectName: subject.name,
                  date: todayStr,
                  pages: plan.plannedPages,
                  isCompleted: false,
                  createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
                
                totalNorms += plan.plannedPages;
              }
            })
            .catch(error => {
              console.error('進捗計画の取得に失敗しました:', error);
            });
        } else {
          // 進捗計画がない場合は残りページ数から概算
          const remainingPages = subject.totalPages - (subject.currentPage || 0);
          
          if (remainingPages <= 0) {
            return; // この科目は完了しているのでスキップ
          }
          
          // 残り日数の計算
          const examDate = new Date(subject.examDate);
          const daysRemaining = Math.max(1, Math.ceil((examDate - today) / (1000 * 60 * 60 * 24)));
          
          // 1日あたりのノルマページ数
          const pagesPerDay = Math.ceil(remainingPages / daysRemaining);
          
          // ノルマデータを作成
          const normRef = db.collection('dailyNorms').doc(`${doc.id}_${todayStr}`);
          
          batch.set(normRef, {
            subjectId: doc.id,
            subjectName: subject.name,
            date: todayStr,
            pages: pagesPerDay,
            isCompleted: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          totalNorms += pagesPerDay;
        }
      });
      
      // バッチ処理を実行
      await batch.commit();
      
      console.log(`デイリーノルマを生成しました: ${todayStr}, 合計 ${totalNorms} ページ`);
      
      return null;
    } catch (error) {
      console.error('デイリーノルマの生成中にエラーが発生しました:', error);
      return null;
    }
});

// 内部的に使用するためのヘルパー関数
async function createProgressPlanInternal(subjectId) {
  try {
    // Firestoreから科目データを取得
    const subjectDoc = await db.collection('subjects').doc(subjectId).get();
    
    if (!subjectDoc.exists) {
      console.log('指定されたIDの科目が見つかりません:', subjectId);
      return { success: false, error: '指定されたIDの科目が見つかりません' };
    }
    
    const subjectData = subjectDoc.data();
    
    // 必要なデータが揃っているか確認
    if (!subjectData.totalPages || !subjectData.examDate) {
      console.log('必要なデータが不足しています:', subjectId);
      return { success: false, error: '必要なデータが不足しています' };
    }
    
    // 科目データ
    const totalPages = subjectData.totalPages;
    const examDate = new Date(subjectData.examDate);
    const bufferDays = subjectData.bufferDays || 0;
    
    // 現在の日付
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 時間をリセット
    
    // 試験日から実際の学習終了日を計算（バッファ日数を考慮）
    const learningEndDate = new Date(examDate);
    learningEndDate.setDate(learningEndDate.getDate() - bufferDays);
    
    // 学習日数の計算（今日から学習終了日までの日数）
    const learningDays = Math.max(1, Math.floor((learningEndDate - today) / (1000 * 60 * 60 * 24)));
    
    // 試験日が既に過ぎているか、学習日数が不適切な場合
    if (learningDays <= 0) {
      console.log('試験日または学習期間の設定に問題があります:', subjectId);
      
      // エラー情報をsubjectsドキュメントに保存
      await subjectDoc.ref.update({
        progressPlanError: '試験日または学習期間の設定に問題があります'
      });
      
      return { success: false, error: '試験日または学習期間の設定に問題があります' };
    }
    
    // 1日あたりのページ数を計算（切り上げ）
    const pagesPerDay = Math.ceil(totalPages / learningDays);
    
    // 進捗計画バッチを準備
    const batch = db.batch();
    
    // 日ごとの進捗計画を作成
    for (let day = 0; day < learningDays; day++) {
      const planDate = new Date(today);
      planDate.setDate(planDate.getDate() + day);
      
      const planDateStr = planDate.toISOString().split('T')[0]; // YYYY-MM-DD形式
      
      const planRef = db.collection('progressPlans').doc(`${subjectId}_${planDateStr}`);
      
      // その日の計画ページ数
      const plannedPages = (day === learningDays - 1) 
        ? totalPages - (pagesPerDay * (learningDays - 1)) // 最終日は残りのページ
        : pagesPerDay;
      
      batch.set(planRef, {
        subjectId: subjectId,
        date: planDateStr,
        plannedPages: plannedPages,
        completedPages: 0,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    // バッチ処理を実行
    await batch.commit();
    
    // subjectsドキュメントに計画作成済みフラグを追加
    await subjectDoc.ref.update({
      hasProgressPlan: true,
      pagesPerDay: pagesPerDay
    });
    
    console.log(`進捗計画を作成しました: ${subjectId}, 1日あたり${pagesPerDay}ページ`);
    
    return { success: true, pagesPerDay: pagesPerDay };
  } catch (error) {
    console.error('進捗計画の作成中にエラーが発生しました:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Firestoreデータの自動バックアップ（毎日深夜に実行）
 * 
 * このCloud Functionは毎日深夜に実行され、Firestoreのデータを
 * Cloud Storageバケットにエクスポートします。
 * 30日より古いバックアップは自動的に削除されます。
 */
exports.scheduledFirestoreBackup = onSchedule({
  schedule: '0 2 * * *', // 毎日午前2時に実行
  timeZone: 'Asia/Tokyo',
  retryCount: 3,
  memory: '256MiB',
}, async (event) => {
  try {
    console.log('Firestoreの自動バックアップを開始します');
    
    // プロジェクトIDを取得
    const project = process.env.GCLOUD_PROJECT;
    // タイムスタンプをバックアップ名に使用
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    // バックアップ先のパス
    const bucketName = `gs://${project}-backups`;
    const backupPath = `${bucketName}/firestore-backups/${timestamp}`;
    
    // Firebaseアプリを取得
    const app = admin.app();
    
    // Firestoreクライアントを取得
    const firestore = admin.firestore(app);
    
    // バックアップの実行
    // 注: このAPIには適切な権限が必要です
    await firestore._firestoreClient.exportDocuments({
      name: `projects/${project}/databases/(default)`,
      outputUriPrefix: backupPath,
      // 必要に応じて特定のコレクションのみをバックアップ
      // collectionIds: ['users', 'subjects', 'progress']
    });
    
    console.log(`バックアップが完了しました: ${backupPath}`);
    
    // バックアップの情報をデータベースに記録
    await db.collection('backupLogs').add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      path: backupPath,
      status: 'success'
    });
    
    // バックアップローテーション：30日以上経過したバックアップを削除
    const bucket = admin.storage().bucket(bucketName);
    const [files] = await bucket.getFiles({ prefix: 'firestore-backups/' });
    
    // バックアップの一覧を取得し、日付順にソート
    const backups = files
      .filter(file => file.name.startsWith('firestore-backups/'))
      .map(file => ({
        name: file.name,
        created: new Date(file.metadata.timeCreated)
      }))
      .sort((a, b) => a.created.getTime() - b.created.getTime());
    
    // 30日前の日付を計算
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // 古いバックアップを削除
    const oldBackups = backups.filter(backup => backup.created < thirtyDaysAgo);
    
    for (const backup of oldBackups) {
      await bucket.file(backup.name).delete();
      console.log(`古いバックアップを削除しました: ${backup.name}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('バックアップ処理中にエラーが発生しました:', error);
    
    // エラーログを保存
    await db.collection('backupLogs').add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      error: error.message,
      status: 'failed'
    });
    
    throw error;
  }
});


