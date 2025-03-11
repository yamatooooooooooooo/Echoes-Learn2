const fs = require('fs');
const path = require('path');

function optimizeAssets() {
  const buildDir = path.join(__dirname, '../build');

  // インラインスクリプトの最適化
  const indexPath = path.join(buildDir, 'index.html');
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // CSPの追加
  const cspMeta = '<meta http-equiv="Content-Security-Policy" content="default-src \'self\' https://*.firebaseapp.com https://*.googleapis.com; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; font-src \'self\' https://fonts.gstatic.com; img-src \'self\' data: https:; connect-src \'self\' https://*.firebaseio.com wss://*.firebaseio.com https://*.googleapis.com;">';
  indexContent = indexContent.replace('</head>', `${cspMeta}\n</head>`);

  // キャッシュ制御の追加
  const cacheControl = '<meta http-equiv="Cache-Control" content="public, max-age=31536000">';
  indexContent = indexContent.replace('</head>', `${cacheControl}\n</head>`);

  fs.writeFileSync(indexPath, indexContent);

  console.log('Assets optimization completed successfully!');
}

try {
  optimizeAssets();
} catch (error) {
  console.error('Assets optimization failed:', error);
  process.exit(1);
} 