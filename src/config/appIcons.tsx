import React from 'react';
import {
  // ナビゲーションとダッシュボード関連
  Dashboard as DashboardIcon,
  MenuBook as MenuBookIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  CalendarToday as CalendarTodayIcon,
  Assignment as AssignmentIcon,
  Analytics as AnalyticsIcon,
  Lightbulb as LightbulbIcon,
  BubbleChart as BubbleChartIcon,

  // 科目関連
  LibraryBooks as LibraryBooksIcon,
  AutoStories as AutoStoriesIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,

  // 学習進捗関連
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Event as EventIcon,
  EventNote as EventNoteIcon,
  Schedule as ScheduleIcon,
  Timer as TimerIcon,

  // 優先度関連
  Flag as FlagIcon,
  FlagOutlined as FlagOutlinedIcon,
  PriorityHigh as PriorityHighIcon,

  // アクション関連
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,

  // 表示制御関連
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,

  // 設定と操作関連
  Settings as SettingsIcon,
  Tune as TuneIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  DragIndicator as DragIndicatorIcon,

  // ステータス関連
  CheckCircleOutline as CheckCircleOutlineIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
  PauseCircleOutline as PauseCircleOutlineIcon,

  // その他
  Help as HelpIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

import { SvgIconComponent } from '@mui/icons-material';
import { OutlinedIcon } from '../presentation/components/common/OutlinedIcon';

// アイコン名とコンポーネントのマッピング
export const ICONS: { [key: string]: SvgIconComponent } = {
  // ナビゲーションとダッシュボード
  dashboard: DashboardIcon,
  menuBook: MenuBookIcon,
  school: SchoolIcon,
  assessment: AssessmentIcon,
  timeline: TimelineIcon,
  calendar: CalendarTodayIcon,
  assignment: AssignmentIcon,
  analytics: AnalyticsIcon,
  lightbulb: LightbulbIcon,
  bubbleChart: BubbleChartIcon,

  // 科目関連
  library: LibraryBooksIcon,
  books: AutoStoriesIcon,
  bookmarkOutline: BookmarkBorderIcon,
  bookmark: BookmarkIcon,

  // 学習進捗関連
  trending: TrendingUpIcon,
  event: EventIcon,
  eventNote: EventNoteIcon,
  schedule: ScheduleIcon,
  timer: TimerIcon,

  // 優先度関連
  flag: FlagIcon,
  flagOutlined: FlagOutlinedIcon,
  priorityHigh: PriorityHighIcon,

  // 戦略分析用
  strength: TrendingUpIcon,
  weakness: TrendingDownIcon,

  // アクション関連
  add: AddIcon,
  edit: EditIcon,
  delete: DeleteIcon,
  save: SaveIcon,
  cancel: CancelIcon,

  // 表示制御関連
  expandMore: ExpandMoreIcon,
  expandLess: ExpandLessIcon,
  visible: VisibilityIcon,
  invisible: VisibilityOffIcon,

  // 設定と操作関連
  settings: SettingsIcon,
  tune: TuneIcon,
  more: MoreVertIcon,
  arrowUp: ArrowUpwardIcon,
  arrowDown: ArrowDownwardIcon,
  dragHandle: DragIndicatorIcon,

  // ステータス関連
  complete: CheckCircleOutlineIcon,
  incomplete: RadioButtonUncheckedIcon,
  play: PlayCircleOutlineIcon,
  pause: PauseCircleOutlineIcon,

  // その他
  help: HelpIcon,
  info: InfoIcon,
  close: CloseIcon,
  refresh: RefreshIcon,
  search: SearchIcon,
};

// 機能に応じたアイコンのグループ
export const ICON_GROUPS = {
  navigation: ['dashboard', 'menuBook', 'timeline', 'calendar', 'settings'],
  subjects: ['library', 'books', 'bookmarkOutline', 'bookmark'],
  progress: ['trending', 'timer', 'schedule'],
  priority: ['flag', 'flagOutlined', 'priorityHigh'],
  actions: ['add', 'edit', 'delete', 'save', 'cancel'],
  status: ['complete', 'incomplete', 'play', 'pause'],
};

/**
 * アイコンのレンダリング用ヘルパー
 */
export const renderIcon = (
  iconName: string,
  size: 'small' | 'medium' | 'large' = 'medium',
  active = false,
  color?: string
) => {
  const IconComponent = ICONS[iconName];
  if (!IconComponent) return null;

  return <OutlinedIcon icon={IconComponent} size={size} active={active} color={color} />;
};

// ダッシュボードモジュール用アイコンの設定
export const MODULE_ICONS = {
  stats: ICONS.assessment,
  dailyQuota: ICONS.assignment,
  exams: ICONS.calendar,
  recentProgress: ICONS.timeline,
  priority: ICONS.flag,
  assignment: ICONS.assignment,
};
