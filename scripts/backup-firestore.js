/**
 * Firestoreデータバックアップスクリプト
 * 
 * 前提条件:
 * - Google Cloud SDKがインストールされていること
 * - gcloudコマンドにアクセスできること
 * - 適切な権限を持つサービスアカウントが設定されていること
 * 
 * 使用方法:
 * node backup-firestore.js [project-id] [bucket-name]
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 引数からプロジェクトIDとバケット名を取得
const projectId = process.argv[2] || 'echoes-learn2';
const bucketName = process.argv[3] || `gs://${projectId}-backups`;
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = `${bucketName}/firestore-backups/${timestamp}`;

// バックアップディレクトリを作成
const localBackupDir = path.join(__dirname, '../backups');
if (!fs.existsSync(localBackupDir)) {
  fs.mkdirSync(localBackupDir, { recursive: true });
}

console.log(`Firestoreデータのバックアップを開始します: ${timestamp}`);
console.log(`プロジェクト: ${projectId}`);
console.log(`バックアップ先: ${backupPath}`);

// gcloudコマンドでFirestoreデータをエクスポート
const exportCommand = `gcloud firestore export ${backupPath} --project=${projectId}`;

exec(exportCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`エクスポートエラー: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`エクスポートの警告: ${stderr}`);
  }
  
  console.log(`エクスポート出力: ${stdout}`);
  console.log(`バックアップが正常に完了しました: ${backupPath}`);
  
  // バックアップ情報のログをローカルに保存
  const logFile = path.join(localBackupDir, 'backup-history.log');
  const logEntry = `${timestamp} - ${backupPath}\n`;
  
  fs.appendFile(logFile, logEntry, (err) => {
    if (err) {
      console.error(`ログの書き込みエラー: ${err.message}`);
    } else {
      console.log(`バックアップログが保存されました: ${logFile}`);
    }
  });
});

// バックアップローテーション（古いバックアップの削除）
// 30日以上経過したバックアップを削除するロジックを追加
const rotationCommand = `gsutil ls ${bucketName}/firestore-backups/ | sort | head -n -10 | xargs -I {} gsutil -m rm -r {}`;

exec(rotationCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`バックアップローテーションエラー: ${error.message}`);
    return;
  }
  
  if (stderr && !stderr.includes('No URLs matched')) {
    console.error(`ローテーションの警告: ${stderr}`);
  }
  
  console.log('古いバックアップのクリーンアップが完了しました');
}); 