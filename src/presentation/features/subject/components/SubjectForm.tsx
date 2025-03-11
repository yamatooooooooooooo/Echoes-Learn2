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
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {isEditMode ? '科目を編集' : '新しい科目を登録'}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="科目名"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              disabled={isLoading}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="教科書名"
              name="textbookName"
              value={formData.textbookName || ''}
              onChange={handleChange}
              error={!!errors.textbookName}
              helperText={errors.textbookName}
              disabled={isLoading}
              placeholder="教科書名を入力（任意）"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              id="totalPages"
              name="totalPages"
              label="教科書の総ページ数"
              type="number"
              value={formData.totalPages}
              onChange={handleChange}
              error={!!errors.totalPages}
              helperText={errors.totalPages}
              disabled={isLoading}
              InputProps={{
                endAdornment: <InputAdornment position="end">ページ</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              id="bufferDays"
              name="bufferDays"
              label="バッファ日数"
              type="number"
              value={formData.bufferDays || 7}
              onChange={handleChange}
              error={!!errors.bufferDays}
              helperText={errors.bufferDays || "試験日の何日前までに学習を終わらせるか"}
              disabled={isLoading}
              InputProps={{
                endAdornment: <InputAdornment position="end">日</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="試験日"
              name="examDate"
              value={formatDateForInput(formData.examDate)}
              onChange={handleChange}
              error={!!errors.examDate}
              helperText={errors.examDate}
              disabled={isLoading}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="リポート締め切り日"
              name="reportDeadline"
              value={formatDateForInput(formData.reportDeadline)}
              onChange={handleChange}
              error={!!errors.reportDeadline}
              helperText={errors.reportDeadline || '任意項目です'}
              disabled={isLoading}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ mr: 2 }}>
                優先順位:
              </Typography>
              <Chip
                icon={priorityInfo.icon}
                label={priorityInfo.label}
                size="small"
                sx={{
                  bgcolor: getPriorityColor(formData.priority || ''),
                  color: 'white',
                  '& .MuiChip-icon': { color: 'white' }
                }}
              />
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={manualPriority}
                  onChange={handlePriorityToggle}
                  disabled={isLoading}
                />
              }
              label="優先順位を手動で設定する"
            />
            
            {manualPriority ? (
              <FormControl fullWidth>
                <InputLabel id="priority-label">優先順位</InputLabel>
                <Select
                  labelId="priority-label"
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleSelectChange}
                  disabled={!manualPriority || isLoading}
                  label="優先順位"
                >
                  <MenuItem value="high" sx={{ color: getPriorityColor('high') }}>
                    {getPriorityLabel('high').label}
                  </MenuItem>
                  <MenuItem value="medium" sx={{ color: getPriorityColor('medium') }}>
                    {getPriorityLabel('medium').label}
                  </MenuItem>
                  <MenuItem value="low" sx={{ color: getPriorityColor('low') }}>
                    {getPriorityLabel('low').label}
                  </MenuItem>
                </Select>
              </FormControl>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                優先順位は試験日までの日数と総ページ数から自動計算されます。
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
              >
                {isEditMode ? '更新する' : '登録する'}
              </Button>
              
              {onCancel && (
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  キャンセル
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}; 