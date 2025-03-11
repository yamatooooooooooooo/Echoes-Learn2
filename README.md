# Echoes Learn App

## Firebaseの設定

このアプリケーションはFirebaseを使用しています。以下の手順でFirebaseを設定してください。

### 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例：echoes-learn）
4. 必要に応じてGoogle Analyticsを有効化
5. 「プロジェクトを作成」をクリック

### 2. Webアプリの登録

1. プロジェクトの概要画面で「ウェブ」アイコン（`</>`)をクリック
2. アプリのニックネームを入力（例：echoes-learn-web）
3. 「Firebase Hostingも設定する」にチェック
4. 「アプリを登録」をクリック
5. 表示されるFirebase設定情報をメモしておく

### 3. Firebaseサービスの有効化

1. **Authentication**: 「Authentication」→「Sign-in method」でメール/パスワード認証を有効化
2. **Firestore Database**: 「Firestore Database」→「データベースの作成」でFirestoreを有効化
3. **Storage**: 「Storage」→「使ってみる」でCloud Storageを有効化
4. **Hosting**: 「Hosting」→「使ってみる」でHostingを設定

### 4. 環境変数の設定

1. プロジェクトのルートディレクトリに`.env.local`ファイルを作成
2. 以下の環境変数を設定

```
REACT_APP_API_KEY=YOUR_API_KEY
REACT_APP_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
REACT_APP_PROJECT_ID=YOUR_PROJECT_ID
REACT_APP_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
REACT_APP_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
REACT_APP_APP_ID=YOUR_APP_ID
REACT_APP_MEASUREMENT_ID=YOUR_MEASUREMENT_ID
REACT_APP_USE_MOCK_DATA=false
```

### 5. Firebaseツールのインストール

```bash
npm install -g firebase-tools
firebase login
firebase init
```

Firebase initでは以下のサービスを選択してください：
- Firestore
- Functions (必要な場合)
- Hosting
- Storage
- Emulators (開発用)

### 6. デプロイ

```bash
npm run build
firebase deploy
```

### 7. モックデータとFirebaseの切り替え

開発中はモックデータを使用し、本番環境ではFirebaseを使用する場合、`.env.local`ファイルの`REACT_APP_USE_MOCK_DATA`を`true`または`false`に設定してください。

```
# モックデータを使用する場合
REACT_APP_USE_MOCK_DATA=true

# Firebaseを使用する場合
REACT_APP_USE_MOCK_DATA=false 
```

## カスタムエラークラス
export class SubjectError extends Error {
  constructor(
    message: string,
    public code: string,
    public field?: string
  ) {
    super(message);
    this.name = 'SubjectError';
  }
}

// エラーをスローする際
throw new SubjectError('同じ名前の科目がすでに存在します', 'DUPLICATE_NAME', 'name');

// エラーをキャッチする際
try {
  // ...
} catch (error) {
  if (error instanceof SubjectError) {
    // 構造化されたエラー処理
    setFieldError(error.field, error.message);
    setSubmitError(error.message);
  } else {
    // 一般的なエラー処理
    console.error('予期しないエラー:', error);
    setSubmitError('予期しないエラーが発生しました。もう一度お試しください。');
  }
} 

// Material-UIのDatepickerをテストする場合
test('Datepickerで日付を選択できる', async () => {
  render(<MyDatepicker />);
  
  // Datepickerを開く
  const datepickerInput = screen.getByLabelText(/日付/i);
  fireEvent.click(datepickerInput);
  
  // 日付を選択（例：15日）
  const dayButton = screen.getByRole('button', { name: '15' });
  fireEvent.click(dayButton);
  
  // OKボタンをクリック
  const okButton = screen.getByRole('button', { name: /OK/i });
  fireEvent.click(okButton);
  
  // 選択された日付が入力されていることを確認
  expect(datepickerInput).toHaveValue(expect.stringMatching(/.*15.*/));
}); 

