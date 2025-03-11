import React from 'react';
import { GamificationDashboard } from './GamificationDashboard';
import { withMaintenanceOverlay } from '../../../../hooks/useMaintenanceOverlay';

/**
 * ゲーミフィケーションページ
 */
const GamificationPage: React.FC = () => {
  return <GamificationDashboard />;
};

// メンテナンスオーバーレイを適用
export default withMaintenanceOverlay(GamificationPage, {
  message: 'ゲーミフィケーション機能は現在メンテナンス中です。近日中に実装予定です。',
  title: 'ゲーミフィケーション機能準備中',
  severity: 'info'
}); 