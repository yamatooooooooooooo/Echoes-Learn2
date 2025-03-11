import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { 
  UserSettings, 
  UserSettingsUpdateInput, 
  DEFAULT_USER_SETTINGS 
} from '../../domain/models/UserSettingsModel';
import { ModuleSettings } from '../../presentation/features/dashboard/hooks/useDashboardSettings';
import { getDefaultModuleSettings } from '../../config/dashboardModules';

/**
 * ダッシュボード設定の型定義
 */
interface DashboardSettings {
  moduleSettings: ModuleSettings;
}

// モックユーザー設定
const MOCK_USER_SETTINGS: UserSettings = {
  id: 'user-settings-1',
  ...DEFAULT_USER_SETTINGS,
  themeMode: 'system',
  createdAt: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
  updatedAt: new Date()
};

// モックダッシュボード設定
const MOCK_DASHBOARD_SETTINGS: DashboardSettings = {
  moduleSettings: getDefaultModuleSettings()
};

/**
 * ユーザー設定を管理するリポジトリ
 */
export class UserSettingsRepository {
  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {}

  /**
   * ユーザー設定を取得
   */
  async getUserSettings(): Promise<UserSettings> {
    const userId = this.auth.currentUser?.uid || 'current-user';
    console.log('ユーザー設定を取得中...', userId);

    // モックデータを返す
    return {
      ...MOCK_USER_SETTINGS,
      id: userId
    };
  }

  /**
   * ユーザー設定を更新
   */
  async updateUserSettings(settings: UserSettingsUpdateInput): Promise<void> {
    const userId = this.auth.currentUser?.uid || 'current-user';
    console.log('ユーザー設定を更新中...', userId, settings);

    // モックデータの更新（実際には保存されない）
    Object.assign(MOCK_USER_SETTINGS, settings, {
      updatedAt: new Date()
    });
  }

  /**
   * ユーザー設定をデフォルトにリセット
   */
  async resetToDefaults(): Promise<UserSettings> {
    const userId = this.auth.currentUser?.uid || 'current-user';
    console.log('ユーザー設定をリセット中...', userId);

    // モックデータをリセット
    Object.assign(MOCK_USER_SETTINGS, DEFAULT_USER_SETTINGS, {
      id: userId,
      updatedAt: new Date()
    });

    return {
      ...MOCK_USER_SETTINGS,
      id: userId
    };
  }

  /**
   * ダッシュボード設定を取得
   */
  async getDashboardSettings(): Promise<DashboardSettings | null> {
    const userId = this.auth.currentUser?.uid || 'current-user';
    console.log('ダッシュボード設定を取得中...', userId);

    // モックデータを返す
    return { ...MOCK_DASHBOARD_SETTINGS };
  }

  /**
   * ダッシュボード設定を保存
   */
  async saveDashboardSettings(settings: DashboardSettings): Promise<void> {
    const userId = this.auth.currentUser?.uid || 'current-user';
    console.log('ダッシュボード設定を保存中...', userId, settings);

    // モックデータの更新（実際には保存されない）
    Object.assign(MOCK_DASHBOARD_SETTINGS, settings);
  }
} 