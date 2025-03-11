const fs = require('fs');
const path = require('path');

// ファイルをコピー
const copyFile = (source, destination) => {
  fs.copyFileSync(source, destination);
  console.log(`Restored: ${source} -> ${destination}`);
};

// メイン処理
const main = () => {
  // バックアップから元のファイルを復元
  const indexOriginal = path.join(__dirname, 'src', 'index.js');
  const indexBackup = path.join(__dirname, 'src', 'index.js.backup');

  const appOriginal = path.join(__dirname, 'src', 'App.js');
  const appBackup = path.join(__dirname, 'src', 'App.js.backup');

  // バックアップファイルが存在するか確認
  if (fs.existsSync(indexBackup) && fs.existsSync(appBackup)) {
    // 元のファイルを復元
    copyFile(indexBackup, indexOriginal);
    copyFile(appBackup, appOriginal);

    console.log('Original files restored successfully.');
  } else {
    console.error('Backup files not found. Cannot restore original files.');
  }
};

// 実行
main(); 