import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ja from 'date-fns/locale/ja';
import { format } from 'date-fns';
import { addDays, differenceInDays, isAfter, isBefore } from 'date-fns';
import { parse } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

// 日本語形式でフォーマット（例：2023年5月15日）
const formattedDate = format(new Date(), 'yyyy年MM月dd日', { locale: ja });

// シンプルなフォーマット（例：2023/05/15）
const simpleDate = format(new Date(), 'yyyy/MM/dd');

// 7日後の日付
const nextWeek = addDays(new Date(), 7);

// 二つの日付の差（日数）
const daysDiff = differenceInDays(new Date('2023-12-31'), new Date());

// 日付の比較
const isInFuture = isAfter(new Date('2023-12-31'), new Date());

// 文字列から日付オブジェクトへの変換
const date = parse('2023/05/15', 'yyyy/MM/dd', new Date());

// UTCから日本時間への変換
const japanTime = utcToZonedTime(new Date(), 'Asia/Tokyo');

// 日本時間からUTCへの変換
const utcTime = zonedTimeToUtc(new Date(), 'Asia/Tokyo');

<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
  <DatePicker
    label="記録日"
    value={formData.recordDate}
    onChange={(newValue) => {
      setFormData({ ...formData, recordDate: newValue });
    }}
    format="yyyy/MM/dd"
  />
</LocalizationProvider> 

// src/domain/models/ProgressModel.ts
export interface Progress {
  id?: string;
  userId: string;
  subjectId: string;
  startPage: number;
  endPage: number;
  pagesRead: number;
  recordDate: string | Date;
  studyDuration?: number; // 学習時間（分）
  memo?: string; // 学習メモ
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgressCreateInput {
  subjectId: string;
  startPage: number;
  endPage: number;
  pagesRead: number;
  recordDate: string | Date;
  studyDuration?: number;
  memo?: string;
}

export interface ProgressUpdateInput {
  startPage?: number;
  endPage?: number;
  pagesRead?: number;
  recordDate?: string | Date;
  studyDuration?: number;
  memo?: string;
} 

// src/infrastructure/repositories/progressRepository.ts
import { Firestore, collection, doc, addDoc, updateDoc, query, where, orderBy, getDocs, writeBatch } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { Progress, ProgressCreateInput, ProgressUpdateInput } from '../../domain/models/ProgressModel';
import { IProgressRepository } from '../../domain/interfaces/repositories/IProgressRepository';

export class ProgressRepository implements IProgressRepository {
  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {}

  /**
   * 進捗記録を追加
   */
  async addProgress(userId: string, progressData: ProgressCreateInput): Promise<string> {
    try {
      // タイムスタンプを追加
      const progressWithTimestamp = {
        ...progressData,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Firestoreに保存
      const progressRef = collection(this.firestore, 'users', userId, 'progress');
      const docRef = await addDoc(progressRef, progressWithTimestamp);
      return docRef.id;
    } catch (error) {
      console.error('進捗記録の追加に失敗しました:', error);
      throw error;
    }
  }

  /**
   * 特定の科目の進捗記録を取得
   */
  async getSubjectProgress(userId: string, subjectId: string): Promise<Progress[]> {
    try {
      const progressRef = collection(this.firestore, 'users', userId, 'progress');
      const q = query(
        progressRef,
        where('subjectId', '==', subjectId),
        orderBy('recordDate', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      const progress: Progress[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        progress.push({
          id: doc.id,
          ...data,
          recordDate: data.recordDate ? new Date(data.recordDate.toDate()) : new Date(),
          createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()) : new Date()
        } as Progress);
      });
      
      return progress;
    } catch (error) {
      console.error('進捗記録の取得に失敗しました:', error);
      throw error;
    }
  }

  // 他のメソッド（更新、削除など）...
} 

// src/domain/services/ProgressService.ts
import { Progress, ProgressCreateInput, ProgressUpdateInput } from '../models/ProgressModel';
import { Subject } from '../models/SubjectModel';
import { IProgressRepository } from '../interfaces/repositories/IProgressRepository';
import { ISubjectRepository } from '../interfaces/repositories/ISubjectRepository';
import { ProgressError } from '../errors/ProgressError';
import { writeBatch } from 'firebase/firestore';

export class ProgressService {
  constructor(
    private progressRepository: IProgressRepository,
    private subjectRepository: ISubjectRepository
  ) {}

