import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Slider,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Tooltip,
  IconButton
} from '@mui/material';
import { useServices } from '../../../../hooks/useServices';
import { 
  UserSettings, 
  UserSettingsUpdateInput,
  DEFAULT_USER_SETTINGS 
} from '../../../../domain/models/UserSettingsModel';
import InfoIcon from '@mui/icons-material/Info';

// 設定項目の型定義
interface SettingItemProps {
  title: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSliderChange: (event: Event, newValue: number | number[]) => void;
  helpText: string;
}

// メモ化された設定項目コンポーネント
const SettingItem = React.memo<SettingItemProps>(({ 
  title, 
  value, 
  min, 
  max, 
  step, 
  disabled, 
  onChange, 
  onSliderChange,
  helpText 
}) => {
  return (
    <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1, height: '100%' }}>
      <Typography variant="body1" gutterBottom fontWeight="medium">
        {title}
      </Typography>
      <Box display="flex" alignItems="center">
        <Slider
          value={value}
          onChange={onSliderChange}
          step={step}
          marks
          min={min}
          max={max}
          valueLabelDisplay="auto"
          disabled={disabled}
          sx={{ flexGrow: 1, mr: 2 }}
        />
        <TextField
          value={value}
          onChange={onChange}
          type="number"
          InputProps={{ inputProps: { min, max, step } }}
          disabled={disabled}
          sx={{ width: 80 }}
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.8rem' }}>
        {helpText}
      </Typography>
    </Box>
  );
});

SettingItem.displayName = 'SettingItem';

/**
 * ユーザー設定フォームコンポーネント
 * 同時並行科目数、1日の目標学習時間などを設定する
 */
export const UserSettingsForm: React.FC = () => {
  const { userSettingsRepository } = useServices();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<UserSettings>({
    id: '',
    ...DEFAULT_USER_SETTINGS
  } as UserSettings);
  
  // 設定データの読み込み
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const settings = await userSettingsRepository.getUserSettings();
        setSettings(settings);
      } catch (err) {
        setError('設定の読み込みに失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [userSettingsRepository]);
  
  // フォーム入力処理 - メモ化して最適化
  const handleChange = useCallback((name: keyof UserSettingsUpdateInput) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(event.target.value) || 0;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);
  
  // スライダー入力処理 - メモ化して最適化
  const handleSliderChange = useCallback((name: keyof UserSettingsUpdateInput) => (
    _: Event,
    newValue: number | number[]
  ) => {
    const value = typeof newValue === 'number' ? newValue : newValue[0];
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);
  
  // フォーム送信処理
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const updateData: UserSettingsUpdateInput = {
        maxConcurrentSubjects: settings.maxConcurrentSubjects,
        dailyStudyHours: settings.dailyStudyHours,
        studyDaysPerWeek: settings.studyDaysPerWeek,
        averagePageReadingTime: settings.averagePageReadingTime
      };
      
      await userSettingsRepository.updateUserSettings(updateData);
      setSuccess('設定を保存しました');
    } catch (err) {
      setError('設定の保存に失敗しました');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [settings, userSettingsRepository]);
  
  // デフォルト設定に戻す
  const handleReset = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const defaultSettings = await userSettingsRepository.resetToDefaults();
      setSettings(defaultSettings);
      setSuccess('設定をデフォルトに戻しました');
    } catch (err) {
      setError('設定のリセットに失敗しました');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [userSettingsRepository]);

  // メモ化された科目学習設定項目
  const subjectSettingsItems = useMemo(() => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <SettingItem
          title="同時学習科目数上限"
          value={settings.maxConcurrentSubjects}
          min={1}
          max={10}
          step={1}
          disabled={saving}
          onChange={handleChange('maxConcurrentSubjects')}
          onSliderChange={handleSliderChange('maxConcurrentSubjects')}
          helpText="一度に並行して学習する科目の数です。同時に多くの科目を学習すると1科目あたりの時間が減ります。"
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <SettingItem
          title="1日の目標学習時間（時間）"
          value={settings.dailyStudyHours}
          min={0.5}
          max={8}
          step={0.5}
          disabled={saving}
          onChange={handleChange('dailyStudyHours')}
          onSliderChange={handleSliderChange('dailyStudyHours')}
          helpText="1日に確保できる学習時間の合計です。現実的な時間を設定することで計画が立てやすくなります。"
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <SettingItem
          title="週あたりの学習日数"
          value={settings.studyDaysPerWeek}
          min={1}
          max={7}
          step={1}
          disabled={saving}
          onChange={handleChange('studyDaysPerWeek')}
          onSliderChange={handleSliderChange('studyDaysPerWeek')}
          helpText="1週間のうち、何日学習に充てられるかを設定します。これにより週ごとのノルマが計算されます。"
        />
      </Grid>
    </Grid>
  ), [settings, saving, handleChange, handleSliderChange]);

  // メモ化された学習進捗設定項目
  const progressSettingsItems = useMemo(() => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <SettingItem
          title="1ページあたりの平均学習時間（分）"
          value={settings.averagePageReadingTime}
          min={1}
          max={15}
          step={1}
          disabled={saving}
          onChange={handleChange('averagePageReadingTime')}
          onSliderChange={handleSliderChange('averagePageReadingTime')}
          helpText="教科書や参考書の1ページあたりの平均学習時間です。この値は予想学習時間の計算に使用されます。科目の難易度によって調整することをおすすめします。"
        />
      </Grid>
    </Grid>
  ), [settings, saving, handleChange, handleSliderChange]);
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ maxWidth: '100%' }}>
      <Typography variant="h5" gutterBottom>
        学習設定
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        科目の学習計画とノルマ計算に影響する設定です。ご自身の学習スタイルに合わせて調整してください。
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Card variant="outlined" sx={{ mb: 4, bgcolor: 'background.paper' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" color="primary">
                科目学習に関する設定
              </Typography>
              <Tooltip title="同時に学習する科目数と1日の学習時間を設定します。これらの値はノルマ計算に影響します。">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            
            {subjectSettingsItems}
          </CardContent>
        </Card>
        
        <Card variant="outlined" sx={{ mb: 4, bgcolor: 'background.paper' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" color="primary">
                学習進捗に関する設定
              </Typography>
              <Tooltip title="読書や学習のペースに関する設定です。これにより学習時間の予測が計算されます。">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            
            {progressSettingsItems}
          </CardContent>
        </Card>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={handleReset}
            disabled={saving}
          >
            デフォルトに戻す
          </Button>
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={saving}
          >
            {saving ? '保存中...' : '設定を保存'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}; 