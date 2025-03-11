const fs = require('fs');
const path = require('path');

// ディレクトリが存在するか確認し、なければ作成
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// ファイルをコピー
const copyFile = (source, destination) => {
  fs.copyFileSync(source, destination);
  console.log(`Copied: ${source} -> ${destination}`);
};

// メイン処理
const main = () => {
  // シンプル版ファイルを元のファイルに一時的に置き換える
  const indexOriginal = path.join(__dirname, 'src', 'index.js');
  const indexSimple = path.join(__dirname, 'src', 'index.simple.js');
  const indexBackup = path.join(__dirname, 'src', 'index.js.backup');

  const appOriginal = path.join(__dirname, 'src', 'App.js');
  const appSimple = path.join(__dirname, 'src', 'App.simple.js');
  const appBackup = path.join(__dirname, 'src', 'App.js.backup');

  // バックアップを作成
  copyFile(indexOriginal, indexBackup);
  copyFile(appOriginal, appBackup);

  // シンプル版で置き換え
  copyFile(indexSimple, indexOriginal);
  copyFile(appSimple, appOriginal);

  console.log('Files prepared for simple build. Now run: npm run build');
};

// 実行
main(); 