  /**
   * 進捗を記録し、科目の現在ページを更新
   */
  async recordProgress(userId: string, progressData: ProgressCreateInput): Promise<string> {
    try {
      // 入力データのバリデーション
      this.validateProgressInput(progressData);
      
      // 関連する科目を取得
      const subject = await this.subjectRepository.getSubject(progressData.subjectId);
      if (!subject) {
        throw new ProgressError('指定された科目が見つかりません', 'SUBJECT_NOT_FOUND', 'subjectId');
      }
      
      // 進捗のページ数が科目の総ページ数を超えていないか確認
      if (progressData.endPage > subject.totalPages) {
        throw new ProgressError(
          `終了ページ（${progressData.endPage}）が科目の総ページ数（${subject.totalPages}）を超えています`,
          'PAGE_EXCEED_TOTAL',
          'endPage'
        );
      }
      
      // 進捗記録と科目更新をバッチ処理
      const progressId = await this.recordProgressWithBatch(userId, progressData, subject.id);
      
      return progressId;
    } catch (error) {
      // エラーを再スロー
      if (error instanceof ProgressError) {
        throw error;
      }
      console.error('進捗の記録中にエラーが発生しました:', error);
      throw new ProgressError('進捗の記録に失敗しました', 'RECORDING_FAILED');
    }
  }

  /**
   * 進捗データの入力値を検証
   */
  private validateProgressInput(progress: ProgressCreateInput): void {
    if (!progress.subjectId) {
      throw new ProgressError('科目IDは必須です', 'MISSING_SUBJECT_ID', 'subjectId');
    }
    
    if (progress.startPage < 0) {
      throw new ProgressError('開始ページは0以上である必要があります', 'INVALID_START_PAGE', 'startPage');
    }
    
    if (progress.endPage < progress.startPage) {
      throw new ProgressError('終了ページは開始ページ以上である必要があります', 'INVALID_END_PAGE', 'endPage');
    }
    
    if (!progress.recordDate) {
      throw new ProgressError('記録日は必須です', 'MISSING_RECORD_DATE', 'recordDate');
    }
    
    // 日付が有効かチェック
    try {
      const date = new Date(progress.recordDate);
      if (isNaN(date.getTime())) {
        throw new ProgressError('有効な日付を入力してください', 'INVALID_DATE_FORMAT', 'recordDate');
      }
    } catch (error) {
      throw new ProgressError('有効な日付を入力してください', 'INVALID_DATE_FORMAT', 'recordDate');
    }
  }

  // 進捗記録と科目更新をバッチ処理
  private async recordProgressWithBatch(userId: string, progressData: ProgressCreateInput, subjectId: string): Promise<string> {
    const batch = writeBatch(this.firestore);
    
    // 進捗レコードを作成
    const progressRef = doc(collection(this.firestore, 'users', userId, 'progress'));
    const progressWithTimestamp = {
      ...progressData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    batch.set(progressRef, progressWithTimestamp);
    
    // 科目の現在のページを更新
    const subjectRef = doc(this.firestore, 'users', userId, 'subjects', subjectId);
    batch.update(subjectRef, { 
      currentPage: progressData.endPage,
      updatedAt: new Date()
    });
    
    // バッチをコミット
    await batch.commit();
    
    return progressRef.id;
  }

  // その他のメソッド...
} 

// src/domain/errors/ProgressError.ts
export class ProgressError extends Error {
  constructor(
    message: string,
    public code: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ProgressError';
  }
} 

// src/presentation/features/subject/hooks/useProgressForm.ts
import { useState } from 'react';
import { ProgressCreateInput, Progress } from '../../../../domain/models/ProgressModel';
import { Subject } from '../../../../domain/models/SubjectModel';
import { useServices } from '../../../../hooks/useServices';
import { useFirebase } from '../../../../contexts/FirebaseContext';
import { format } from 'date-fns';

interface UseProgressFormParams {
  subject: Subject;
  onSuccess?: (progressId: string) => void;
}

export const useProgressForm = ({ subject, onSuccess }: UseProgressFormParams) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // サービスを取得
  const { progressRepository, subjectRepository } = useServices();
  const { auth } = useFirebase();
  
