// Firebaseのprogressコレクションを初期化するスクリプト
const admin = require('firebase-admin');
const serviceAccount = require('../firebase-admin-key.json');

// Firebase Adminを初期化
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const progressCollection = db.collection('progress');

// プログレスコレクション内のすべてのドキュメントを削除する関数
async function deleteAllProgressDocuments() {
  console.log('プログレスコレクション内のすべてのドキュメントを削除しています...');
  
  try {
    // バッチサイズを制限して取得
    const batchSize = 100;
    let docsDeleted = 0;
    
    // 削除を繰り返す
    const deleteQueryBatch = async () => {
      const query = progressCollection.limit(batchSize);
      const snapshot = await query.get();
      
      // これ以上ドキュメントがなければ終了
      if (snapshot.size === 0) {
        console.log(`削除完了: 合計 ${docsDeleted} 件のドキュメントを削除しました。`);
        return;
      }
      
      // バッチ処理で削除
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      docsDeleted += snapshot.size;
      console.log(`${docsDeleted} 件のドキュメントを削除しました...`);
      
      // 再帰呼び出しで次のバッチを処理
      process.nextTick(deleteQueryBatch);
    };
    
    await deleteQueryBatch();
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

// 実行
deleteAllProgressDocuments().then(() => {
  console.log('処理が完了しました。');
  process.exit(0);
}).catch((error) => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
}); 