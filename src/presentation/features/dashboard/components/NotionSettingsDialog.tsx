import React, { useState } from 'react';
import { DashboardSettingsDialog } from './DashboardSettingsDialog';

interface NotionSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  moduleSettings: Record<string, any>;
  saveSettings: (settings: any) => void;
}

/**
 * NotionDashboard用のDashboardSettingsDialogラッパー
 */
const NotionSettingsDialog: React.FC<NotionSettingsDialogProps> = ({
  open,
  onClose,
  moduleSettings,
  saveSettings,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // 仮のトグル関数
  const handleToggleModuleEnabled = (moduleId: string) => {
    const newSettings = { ...moduleSettings };
    if (!newSettings[moduleId]) {
      newSettings[moduleId] = { enabled: true };
    } else {
      newSettings[moduleId] = {
        ...newSettings[moduleId],
        enabled: !newSettings[moduleId].enabled,
      };
    }
    saveSettings(newSettings);
  };

  // リセット関数
  const handleResetToDefaults = () => {
    // デフォルト設定
    const defaultSettings = Object.keys(moduleSettings).reduce((acc, key) => {
      acc[key] = { enabled: true, collapsed: false };
      return acc;
    }, {} as Record<string, any>);
    saveSettings(defaultSettings);
  };

  // 保存関数
  const handleSaveSettings = () => {
    saveSettings(moduleSettings);
    onClose();
  };

  return (
    <DashboardSettingsDialog
      open={open}
      onClose={onClose}
      moduleSettings={moduleSettings}
      toggleModuleEnabled={handleToggleModuleEnabled}
      resetToDefaults={handleResetToDefaults}
      saveSettings={handleSaveSettings}
      isSaving={isLoading}
    />
  );
};

export default NotionSettingsDialog; 