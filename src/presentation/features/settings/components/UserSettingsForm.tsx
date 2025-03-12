import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Slider,
  FormControl,
  FormHelperText,
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
  
  // フォーム入力処理
  const handleChange = (name: keyof UserSettingsUpdateInput) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(event.target.value) || 0;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // スライダー入力処理
  const handleSliderChange = (name: keyof UserSettingsUpdateInput) => (
    _: Event,
    newValue: number | number[]
  ) => {
    const value = typeof newValue === 'number' ? newValue : newValue[0];
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // フォーム送信処理
  const handleSubmit = async (event: React.FormEvent) => {
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
  };
  
  // デフォルト設定に戻す
  const handleReset = async () => {
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
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
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
                ノルマ計算に関する設定
              </Typography>
              <Tooltip title="これらの設定は日々のノルマや週間ノルマの計算に直接影響します。実際の学習スタイルに合わせて調整することで、より現実的な計画が立てられます。">
                <IconButton size="small" sx={{ ml: 1, color: 'info.main' }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="body1" gutterBottom>
                  同時並行して学習する科目数
                </Typography>
                <Box display="flex" alignItems="center">
                  <Slider
                    value={settings.maxConcurrentSubjects}
                    onChange={handleSliderChange('maxConcurrentSubjects')}
                    step={1}
                    marks
                    min={1}
                    max={10}
                    valueLabelDisplay="auto"
                    disabled={saving}
                    sx={{ flexGrow: 1, mr: 2 }}
                  />
                  <TextField
                    value={settings.maxConcurrentSubjects}
                    onChange={handleChange('maxConcurrentSubjects')}
                    type="number"
                    InputProps={{ inputProps: { min: 1, max: 10 } }}
                    disabled={saving}
                    sx={{ width: 80 }}
                  />
                </Box>
                <FormHelperText>
                  同時に学習する科目の最大数です。優先度の高い科目から選択され、日々のノルマ計算対象になります。<strong>多すぎると分散してしまうため、3〜5科目程度をおすすめします。</strong>
                </FormHelperText>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body1" gutterBottom>
                  週に学習する日数
                </Typography>
                <Box display="flex" alignItems="center">
                  <Slider
                    value={settings.studyDaysPerWeek}
                    onChange={handleSliderChange('studyDaysPerWeek')}
                    step={1}
                    marks
                    min={1}
                    max={7}
                    valueLabelDisplay="auto"
                    disabled={saving}
                    sx={{ flexGrow: 1, mr: 2 }}
                  />
                  <TextField
                    value={settings.studyDaysPerWeek}
                    onChange={handleChange('studyDaysPerWeek')}
                    type="number"
                    InputProps={{ inputProps: { min: 1, max: 7 } }}
                    disabled={saving}
                    sx={{ width: 80 }}
                  />
                </Box>
                <FormHelperText>
                  週に何日学習するかを設定します。ウィークリーノルマの計算に使用され、<strong>1日あたりの負担を均等に分散</strong>するために重要です。現実的な日数を設定してください。
                </FormHelperText>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body1" gutterBottom>
                  1日の目標学習時間（時間）
                </Typography>
                <Box display="flex" alignItems="center">
                  <Slider
                    value={settings.dailyStudyHours}
                    onChange={handleSliderChange('dailyStudyHours')}
                    step={0.5}
                    marks
                    min={0.5}
                    max={12}
                    valueLabelDisplay="auto"
                    disabled={saving}
                    sx={{ flexGrow: 1, mr: 2 }}
                  />
                  <TextField
                    value={settings.dailyStudyHours}
                    onChange={handleChange('dailyStudyHours')}
                    type="number"
                    InputProps={{ inputProps: { min: 0.5, max: 12, step: 0.5 } }}
                    disabled={saving}
                    sx={{ width: 80 }}
                  />
                </Box>
                <FormHelperText>
                  1日あたりの最低学習時間です。この時間をもとにノルマが計算されます。<strong>科目ごとの学習時間配分は優先度に応じて調整</strong>されます。無理のない時間を設定してください。
                </FormHelperText>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        <Card variant="outlined" sx={{ mb: 4, bgcolor: 'background.paper' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" color="primary">
                学習進捗に関する設定
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="body1" gutterBottom>
                  1ページあたりの平均学習時間（分）
                </Typography>
                <Box display="flex" alignItems="center">
                  <Slider
                    value={settings.averagePageReadingTime}
                    onChange={handleSliderChange('averagePageReadingTime')}
                    step={1}
                    marks
                    min={1}
                    max={15}
                    valueLabelDisplay="auto"
                    disabled={saving}
                    sx={{ flexGrow: 1, mr: 2 }}
                  />
                  <TextField
                    value={settings.averagePageReadingTime}
                    onChange={handleChange('averagePageReadingTime')}
                    type="number"
                    InputProps={{ inputProps: { min: 1, max: 15 } }}
                    disabled={saving}
                    sx={{ width: 80 }}
                  />
                </Box>
                <FormHelperText>
                  教科書や参考書の1ページあたりの平均学習時間です。この値は予想学習時間の計算に使用されます。科目の難易度によって調整することをおすすめします。
                </FormHelperText>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined"
            color="warning"
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
    </Paper>
  );
}; 