  // 今日の日付を取得（YYYY-MM-DD形式）
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // 初期値
  const initialValues: ProgressCreateInput = {
    subjectId: subject.id,
    startPage: subject.currentPage || 0,
    endPage: subject.currentPage || 0,
    pagesRead: 0,
    recordDate: today,
    studyDuration: 0,
    memo: ''
  };
  
  const [formData, setFormData] = useState<ProgressCreateInput>(initialValues);
  
  // フォーム入力の処理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: any = value;
    
    // 入力タイプに応じた値の変換
    if (type === 'number') {
      parsedValue = value === '' ? '' : Number(value);
    }
    
    // startPageとendPageの場合はpagesReadを計算
    if (name === 'startPage' || name === 'endPage') {
      const startPage = name === 'startPage' ? parsedValue : formData.startPage;
      const endPage = name === 'endPage' ? parsedValue : formData.endPage;
      
      // 妥当な値の場合のみ計算
      if (typeof startPage === 'number' && typeof endPage === 'number' && endPage >= startPage) {
        setFormData(prev => ({
          ...prev,
          [name]: parsedValue,
          pagesRead: endPage - startPage + 1
        }));
        return;
      }
    }
    
    // 通常の入力
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
    
    // フィールドエラーをクリア
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});
    
    try {
      // バリデーション
      const validationErrors = validateProgress(formData, subject);
      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }
      
      // 認証状態の確認
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError('認証されていません。ログインしてください。');
        setIsSubmitting(false);
        return;
      }
      
      // ProgressServiceのインスタンス作成
      const progressService = new ProgressService(progressRepository, subjectRepository);
      
      // 進捗を記録
      const progressId = await progressService.recordProgress(currentUser.uid, formData);
      
      // 成功コールバック
      if (onSuccess) {
        onSuccess(progressId);
      }
      
      // フォームをリセット
      resetForm();
    } catch (error) {
      console.error('進捗の記録に失敗しました:', error);
      
      // ProgressErrorの場合は構造化されたエラー処理
      if (error instanceof ProgressError && error.field) {
        setFieldErrors({
          [error.field]: error.message
        });
      } else {
        setError(error instanceof Error ? error.message : '予期しないエラーが発生しました');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // フォームリセット
  const resetForm = () => {
    setFormData(initialValues);
    setError(null);
    setFieldErrors({});
  };
  
  // バリデーション関数
  const validateProgress = (data: ProgressCreateInput, subject: Subject): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (data.startPage < 0) {
      errors.startPage = '開始ページは0以上である必要があります';
    }
    
    if (data.endPage < data.startPage) {
      errors.endPage = '終了ページは開始ページ以上である必要があります';
    }
    
    if (data.endPage > subject.totalPages) {
      errors.endPage = `終了ページは科目の総ページ数（${subject.totalPages}）以下である必要があります`;
    }
    
    if (!data.recordDate) {
      errors.recordDate = '記録日を選択してください';
    }
    
    return errors;
  };
  
  return {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    handleChange,
    handleSubmit,
    resetForm
  };
}; 

// src/presentation/features/subject/components/ProgressForm.tsx
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  InputAdornment
} from '@mui/material';
import { Subject } from '../../../../domain/models/SubjectModel';
import { useProgressForm } from '../hooks/useProgressForm';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ja } from 'date-fns/locale';

