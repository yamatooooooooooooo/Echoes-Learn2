import { ReactNode } from 'react';
import { SvgIconComponent } from '@mui/icons-material';
import { MODULE_ICONS } from './appIcons';
import { Analytics as AnalyticsIcon } from '@mui/icons-material';

export interface DashboardModule {
  id: string;
  title: string;
  description: string;
  icon: SvgIconComponent;
  defaultSize: 'small' | 'medium' | 'large';
  defaultCollapsed: boolean;
  defaultEnabled: boolean;
  order: number;
  canDisable: boolean;
}

/**
 * ダッシュボードで利用可能なモジュールの定義
 */
export const DASHBOARD_MODULES: Record<string, DashboardModule> = {
  stats: {
    id: 'stats',
    title: '学習統計',
    description: '全体の進捗状況を表示します',
    icon: MODULE_ICONS.stats,
    defaultSize: 'medium',
    defaultCollapsed: false,
    defaultEnabled: true,
    order: 1,
    canDisable: false
  },
  dailyQuota: {
    id: 'dailyQuota',
    title: '今日のノルマ',
    description: '今日の学習ノルマを表示します',
    icon: MODULE_ICONS.dailyQuota,
    defaultSize: 'small',
    defaultCollapsed: false,
    defaultEnabled: true,
    order: 2,
    canDisable: true
  },
  exams: {
    id: 'exams',
    title: '試験スケジュール',
    description: '今後の試験日程を表示します',
    icon: MODULE_ICONS.exams,
    defaultSize: 'medium',
    defaultCollapsed: false,
    defaultEnabled: true,
    order: 3,
    canDisable: true
  },
  recentProgress: {
    id: 'recentProgress',
    title: '最近の学習進捗',
    description: '最近の学習記録を表示します',
    icon: MODULE_ICONS.recentProgress,
    defaultSize: 'large',
    defaultCollapsed: false,
    defaultEnabled: true,
    order: 4,
    canDisable: true
  },
  learningAnalytics: {
    id: 'learningAnalytics',
    title: '学習分析',
    description: '効率性分析と学習最適化の提案を表示します',
    icon: AnalyticsIcon,
    defaultSize: 'large',
    defaultCollapsed: false,
    defaultEnabled: true,
    order: 5,
    canDisable: true
  }
};

/**
 * モジュールのデフォルト設定を取得
 */
export const getDefaultModuleSettings = (): {[key: string]: {enabled: boolean, collapsed: boolean, order: number}} => {
  const settings: {[key: string]: {enabled: boolean, collapsed: boolean, order: number}} = {};
  
  Object.entries(DASHBOARD_MODULES).forEach(([key, module]) => {
    settings[key] = {
      enabled: module.defaultEnabled,
      collapsed: module.defaultCollapsed,
      order: module.order
    };
  });
  
  return settings;
}; 