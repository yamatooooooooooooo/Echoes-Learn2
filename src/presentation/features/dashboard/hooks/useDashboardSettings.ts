import { useState, useEffect, useCallback } from 'react';
import { useFirebase } from '../../../../contexts/FirebaseContext';
import { DASHBOARD_MODULES } from '../../../../config/dashboardModules';
import { FirebaseUserSettingsRepository } from '../../../../infrastructure/repositories/userSettingsRepository';

// モジュール設定の型定義
export interface ModuleSettings {
  [moduleId: string]: {
    enabled: boolean;
    order: number;
    collapsed: boolean;
  };
}

// デフォルトのモジュール設定を取得
const getDefaultModuleSettings = (): ModuleSettings => {
  const settings: ModuleSettings = {};
  Object.entries(DASHBOARD_MODULES).forEach(([key, module]) => {
    settings[key] = {
      enabled: module.defaultEnabled,
      order: module.order,
      collapsed: module.defaultCollapsed
    };
  });
  return settings;
};

/**
 * ダッシュボード設定を管理するカスタムフック
 */
export const useDashboardSettings = () => {
  // Firebaseサービスを取得
  const { firestore, auth } = useFirebase();
  
  // モジュールの設定状態
  const [moduleSettings, setModuleSettings] = useState<ModuleSettings>(getDefaultModuleSettings());
  // 保存処理中の状態
  const [isSaving, setIsSaving] = useState(false);
  // 通知関連の状態
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // ユーザー設定
  const [settings, setSettings] = useState<any>({});

  /**
   * モジュールが表示可能かチェックする
   * @param moduleId モジュールID
   */
  const isVisibleModule = useCallback((moduleId: string): boolean => {
    return moduleSettings[moduleId]?.enabled ?? false;
  }, [moduleSettings]);

  /**
   * 保存された設定を読み込む
   */
  const loadSavedSettings = useCallback(async () => {
    try {
      // まずLocalStorageから読み込み
      const savedSettings = localStorage.getItem('dashboardModuleSettings');
      if (savedSettings) {
        setModuleSettings(JSON.parse(savedSettings));
        return;
      }
      
      // LocalStorageになければFirestoreから読み込む試行
      const app = { firestore, auth } as any;
      const userSettingsRepo = new FirebaseUserSettingsRepository(firestore, auth);
      const settings = await userSettingsRepo.getDashboardSettings();
      
      if (settings && settings.moduleSettings) {
        setModuleSettings(settings.moduleSettings);
        // LocalStorageにも保存
        localStorage.setItem('dashboardModuleSettings', JSON.stringify(settings.moduleSettings));
      }
    } catch (error) {
      console.error('ダッシュボード設定の読み込みに失敗しました:', error);
      // デフォルト設定を使用
      setModuleSettings(getDefaultModuleSettings());
    }
  }, [firestore, auth]);
  
  // 初期化時に保存された設定を読み込む
  useEffect(() => {
    loadSavedSettings();
  }, [loadSavedSettings]);
  
  /**
   * 設定を保存する
   */
  const saveSettings = async () => {
    setIsSaving(true);
    
    try {
      // まずLocalStorageに保存
      localStorage.setItem('dashboardModuleSettings', JSON.stringify(moduleSettings));
      
      // Firestoreにも保存
      const app = { firestore, auth } as any;
      const userSettingsRepo = new FirebaseUserSettingsRepository(firestore, auth);
      await userSettingsRepo.saveDashboardSettings({ moduleSettings });
      
      setSnackbarMessage('設定が保存されました');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
      setSnackbarMessage('設定の保存に失敗しました');
      setSnackbarOpen(true);
    } finally {
      setIsSaving(false);
    }
  };
  
  /**
   * モジュールの有効/無効を切り替える
   */
  const toggleModuleEnabled = (moduleId: string) => {
    setModuleSettings(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        enabled: !prev[moduleId]?.enabled
      }
    }));
  };
  
  /**
   * モジュールの表示/非表示を切り替える
   */
  const toggleModuleCollapsed = (moduleId: string) => {
    setModuleSettings(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        collapsed: !prev[moduleId]?.collapsed
      }
    }));
  };
  
  /**
   * ドラッグ＆ドロップ後の順序を更新
   */
  const updateModulesOrder = (sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex) return;
    
    // 並び順を更新
    const updatedSettings = { ...moduleSettings };
    const moduleKeys = Object.keys(updatedSettings).filter(key => updatedSettings[key].enabled);
    
    // ドラッグしたモジュールのID
    const draggedModuleId = moduleKeys[sourceIndex];
    
    // ソート順の更新
    moduleKeys.forEach(moduleId => {
      const currentOrder = updatedSettings[moduleId].order;
      
      if (moduleId === draggedModuleId) {
        // ドラッグしたモジュールを移動先の位置に
        updatedSettings[moduleId].order = destinationIndex;
      } else if (
        sourceIndex < destinationIndex && 
        currentOrder > sourceIndex && 
        currentOrder <= destinationIndex
      ) {
        // 前から後ろに移動した場合、間のモジュールを1つ前に
        updatedSettings[moduleId].order--;
      } else if (
        sourceIndex > destinationIndex && 
        currentOrder < sourceIndex && 
        currentOrder >= destinationIndex
      ) {
        // 後ろから前に移動した場合、間のモジュールを1つ後ろに
        updatedSettings[moduleId].order++;
      }
    });
    
    setModuleSettings(updatedSettings);
  };
  
  /**
   * デフォルト設定に戻す
   */
  const resetToDefaults = () => {
    setModuleSettings(getDefaultModuleSettings());
    setSnackbarMessage('デフォルト設定に戻しました');
    setSnackbarOpen(true);
  };
  
  return {
    moduleSettings,
    isSaving,
    snackbarOpen,
    snackbarMessage,
    setSnackbarOpen,
    saveSettings,
    toggleModuleEnabled,
    toggleModuleCollapsed,
    updateModulesOrder,
    resetToDefaults,
    settings,
    isVisibleModule
  };
}; 