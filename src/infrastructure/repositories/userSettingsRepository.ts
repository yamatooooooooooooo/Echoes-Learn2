import { UserSettings, UserSettingsUpdateInput, DEFAULT_USER_SETTINGS } from '../../domain/models/UserSettingsModel';
import { doc, getDoc, setDoc, updateDoc, Timestamp, Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
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
 * ユーザー設定のリポジトリクラス
 * Firestoreとのデータ連携を管理
 */
export class UserSettingsRepository {
  private db: Firestore;
  private auth: Auth;

  constructor(firestore: Firestore, auth: Auth) {
    this.db = firestore;
    this.auth = auth;
  }

  /**
   * ユーザー設定を取得する
   * ユーザーIDに紐づく設定が存在しない場合はデフォルト設定を作成して返す
   */
  async getUserSettings(): Promise<UserSettings> {
    try {
      const userId = this.auth.currentUser?.uid;
      
      if (!userId) {
        console.warn('ユーザーがログインしていません。デフォルト設定を使用します。');
        return {
          ...DEFAULT_USER_SETTINGS,
          id: 'default',
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      
      const settingsRef = doc(this.db, 'userSettings', userId);
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        return {
          ...data,
          id: settingsDoc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as UserSettings;
      } else {
        // ユーザーの設定がまだ存在しない場合、デフォルト設定を作成して保存
        const defaultSettings = {
          ...DEFAULT_USER_SETTINGS,
          id: userId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        
        // 確実に保存するために非同期処理を待機
        await setDoc(settingsRef, defaultSettings);
        
        return {
          ...defaultSettings,
          createdAt: defaultSettings.createdAt.toDate(),
          updatedAt: defaultSettings.updatedAt.toDate()
        };
      }
    } catch (error) {
      console.error('ユーザー設定の取得に失敗しました:', error);
      // エラーが発生した場合もデフォルト設定を返す
      return {
        ...DEFAULT_USER_SETTINGS,
        id: 'default',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }

  /**
   * ユーザー設定を更新する
   * @param settings 更新するユーザー設定データ
   */
  async updateUserSettings(settings: UserSettingsUpdateInput): Promise<void> {
    try {
      const userId = this.auth.currentUser?.uid;
      
      if (!userId) {
        throw new Error('ユーザーがログインしていません。設定を更新できません。');
      }
      
      const settingsRef = doc(this.db, 'userSettings', userId);
      
      // 既存の設定を取得し、存在するかどうかを確認
      const settingsDoc = await getDoc(settingsRef);
      const updateData = {
        ...settings,
        updatedAt: Timestamp.now()
      };
      
      if (settingsDoc.exists()) {
        // 既存の設定を更新
        await updateDoc(settingsRef, updateData);
      } else {
        // 設定が存在しなければ、新規に作成
        const newSettings = {
          ...DEFAULT_USER_SETTINGS,
          ...settings,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        await setDoc(settingsRef, newSettings);
      }
      
      // デバッグ用にログ出力
      console.log('ユーザー設定を保存しました:', userId);
      
      // 確実に保存されたことを確認するための追加チェック
      const verifyDoc = await getDoc(settingsRef);
      if (!verifyDoc.exists()) {
        console.error('設定の保存確認に失敗しました。再試行します。');
        // 再度保存を試みる
        await setDoc(settingsRef, {
          ...DEFAULT_USER_SETTINGS,
          ...settings,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('ユーザー設定の更新に失敗しました:', error);
      throw error;
    }
  }

  /**
   * ユーザー設定をデフォルトにリセットする
   */
  async resetToDefaults(): Promise<UserSettings> {
    try {
      const userId = this.auth.currentUser?.uid;
      
      if (!userId) {
        throw new Error('ユーザーがログインしていません。設定をリセットできません。');
      }
      
      const settingsRef = doc(this.db, 'userSettings', userId);
      const defaultSettings = {
        ...DEFAULT_USER_SETTINGS,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      // デフォルト設定で上書き
      await setDoc(settingsRef, defaultSettings);
      
      return {
        ...defaultSettings,
        id: userId,
        createdAt: defaultSettings.createdAt.toDate(),
        updatedAt: defaultSettings.updatedAt.toDate()
      };
    } catch (error) {
      console.error('ユーザー設定のリセットに失敗しました:', error);
      throw error;
    }
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