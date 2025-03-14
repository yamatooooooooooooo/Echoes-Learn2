import {
  UserSettings,
  UserSettingsUpdateInput,
  DEFAULT_USER_SETTINGS,
} from '../../domain/models/UserSettingsModel';
import { FirebaseApp } from 'firebase/app';
import {
  Firestore,
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { Auth, getAuth } from 'firebase/auth';
import { ModuleSettings } from '../../presentation/features/dashboard/hooks/useDashboardSettings';
import { getDefaultModuleSettings } from '../../config/dashboardModules';
import { UserSettingsRepository } from '../../domain/repositories/UserSettingsRepository';

// UserSettingsRepositoryインターフェースを再エクスポート
export type { UserSettingsRepository } from '../../domain/repositories/UserSettingsRepository';

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
  updatedAt: new Date(),
};

// モックダッシュボード設定
const MOCK_DASHBOARD_SETTINGS: DashboardSettings = {
  moduleSettings: getDefaultModuleSettings(),
};

/**
 * ユーザー設定リポジトリの Firebase 実装
 */
export class FirebaseUserSettingsRepository implements UserSettingsRepository {
  private firestore: Firestore;
  private auth: Auth;

  constructor(app: FirebaseApp);
  constructor(firestore: Firestore, auth: Auth);
  constructor(appOrFirestore: FirebaseApp | Firestore, authParam?: Auth) {
    if ('options' in appOrFirestore) {
      // FirebaseAppが渡された場合
      this.firestore = getFirestore(appOrFirestore);
      this.auth = getAuth(appOrFirestore);
    } else {
      // FirestoreとAuthが直接渡された場合
      this.firestore = appOrFirestore;
      this.auth = authParam!;
    }
  }

  /**
   * ユーザー設定を取得する
   * @returns ユーザー設定
   */
  async getUserSettings(): Promise<UserSettings> {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        console.log('ユーザーが認証されていません。デフォルト設定を返します。');
        return {
          ...DEFAULT_USER_SETTINGS,
          id: 'default',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      const settingsRef = doc(this.firestore, 'userSettings', currentUser.uid);
      const settingsSnap = await getDoc(settingsRef);

      if (settingsSnap.exists()) {
        console.log('既存の設定を取得しました。');
        const data = settingsSnap.data();
        // 型安全のため、すべてのデフォルト値をマージ
        return {
          ...DEFAULT_USER_SETTINGS,
          ...data,
          id: settingsSnap.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as UserSettings;
      } else {
        console.log('設定がまだ作成されていません。デフォルト設定を作成します。');
        // デフォルト設定を作成
        await this.createDefaultSettings(currentUser.uid);
        return {
          ...DEFAULT_USER_SETTINGS,
          id: currentUser.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    } catch (error) {
      console.error('設定の取得中にエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * ユーザー設定を更新する
   * @param settings 更新するユーザー設定
   */
  async updateUserSettings(settings: Partial<UserSettings>): Promise<void> {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        console.error('ユーザーが認証されていません。設定を更新できません。');
        throw new Error('ユーザーが認証されていていません');
      }

      console.log('設定更新を開始します。ユーザーID:', currentUser.uid);

      const settingsRef = doc(this.firestore, 'userSettings', currentUser.uid);
      const settingsSnap = await getDoc(settingsRef);

      // nullやundefinedを含む可能性のあるフィールドを削除
      const cleanSettings = Object.entries(settings).reduce(
        (acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, any>
      );

      // 最終更新日時を追加
      cleanSettings.updatedAt = serverTimestamp();

      if (settingsSnap.exists()) {
        // 既存の設定を更新
        console.log('既存の設定を更新します:', cleanSettings);

        try {
          await setDoc(settingsRef, cleanSettings, { merge: true });
          console.log('設定の更新が完了しました');
        } catch (updateError) {
          console.error('設定の更新中にエラーが発生しました:', updateError);
          throw updateError;
        }
      } else {
        // 新しい設定を作成
        console.log('設定が存在しないため、新しい設定を作成します:', cleanSettings);

        const newSettings = {
          ...DEFAULT_USER_SETTINGS,
          ...cleanSettings,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        try {
          await setDoc(settingsRef, newSettings);
          console.log('新しい設定の作成が完了しました');
        } catch (createError) {
          console.error('新しい設定の作成中にエラーが発生しました:', createError);
          throw createError;
        }
      }
    } catch (error) {
      console.error('設定の更新処理でエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * デフォルト設定の作成
   * @param userId ユーザーID
   */
  private async createDefaultSettings(userId: string): Promise<void> {
    try {
      const settingsRef = doc(this.firestore, 'userSettings', userId);

      const defaultData = {
        ...DEFAULT_USER_SETTINGS,
        id: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(settingsRef, defaultData);
      console.log('デフォルト設定の作成が完了しました');
    } catch (error) {
      console.error('デフォルト設定の作成中にエラーが発生しました:', error);
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

      const settingsRef = doc(this.firestore, 'userSettings', userId);
      const defaultSettings = {
        ...DEFAULT_USER_SETTINGS,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // デフォルト設定で上書き
      await setDoc(settingsRef, defaultSettings);

      return {
        ...defaultSettings,
        id: userId,
        createdAt: defaultSettings.createdAt.toDate(),
        updatedAt: defaultSettings.updatedAt.toDate(),
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