interface ProgressFormProps {
  subject: Subject;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ProgressForm: React.FC<ProgressFormProps> = ({
  subject,
  onSuccess,
  onCancel
}) => {
  const {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    handleChange,
    handleSubmit,
    resetForm
  } = useProgressForm({
    subject,
    onSuccess: () => {
      onSuccess();
    }
  });

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        進捗記録
      </Typography>
      
      <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper', mb: 2 }}>
        <Typography variant="body2">
          科目名: {subject.name}
        </Typography>
        <Typography variant="body2">
          現在のページ: {subject.currentPage || 0} / {subject.totalPages} ページ
        </Typography>
      </Paper>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
            <DatePicker
              label="記録日"
              value={formData.recordDate ? new Date(formData.recordDate) : null}
              onChange={(newValue) => {
                const formattedDate = newValue ? newValue.toISOString().split('T')[0] : '';
                handleChange({
                  target: { name: 'recordDate', value: formattedDate, type: 'text' }
                } as React.ChangeEvent<HTMLInputElement>);
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: "dense",
                  size: "small",
                  error: !!fieldErrors.recordDate,
                  helperText: fieldErrors.recordDate
                }
              }}
            />
          </LocalizationProvider>
        </Grid>
        
        <Grid item xs={6}>
          <TextField
            label="開始ページ"
            type="number"
            name="startPage"
            value={formData.startPage}
            onChange={handleChange}
            fullWidth
            margin="dense"
            size="small"
            error={!!fieldErrors.startPage}
            helperText={fieldErrors.startPage}
          />
        </Grid>
        
        <Grid item xs={6}>
          <TextField
            label="終了ページ"
            type="number"
            name="endPage"
            value={formData.endPage}
            onChange={handleChange}
            fullWidth
            margin="dense"
            size="small"
            error={!!fieldErrors.endPage}
            helperText={fieldErrors.endPage}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="学習時間（分）"
            type="number"
            name="studyDuration"
            value={formData.studyDuration}
            onChange={handleChange}
            fullWidth
            margin="dense"
            size="small"
            InputProps={{
              endAdornment: <InputAdornment position="end">分</InputAdornment>,
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="メモ"
            name="memo"
            value={formData.memo}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
            margin="dense"
            size="small"
          />
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ borderRadius: 1, p: 1, bgcolor: 'background.default', mb: 1 }}>
            読んだページ数: {formData.pagesRead} ページ
          </Box>
        </Grid>
      </Grid>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          type="button"
          onClick={onCancel}
          sx={{ mr: 1 }}
          disabled={isSubmitting}
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          startIcon={isSubmitting && <CircularProgress size={20} color="inherit" />}
        >
          記録する
        </Button>
      </Box>
    </Box>
  );
}; 

// src/domain/services/__tests__/ProgressService.test.ts
describe('ProgressService', () => {
  // モックリポジトリのセットアップ
  // ...
  
  describe('recordProgress', () => {
    test('有効な進捗を記録する', async () => {
      // モックの戻り値を設定
      mockSubjectRepository.getSubject.mockResolvedValue({
        id: 'subject-1',
        name: 'テスト科目',
        currentPage: 10,
        totalPages: 100,
        examDate: new Date()
      });
      mockProgressRepository.addProgress.mockResolvedValue('progress-1');
      
      const service = new ProgressService(mockProgressRepository, mockSubjectRepository);
      
      const result = await service.recordProgress('user-1', {
        subjectId: 'subject-1',
        startPage: 11,
        endPage: 20,
        pagesRead: 10,
        recordDate: new Date()
      });
      
      expect(result).toBe('progress-1');
      expect(mockSubjectRepository.updateSubject).toHaveBeenCalledWith(
        'subject-1',
        expect.objectContaining({
          currentPage: 20
        })
      );
    });
    
    test('終了ページが総ページ数を超える場合はエラーをスローする', async () => {
      // ...
    });
    
    // その他のテストケース
  });
}); 

// FirestoreのエミュレーターとFirebase Auth Emulatorを使用した統合テスト 

// Cypress、PlaywrightまたはSeleniumを使用したE2Eテスト 