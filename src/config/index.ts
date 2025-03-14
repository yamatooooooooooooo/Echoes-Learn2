/**
 * アプリケーション全体の設定定数
 */

// アプリケーション設定
export const APP_CONFIG = {
  NAME: 'Echoes Learn',
  VERSION: '1.0.0',
  COPYRIGHT: '© 2023 Echoes Learn',
  SUPPORT_EMAIL: 'support@echoes-learn.com'
};

// APIと通信関連
export const API_CONFIG = {
  TIMEOUT: 10000, // 10秒
  RETRY_COUNT: 3,
  CACHE_TTL: 60 * 5 // 5分
};

// パフォーマンス設定
export const PERF_CONFIG = {
  // データ取得とキャッシュ
  PREFETCH_COUNT: 10,
  PAGINATION_SIZE: 20,
  INFINITE_SCROLL_THRESHOLD: 0.8, // スクロール位置がコンテンツの80%に達したらロード
  LIST_RENDER_LIMIT: 50, // 一度にレンダリングする最大アイテム数
  
  // 遅延読み込み
  LAZY_LOAD_DELAY: 500, // ms
  DEBOUNCE_INTERVAL: 300, // ms
  THROTTLE_INTERVAL: 200, // ms
  
  // アニメーション
  ANIMATION_DURATION: 200, // ms
  TRANSITION_DURATION: '0.2s',
  
  // キャッシュとメモ化
  MEMO_TTL: 60 * 60 * 1000, // 1時間
  QUERY_STALE_TIME: 5 * 60 * 1000, // 5分
  QUERY_CACHE_TIME: 10 * 60 * 1000, // 10分
};

// UI関連定数
export const UI_CONFIG = {
  MOBILE_BREAKPOINT: 600, // pxとしてのモバイルブレークポイント
  TABLET_BREAKPOINT: 960, // pxとしてのタブレットブレークポイント
  SIDEBAR_WIDTH: 240, // pxとしてのサイドバー幅
  HEADER_HEIGHT: 64, // pxとしてのヘッダーの高さ
  
  TOAST_DURATION: 4000, // ms
  MODAL_TRANSITION: 300, // ms
  
  // スタイル定数
  BORDER_RADIUS: {
    SMALL: '4px',
    MEDIUM: '8px',
    LARGE: '12px',
    ROUND: '50%'
  },
  
  SHADOWS: {
    SMALL: '0 2px 4px rgba(0,0,0,0.1)',
    MEDIUM: '0 4px 8px rgba(0,0,0,0.12)',
    LARGE: '0 8px 16px rgba(0,0,0,0.14)'
  },
  
  Z_INDEX: {
    DRAWER: 1200,
    MODAL: 1300,
    POPOVER: 1400,
    TOOLTIP: 1500
  }
};

// Firebase関連の定数
export const FIREBASE_COLLECTIONS = {
  USERS: 'users',
  SUBJECTS: 'subjects',
  PROGRESS: 'progress',
  SETTINGS: 'settings',
  STUDY_ANALYTICS: 'studyAnalytics'
};

// 学習関連定数
export const LEARNING_CONFIG = {
  DEFAULT_STUDY_DURATION: 30, // 分
  SATISFACTION_LEVELS: ['低', '中', '高'],
  MAX_PAGES_PER_SESSION: 100,
  DEFAULT_PRIORITY: 2, // 優先度の中間値（1-3の範囲）
  PROGRESS_CHART_DAYS: 30, // 進捗グラフの表示日数
  PROGRESS_CHART_COLORS: ['#2196f3', '#4caf50', '#ff9800', '#f44336']
};

// 最適化フラグ
export const OPTIMIZATION_FLAGS = {
  ENABLE_VIRTUALIZATION: true, // 長いリストでの仮想化を有効化
  ENABLE_CODE_SPLITTING: true, // コード分割を有効化
  ENABLE_PREFETCHING: true, // プリフェッチを有効化
  ENABLE_WORKER: true, // Webワーカーを使用
  ENABLE_SERVICE_WORKER: true, // サービスワーカーを使用
  ENABLE_LAZY_RENDERING: true // レイジーレンダリングを有効化
}; 