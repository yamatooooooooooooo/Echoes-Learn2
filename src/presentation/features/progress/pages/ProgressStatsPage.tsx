import React from 'react';
import { ProgressStats } from '../components/ProgressStats';
import { withMaintenanceOverlay } from '../../../../hooks/useMaintenanceOverlay';

/**
 * 進捗統計ページ
 */
const ProgressStatsPage: React.FC = () => {
  return <ProgressStats />;
};

// メンテナンスオーバーレイを適用
export default withMaintenanceOverlay(ProgressStatsPage, {
  message: '進捗統計機能は現在メンテナンス中です。近日中に実装予定です。',
  title: '進捗統計機能準備中',
  severity: 'info'
}); 