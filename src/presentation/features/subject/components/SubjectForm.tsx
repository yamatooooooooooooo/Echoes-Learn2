import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent,
  Chip,
  Switch,
  FormControlLabel,
  InputAdornment
} from '@mui/material';
import { Flag as FlagIcon } from '@mui/icons-material';
import { SubjectCreateInput, Subject } from '../../../../domain/models/SubjectModel';
import { calculatePriority } from '../utils/subjectUtils';

interface SubjectFormProps {
  subject?: Subject | null;
  onSubmit: (data: SubjectCreateInput) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const SubjectForm = ({ 
  subject,
  onSubmit, 
  onCancel, 
  isLoading = false,
  error = null
}: SubjectFormProps) => {
  const [formData, setFormData] = useState<SubjectCreateInput>({
    name: '',
    totalPages: 0,
    examDate: new Date(),
    textbookName: '',
    reportDeadline: undefined,
    deadlineType: 'report',
    reportDetails: '',
    priority: 'medium',
    bufferDays: 7
  });

  const [manualPriority, setManualPriority] = useState(false);
  
  const [errors, setErrors] = useState<{
    name?: string;
    totalPages?: string;
    examDate?: string;
    textbookName?: string;
    reportDeadline?: string;
    priority?: string;
    bufferDays?: string;
  }>({});

  // 科目が渡されたら、フォームを初期化
  useEffect(() => {
    if (subject) {
      // 試験日が有効かどうかチェック
      let examDate: Date | null = null;
      try {
        if (subject.examDate) {
          const dateObj = new Date(subject.examDate);
          // 日付が有効かどうかチェック
          if (!isNaN(dateObj.getTime())) {
            examDate = dateObj;
          }
        }
      } catch (error) {
        console.error('Invalid date in subject:', error);
      }

      // リポート締め切り日が有効かどうかチェック
      let reportDeadline: Date | undefined = undefined;
      try {
        if (subject.reportDeadline) {
          const dateObj = new Date(subject.reportDeadline);
          // 日付が有効かどうかチェック
          if (!isNaN(dateObj.getTime())) {
            reportDeadline = dateObj;
          }
        }
      } catch (error) {
        console.error('Invalid report deadline in subject:', error);
      }

      setFormData({
        name: subject.name,
        totalPages: subject.totalPages,
        examDate: examDate || new Date(),
        textbookName: subject.textbookName || '',
        reportDeadline: reportDeadline,
        deadlineType: subject.deadlineType || 'report',
        reportDetails: subject.reportDetails || '',
        priority: subject.priority || 'medium',
        bufferDays: subject.bufferDays || 7
      });
      // 既存の科目は優先順位が設定されているので手動モードに
      setManualPriority(true);
    } else {
      // 新規科目の場合はデフォルト値
      setFormData({
        name: '',
        totalPages: 0,
        examDate: new Date(),
        textbookName: '',
        reportDeadline: undefined,
        deadlineType: 'report',
        reportDetails: '',
        priority: 'medium',
        bufferDays: 7
      });
      setManualPriority(false);
    }
  }, [subject]);

  // 試験日と総ページ数が変更されたとき、優先順位を自動計算
  useEffect(() => {
    if (!manualPriority && formData.examDate && formData.totalPages > 0) {
      const calculatedPriority = calculatePriority(
        formData.examDate,
        subject?.currentPage || 0,
        formData.totalPages
      );
      
      // 数値の優先度を文字列の優先度に変換
      let priority: 'high' | 'medium' | 'low' = 'low';
      if (calculatedPriority >= 7) priority = 'high';
      else if (calculatedPriority >= 4) priority = 'medium';
      
      setFormData(prev => ({
        ...prev,
        priority: priority
      }));
    }
  }, [formData.examDate, formData.totalPages, formData.name, manualPriority, subject]);

  // フォームの入力を処理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let parsedValue: any = value;
    
    // 日付フィールドの場合は適切に処理
    if (name === 'examDate' || name === 'reportDeadline') {
      try {
        if (value) {
          // 日付文字列を変換
          parsedValue = new Date(value);
          // 無効な日付の場合は元の値をそのまま使用
          if (isNaN(parsedValue.getTime())) {
            parsedValue = value; // 検証時にエラーとなるよう文字列のままにする
          }
        } else if (name === 'reportDeadline') {
          // リポート締切日が空の場合はundefinedに
          parsedValue = undefined;
        }
      } catch (error) {
        console.error(`日付変換エラー (${name}):`, error);
        // エラー時は文字列のまま（検証時にエラーとなる）
      }
    } else if (name === 'totalPages') {
      // 数値フィールドの場合は数値に変換
      parsedValue = value === '' ? '' : parseInt(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
    
    // フィールドが変更されたらエラーをクリア
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // エラーをクリア
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handlePriorityToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualPriority(e.target.checked);
    
    // 手動設定に切り替えるとき、現在の値をそのまま使用
    // 自動設定に切り替えるとき、再計算
    if (!e.target.checked && formData.examDate && formData.totalPages > 0) {
      const calculatedPriority = calculatePriority(
        formData.examDate,
        subject?.currentPage || 0,
        formData.totalPages
      );
      
      // 数値の優先度を文字列の優先度に変換
      let priority: 'high' | 'medium' | 'low' = 'low';
      if (calculatedPriority >= 7) priority = 'high';
      else if (calculatedPriority >= 4) priority = 'medium';
      
      setFormData(prev => ({
        ...prev,
        priority: priority
      }));
    }
  };

  // フォームのバリデーション
  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      totalPages?: string;
      examDate?: string;
      textbookName?: string;
      reportDeadline?: string;
      priority?: string;
      bufferDays?: string;
    } = {};
    
    if (!formData.name) {
      newErrors.name = '科目名を入力してください';
    }
    
    if (!formData.totalPages) {
      newErrors.totalPages = '総ページ数を入力してください';
    } else if (formData.totalPages <= 0) {
      newErrors.totalPages = '総ページ数は1以上である必要があります';
    }
    
    // 試験日の検証
    if (!formData.examDate) {
      newErrors.examDate = '試験日を入力してください';
    } else if (!(formData.examDate instanceof Date) || isNaN(formData.examDate.getTime())) {
      newErrors.examDate = '有効な試験日を入力してください';
    }
    
    // リポート締切日の検証（存在する場合のみ）
    if (formData.reportDeadline) {
      // 日付オブジェクトに変換されているか確認
      if (!(formData.reportDeadline instanceof Date)) {
        try {
          // 文字列の場合は変換を試みる
          const dateObj = new Date(formData.reportDeadline);
          if (isNaN(dateObj.getTime())) {
            newErrors.reportDeadline = '有効なリポート締め切り日を入力してください';
          } else {
            // フォームデータを更新（正しく変換された日付で）
            formData.reportDeadline = dateObj;
          }
        } catch (error) {
          console.error('リポート締切日の検証エラー:', error);
          newErrors.reportDeadline = '有効なリポート締め切り日を入力してください';
        }
      } else if (isNaN(formData.reportDeadline.getTime())) {
        newErrors.reportDeadline = '有効なリポート締め切り日を入力してください';
      }
    }
    
    if (!formData.priority) {
      newErrors.priority = '優先順位を選択してください';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // フォーム送信
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // デバッグログを追加
    console.log('フォーム送信開始', JSON.stringify(formData));
    
    if (validateForm()) {
      console.log('バリデーション成功、onSubmit実行');
      try {
        // 日付が文字列の場合は変換
        const submissionData = {
          ...formData,
          examDate: formData.examDate instanceof Date ? formData.examDate : new Date(formData.examDate),
          reportDeadline: formData.reportDeadline instanceof Date ? 
            formData.reportDeadline : 
            (formData.reportDeadline ? new Date(formData.reportDeadline) : undefined)
        };
        
        console.log('送信データ:', JSON.stringify(submissionData, (key, value) => {
          if (value instanceof Date) {
            return value.toISOString();
          }
          return value;
        }));
        
        onSubmit(submissionData);
        console.log('onSubmit成功完了');
      } catch (error) {
        console.error('onSubmit実行エラー:', error);
        setErrors(prev => ({
          ...prev,
          form: 'フォーム送信中にエラーが発生しました'
        }));
      }
    } else {
      console.log('バリデーション失敗', errors);
    }
  };

  // 日付をフォーム用の文字列に変換
  const formatDateForInput = (date: Date | string | null | undefined): string => {
    try {
      if (!date) return '';
      
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // 日付が無効かどうかチェック
      if (isNaN(dateObj.getTime())) {
        return '';
      }
      
      return dateObj.toISOString().split('T')[0];
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  // 優先順位に応じた色を取得
  const getPriorityColor = (priority: string): string => {
    switch(priority) {
      case 'high':
        return '#f44336'; // 赤色
      case 'medium':
        return '#ff9800'; // オレンジ色
      case 'low':
        return '#4caf50'; // 緑色
      default:
        return '#757575'; // グレー
    }
  };

  // 優先順位表示用のラベルとアイコンを取得
  const getPriorityLabel = (priority: string): {label: string, icon: JSX.Element} => {
    switch(priority) {
      case 'high':
        return { 
          label: '高', 
          icon: <FlagIcon fontSize="small" style={{ color: getPriorityColor(priority) }} />
        };
      case 'medium':
        return { 
          label: '中', 
          icon: <FlagIcon fontSize="small" style={{ color: getPriorityColor(priority) }} />
        };
      case 'low':
        return { 
          label: '低', 
          icon: <FlagIcon fontSize="small" style={{ color: getPriorityColor(priority) }} />
        };
      default:
        return { 
          label: '未設定', 
          icon: <FlagIcon fontSize="small" style={{ color: getPriorityColor(priority) }} />
        };
    }
  };

  // 編集モードかどうかを判定
  const isEditMode = !!subject;
  const priorityInfo = getPriorityLabel(formData.priority || 'medium');

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: '12px',
          overflow: 'hidden',
          p: { xs: 2, sm: 3 },
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: (theme) => theme.palette.mode === 'dark' 
            ? 'linear-gradient(to bottom right, rgba(50, 50, 50, 0.9), rgba(30, 30, 30, 0.9))' 
            : 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.9), rgba(240, 240, 240, 0.9))'
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          {subject ? '科目を編集' : '新しい科目'}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* 科目名 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="科目名"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                error={Boolean(errors.name)}
                helperText={errors.name || ''}
                disabled={isLoading}
                variant="outlined"
                sx={{ mb: 2 }}
                InputProps={{
                  sx: { borderRadius: '8px' }
                }}
              />
            </Grid>

            {/* 教科書名 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="教科書/参考書"
                name="textbookName"
                value={formData.textbookName}
                onChange={handleChange}
                variant="outlined"
                disabled={isLoading}
                placeholder="使用する教科書や参考書の名前"
                InputProps={{
                  sx: { borderRadius: '8px' }
                }}
              />
            </Grid>

            {/* ページ数 */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="全ページ数"
                name="totalPages"
                type="number"
                value={formData.totalPages}
                onChange={handleChange}
                required
                error={Boolean(errors.totalPages)}
                helperText={errors.totalPages || ''}
                disabled={isLoading}
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: '8px' },
                  endAdornment: <InputAdornment position="end">ページ</InputAdornment>
                }}
              />
            </Grid>

            {/* 現在のページ数 (編集時のみ) */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="現在のページ"
                name="currentPage"
                type="number"
                value={formData.currentPage || 0}
                onChange={handleChange}
                disabled={isLoading}
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: '8px' },
                  endAdornment: <InputAdornment position="end">ページ</InputAdornment>
                }}
              />
            </Grid>

            {/* 試験日 */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="試験日"
                name="examDate"
                type="date"
                value={formatDateForInput(formData.examDate)}
                onChange={handleChange}
                required
                error={Boolean(errors.examDate)}
                helperText={errors.examDate || ''}
                disabled={isLoading}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  sx: { borderRadius: '8px' }
                }}
              />
            </Grid>

            {/* 余裕日数 */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="目標達成の余裕日数"
                name="bufferDays"
                type="number"
                value={formData.bufferDays}
                onChange={handleChange}
                disabled={isLoading}
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: '8px' },
                  endAdornment: <InputAdornment position="end">日前</InputAdornment>
                }}
              />
            </Grid>

            {/* レポート締切日 */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="レポート締切日"
                name="reportDeadline"
                type="date"
                value={formatDateForInput(formData.reportDeadline)}
                onChange={handleChange}
                error={Boolean(errors.reportDeadline)}
                helperText={errors.reportDeadline || ''}
                disabled={isLoading}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  sx: { borderRadius: '8px' }
                }}
              />
            </Grid>

            {/* 締切タイプ */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" disabled={isLoading}>
                <InputLabel id="deadline-type-label">締切タイプ</InputLabel>
                <Select
                  labelId="deadline-type-label"
                  name="deadlineType"
                  value={formData.deadlineType || 'report'}
                  onChange={handleSelectChange}
                  label="締切タイプ"
                  sx={{ borderRadius: '8px' }}
                >
                  <MenuItem value="report">レポート</MenuItem>
                  <MenuItem value="assignment">課題</MenuItem>
                  <MenuItem value="other">その他</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* レポート詳細 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="レポート/課題の詳細"
                name="reportDetails"
                value={formData.reportDetails || ''}
                onChange={handleChange}
                multiline
                rows={2}
                variant="outlined"
                disabled={isLoading}
                placeholder="提出物の詳細情報（文字数制限、提出方法など）"
                InputProps={{
                  sx: { borderRadius: '8px' }
                }}
              />
            </Grid>

            {/* 優先度設定 */}
            <Grid item xs={12}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">優先度設定</Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={manualPriority}
                        onChange={handlePriorityToggle}
                        disabled={isLoading}
                        color="primary"
                      />
                    }
                    label="手動設定"
                  />
                </Box>

                {manualPriority ? (
                  <FormControl fullWidth variant="outlined" disabled={isLoading}>
                    <InputLabel id="priority-label">優先度</InputLabel>
                    <Select
                      labelId="priority-label"
                      name="priority"
                      value={formData.priority || 'medium'}
                      onChange={handleSelectChange}
                      label="優先度"
                      sx={{ borderRadius: '8px' }}
                    >
                      <MenuItem value="high">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <FlagIcon sx={{ color: getPriorityColor('high'), mr: 1 }} />
                          <Typography>高</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="medium">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <FlagIcon sx={{ color: getPriorityColor('medium'), mr: 1 }} />
                          <Typography>中</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="low">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <FlagIcon sx={{ color: getPriorityColor('low'), mr: 1 }} />
                          <Typography>低</Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                ) : (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      試験日と進捗状況に基づいて自動的に優先度が設定されます。
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>現在の優先度:</Typography>
                      <Chip
                        icon={getPriorityLabel(formData.priority || 'medium').icon}
                        label={getPriorityLabel(formData.priority || 'medium').label}
                        size="small"
                        sx={{ 
                          bgcolor: `${getPriorityColor(formData.priority || 'medium')}20`,
                          color: getPriorityColor(formData.priority || 'medium'),
                          fontWeight: 'bold',
                          borderRadius: '6px'
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            {onCancel && (
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={isLoading}
                sx={{ 
                  borderRadius: '8px',
                  px: 3
                }}
              >
                キャンセル
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
              sx={{ 
                borderRadius: '8px',
                px: 4,
                boxShadow: (theme) => `0 4px 10px ${theme.palette.primary.main}40`
              }}
            >
              {isLoading ? '保存中...' : subject ? '更新' : '作成'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}; 