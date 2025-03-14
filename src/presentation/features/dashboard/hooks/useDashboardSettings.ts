import { useState, useCallback } from 'react';

// モジュール設定の型定義
export interface ModuleSettings {
  [moduleId: string]: {
    enabled: boolean;
    order: number;
    collapsed: boolean;
  };
}

/**
 * ダッシュボード設定を管理するカスタムフック
 * ユーザーのカード表示設定を保存・読み込みする機能を提供
 */
export const useDashboardSettings = () => {
  // 設定の状態を管理
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [moduleSettings, setModuleSettings] = useState<ModuleSettings>({});

  // カードの表示/非表示を切り替える
  const toggleCard = useCallback((cardId: string) => {
    setModuleSettings((prev) => {
      if (!prev[cardId]) return prev;

      return {
        ...prev,
        [cardId]: {
          ...prev[cardId],
          enabled: !prev[cardId].enabled,
        },
      };
    });
  }, []);

  // モジュールの有効/無効を切り替える
  const toggleModuleEnabled = useCallback((moduleId: string) => {
    setModuleSettings((prev) => {
      if (!prev[moduleId]) {
        // 新しいモジュールの場合は追加
        return {
          ...prev,
          [moduleId]: {
            enabled: true,
            order: Object.keys(prev).length + 1,
            collapsed: false,
          },
        };
      }

      return {
        ...prev,
        [moduleId]: {
          ...prev[moduleId],
          enabled: !prev[moduleId].enabled,
        },
      };
    });
  }, []);

  // モジュールの折りたたみ状態を切り替える
  const toggleModuleCollapsed = useCallback((moduleId: string, isCollapsed: boolean) => {
    setModuleSettings((prev) => {
      if (!prev[moduleId]) return prev;

      return {
        ...prev,
        [moduleId]: {
          ...prev[moduleId],
          collapsed: isCollapsed,
        },
      };
    });
  }, []);

  // モジュールの順序を更新
  const updateModulesOrder = useCallback((sourceIndex: number, destinationIndex: number) => {
    setModuleSettings((prev) => {
      const moduleIds = Object.entries(prev)
        .filter(([_, settings]) => settings.enabled)
        .sort((a, b) => a[1].order - b[1].order)
        .map(([id]) => id);

      if (
        sourceIndex < 0 ||
        sourceIndex >= moduleIds.length ||
        destinationIndex < 0 ||
        destinationIndex >= moduleIds.length
      ) {
        return prev;
      }

      // 並べ替え
      const [moved] = moduleIds.splice(sourceIndex, 1);
      moduleIds.splice(destinationIndex, 0, moved);

      // 新しい順序を適用
      const newSettings = { ...prev };
      moduleIds.forEach((id, index) => {
        newSettings[id] = {
          ...newSettings[id],
          order: index + 1,
        };
      });

      return newSettings;
    });
  }, []);

  // 設定を保存する関数
  const saveSettings = useCallback(async () => {
    try {
      setIsSaving(true);
      // TODO: 実際のストレージに設定を保存する処理を実装

      // 保存成功の通知
      setSnackbarMessage('ダッシュボード設定が保存されました');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('設定の保存中にエラーが発生しました', error);
      setSnackbarMessage('設定の保存に失敗しました');
      setSnackbarOpen(true);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // デフォルト設定に戻す関数
  const resetToDefaults = useCallback(async () => {
    try {
      setIsSaving(true);
      // TODO: デフォルト設定に戻す処理を実装

      setSnackbarMessage('設定をデフォルトに戻しました');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('デフォルト設定の復元中にエラーが発生しました', error);
      setSnackbarMessage('デフォルト設定の復元に失敗しました');
      setSnackbarOpen(true);
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    moduleSettings,
    toggleCard,
    toggleModuleEnabled,
    toggleModuleCollapsed,
    updateModulesOrder,
    isSaving,
    snackbarOpen,
    snackbarMessage,
    setSnackbarOpen,
    saveSettings,
    resetToDefaults,
  };
};
