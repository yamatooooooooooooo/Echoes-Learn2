import { useState, useEffect, useCallback, useMemo } from 'react';
import { useServices } from '../contexts/ServicesContext';
import {
  UserSettings,
  DEFAULT_USER_SETTINGS,
  UserSettingsUpdateInput,
} from '../domain/models/UserSettingsModel';

/**
 * ユーザー設定を取得・更新するためのカスタムフック
 */
export const useUserSettings = () => {
  const { userSettingsRepository } = useServices();
  const defaultSettings = useMemo(
    () => ({
      ...DEFAULT_USER_SETTINGS,
      id: 'default',
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    []
  ); // 空の依存配列でメモ化

  const [userSettings, setUserSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // ユーザー設定の取得
  const fetchUserSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const settings = await userSettingsRepository.getUserSettings();
      setUserSettings(settings);
    } catch (err) {
      console.error('ユーザー設定の取得に失敗しました:', err);
      setError(err instanceof Error ? err : new Error('ユーザー設定の取得に失敗しました'));
      // エラー時はデフォルト設定を使用
      setUserSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  }, [userSettingsRepository, defaultSettings]);

  // ユーザー設定の更新
  const updateUserSettings = useCallback(
    async (newSettings: UserSettingsUpdateInput) => {
      setIsLoading(true);
      setError(null);
      try {
        // リポジトリの更新メソッドを呼び出し
        await userSettingsRepository.updateUserSettings(newSettings);

        // 更新成功後に最新の設定を取得
        const updatedSettings = await userSettingsRepository.getUserSettings();
        setUserSettings(updatedSettings);
        return updatedSettings;
      } catch (err) {
        console.error('ユーザー設定の更新に失敗しました:', err);
        setError(err instanceof Error ? err : new Error('ユーザー設定の更新に失敗しました'));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userSettingsRepository]
  );

  // コンポーネントマウント時に設定を取得
  useEffect(() => {
    fetchUserSettings();
  }, [fetchUserSettings]);

  return {
    userSettings,
    isLoading,
    error,
    fetchUserSettings,
    updateUserSettings,
  };
};
