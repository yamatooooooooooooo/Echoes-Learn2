import React from 'react';
import { 
  School as SchoolIcon, 
  MenuBook as MenuBookIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

import { DashboardData } from '../../../../../domain/entities/Dashboard';
import { NotionCounterModule } from './NotionCounterModule';
import { NotionProgressModule } from './NotionProgressModule';

// モジュールタイプの定義
export enum NotionModuleType {
  TOTAL_SUBJECTS = 'totalSubjects',
  COMPLETED_SUBJECTS = 'completedSubjects',
  STUDY_PROGRESS = 'studyProgress',
  TOTAL_PAGES = 'totalPages',
  COMPLETED_PAGES = 'completedPages',
  PAGE_PROGRESS = 'pageProgress',
  WEEKLY_TREND = 'weeklyTrend',
  SUBJECT_BREAKDOWN = 'subjectBreakdown',
  RECENT_ACTIVITY = 'recentActivity',
}

// 各モジュールタイプの表示名
export const moduleNames: Record<NotionModuleType, string> = {
  [NotionModuleType.TOTAL_SUBJECTS]: '教材数',
  [NotionModuleType.COMPLETED_SUBJECTS]: '完了した教材',
  [NotionModuleType.STUDY_PROGRESS]: '教材進捗状況',
  [NotionModuleType.TOTAL_PAGES]: '総ページ数',
  [NotionModuleType.COMPLETED_PAGES]: '学習済みページ',
  [NotionModuleType.PAGE_PROGRESS]: 'ページ進捗状況',
  [NotionModuleType.WEEKLY_TREND]: '週間トレンド',
  [NotionModuleType.SUBJECT_BREAKDOWN]: '教材内訳',
  [NotionModuleType.RECENT_ACTIVITY]: '最近の活動',
};

export interface NotionModuleFactoryProps {
  type: NotionModuleType;
  dashboardData: DashboardData;
  id: string;
  index: number;
  onToggleVisibility?: (id: string) => void;
  onToggleCollapse?: (id: string, isCollapsed: boolean) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  isDraggingEnabled?: boolean;
  canHide?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

export const NotionModuleFactory: React.FC<NotionModuleFactoryProps> = ({
  type,
  dashboardData,
  id,
  index,
  onToggleVisibility,
  onToggleCollapse,
  onMoveUp,
  onMoveDown,
  isDraggingEnabled = true,
  canHide = true,
  isFirst = false,
  isLast = false
}) => {
  // モジュールの共通プロパティ
  const moduleProps = {
    id,
    index,
    onToggleVisibility,
    onToggleCollapse,
    onMoveUp,
    onMoveDown,
    isDraggingEnabled,
    canHide,
    isFirst,
    isLast
  };

  // データの検証
  if (!dashboardData) {
    return null;
  }

  switch (type) {
    case NotionModuleType.TOTAL_SUBJECTS:
      return (
        <NotionCounterModule
          {...moduleProps}
          title={moduleNames[type]}
          value={dashboardData.totalSubjects || 0}
          description="登録されている教材の総数"
          icon={<SchoolIcon />}
          color="#3f51b5"
        />
      );

    case NotionModuleType.COMPLETED_SUBJECTS:
      return (
        <NotionCounterModule
          {...moduleProps}
          title={moduleNames[type]}
          value={dashboardData.completedSubjects || 0}
          description="学習を完了した教材の数"
          icon={<MenuBookIcon />}
          color="#4caf50"
        />
      );

    case NotionModuleType.STUDY_PROGRESS:
      return (
        <NotionProgressModule
          {...moduleProps}
          title={moduleNames[type]}
          value={dashboardData.completedSubjects || 0}
          total={dashboardData.totalSubjects || 0}
          description="教材の完了進捗"
          icon={<BarChartIcon />}
          color="#9c27b0"
        />
      );

    case NotionModuleType.TOTAL_PAGES:
      return (
        <NotionCounterModule
          {...moduleProps}
          title={moduleNames[type]}
          value={dashboardData.totalPages || 0}
          description="すべての教材の総ページ数"
          icon={<MenuBookIcon />}
          color="#2196f3"
        />
      );

    case NotionModuleType.COMPLETED_PAGES:
      return (
        <NotionCounterModule
          {...moduleProps}
          title={moduleNames[type]}
          value={dashboardData.completedPages || 0}
          description="学習済みのページ数"
          icon={<MenuBookIcon />}
          color="#ff9800"
        />
      );

    case NotionModuleType.PAGE_PROGRESS:
      return (
        <NotionProgressModule
          {...moduleProps}
          title={moduleNames[type]}
          value={dashboardData.completedPages || 0}
          total={dashboardData.totalPages || 0}
          description="ページ学習の進捗状況"
          icon={<TimelineIcon />}
          color="#f44336"
        />
      );

    // 他のモジュールタイプも同様に実装
    // 将来的に週間トレンドやサブジェクト内訳、最近の活動などを追加

    default:
      return null;
  }
}; 