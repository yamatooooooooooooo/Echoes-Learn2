import { UserSettings } from '../models/UserSettingsModel';

/**
 * ユーザー設定リポジトリのインターフェース
 */
export interface UserSettingsRepository {
  /**
   * ユーザー設定を取得する
   */
  getUserSettings(): Promise<UserSettings>;
  
  /**
   * ユーザー設定を更新する
   * @param settings 更新するユーザー設定
   */
  updateUserSettings(settings: Partial<UserSettings>): Promise<void>;
  
  /**
   * ユーザー設定をデフォルトにリセットする
   */
  resetToDefaults(): Promise<UserSettings>;
} 