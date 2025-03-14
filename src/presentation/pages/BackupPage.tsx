import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Box, 
  Button, 
  Container, 
  Divider, 
  Paper, 
  Stack, 
  Alert, 
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { CloudUpload, CloudDownload, Refresh, Save } from '@mui/icons-material';
import { useAuthContext } from '../contexts/AuthContext';
import { db, auth } from '../../firebase';
import { BackupService } from '../../infrastructure/utils/backupService';
import { GoogleDriveService } from '../../infrastructure/utils/googleDriveService';
import { formatDistance } from 'date-fns';
import { ja } from 'date-fns/locale';

/**
 * バックアップと復元ページ
 * ユーザーデータのバックアップとGoogle Driveからの復元機能を提供
 */
export const BackupPage: React.FC = () => {
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [backupFiles, setBackupFiles] = useState<Array<{id: string, name: string, modifiedTime: string, size: string}>>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [overwriteData, setOverwriteData] = useState(false);
  const [isGapiLoaded, setIsGapiLoaded] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // サービスのインスタンス
  const backupService = new BackupService(db, auth);
  const googleDriveService = new GoogleDriveService();

  // Google API初期化
  useEffect(() => {
    const loadGoogleScript = () => {
      // Google APIスクリプトが既に読み込まれているか確認
      if (document.querySelector('script[src*="apis.google.com/js/api.js"]')) {
        setIsGapiLoaded(true);
        return;
      }

      // スクリプトを読み込み
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsGapiLoaded(true);
      };
      document.body.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  // Google Drive APIを初期化
  useEffect(() => {
    if (isGapiLoaded) {
      initializeGoogleDrive();
    }
  }, [isGapiLoaded]);

  /**
   * Google Drive APIを初期化
   */
  const initializeGoogleDrive = async () => {
    try {
      setIsLoading(true);
      await googleDriveService.initialize();
      if (googleDriveService.isSignedIn()) {
        await refreshBackupList();
      }
    } catch (error) {
      console.error('Google Drive初期化エラー:', error);
      setMessage({
        type: 'error',
        text: 'Google Drive APIの初期化に失敗しました。'
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Google Driveにサインイン
   */
  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await googleDriveService.signIn();
      await refreshBackupList();
      setMessage({
        type: 'success',
        text: 'Googleアカウントにサインインしました。'
      });
    } catch (error) {
      console.error('サインインエラー:', error);
      setMessage({
        type: 'error',
        text: 'Googleアカウントへのサインインに失敗しました。'
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * バックアップリストを更新
   */
  const refreshBackupList = async () => {
    try {
      setIsLoading(true);
      const files = await googleDriveService.listBackupFiles();
      setBackupFiles(files);
      setSelectedFileId(files.length > 0 ? files[0].id : null);
    } catch (error) {
      console.error('バックアップリスト更新エラー:', error);
      setMessage({
        type: 'error',
        text: 'バックアップリストの取得に失敗しました。'
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Google Driveにバックアップを作成
   */
  const handleBackup = async () => {
    if (!user) {
      setMessage({
        type: 'error',
        text: 'バックアップを作成するには、サインインしてください。'
      });
      return;
    }

    try {
      setIsLoading(true);
      const fileName = `echoes_backup_${new Date().toISOString().slice(0, 10)}.json`;
      await googleDriveService.backupToGoogleDrive(backupService, fileName);
      await refreshBackupList();
      setMessage({
        type: 'success',
        text: 'バックアップが正常に作成されました。'
      });
    } catch (error) {
      console.error('バックアップエラー:', error);
      setMessage({
        type: 'error',
        text: 'バックアップの作成に失敗しました。'
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Google Driveのリストを更新
   */
  const handleRefreshList = async () => {
    await refreshBackupList();
    setMessage({
      type: 'info',
      text: 'バックアップリストを更新しました。'
    });
  };

  /**
   * 復元ダイアログを開く
   */
  const handleOpenRestoreDialog = () => {
    if (!selectedFileId) {
      setMessage({
        type: 'error',
        text: '復元するバックアップファイルを選択してください。'
      });
      return;
    }
    setIsDialogOpen(true);
  };

  /**
   * 復元ダイアログを閉じる
   */
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  /**
   * Google Driveからデータを復元
   */
  const handleRestore = async () => {
    if (!user || !selectedFileId) {
      setMessage({
        type: 'error',
        text: '復元するバックアップファイルを選択してください。'
      });
      return;
    }

    try {
      setIsLoading(true);
      setIsDialogOpen(false);
      
      const result = await googleDriveService.restoreFromGoogleDrive(
        backupService, 
        selectedFileId, 
        { overwrite: overwriteData }
      );

      setMessage({
        type: 'success',
        text: `復元が完了しました。インポートされたドキュメント: ${result.importedDocuments}/${result.totalDocuments}${result.errors.length > 0 ? '、エラー: ' + result.errors.length : ''}`
      });
    } catch (error) {
      console.error('復元エラー:', error);
      setMessage({
        type: 'error',
        text: 'データの復元に失敗しました。'
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * ファイルサイズを人間が読みやすい形式に変換
   */
  const formatFileSize = (sizeInBytes: string): string => {
    const size = parseInt(sizeInBytes, 10);
    if (isNaN(size)) return 'サイズ不明';
    
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        データのバックアップと復元
      </Typography>
      
      {message && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 2 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Google Driveとの連携
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          データをGoogle Driveにバックアップして、いつでも復元できます。バックアップは暗号化されず、JSON形式で保存されます。
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<CloudUpload />}
            onClick={handleSignIn}
            disabled={isLoading || (isGapiLoaded && googleDriveService.isSignedIn())}
          >
            Googleアカウントに接続
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          バックアップの作成
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          現在のすべてのデータ（科目、進捗記録、設定）をGoogle Driveにバックアップします。
        </Typography>

        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Save />} 
          onClick={handleBackup}
          disabled={isLoading || !isGapiLoaded || !googleDriveService.isSignedIn()}
          sx={{ mb: 2 }}
        >
          バックアップを作成
        </Button>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            バックアップの復元
          </Typography>
          <Button 
            startIcon={<Refresh />} 
            onClick={handleRefreshList}
            disabled={isLoading || !isGapiLoaded || !googleDriveService.isSignedIn()}
          >
            リストを更新
          </Button>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {backupFiles.length > 0 ? (
              <>
                <Typography variant="body2" color="text.secondary" paragraph>
                  復元したいバックアップファイルを選択してください。
                </Typography>
                <List sx={{ bgcolor: 'background.paper', mb: 2 }}>
                  {backupFiles.map((file) => (
                    <ListItem 
                      key={file.id}
                      onClick={() => setSelectedFileId(file.id)}
                      divider
                      sx={{
                        bgcolor: selectedFileId === file.id ? 'action.selected' : 'inherit',
                        '&:hover': { bgcolor: 'action.hover' },
                        cursor: 'pointer'
                      }}
                    >
                      <ListItemText 
                        primary={file.name.replace(/^echoes_backup_/, '').replace(/\.json$/, '')} 
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.secondary">
                              {formatDistance(new Date(file.modifiedTime), new Date(), { addSuffix: true, locale: ja })}
                              {' • '}
                              {formatFileSize(file.size)}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                      <Checkbox 
                        edge="end"
                        checked={selectedFileId === file.id}
                        onChange={() => setSelectedFileId(file.id)}
                      />
                    </ListItem>
                  ))}
                </List>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Checkbox
                    checked={overwriteData}
                    onChange={(e) => setOverwriteData(e.target.checked)}
                  />
                  <Typography>
                    既存のデータを上書き（チェックしない場合はマージ）
                  </Typography>
                </Box>

                <Button 
                  variant="contained" 
                  color="secondary" 
                  startIcon={<CloudDownload />} 
                  onClick={handleOpenRestoreDialog}
                  disabled={isLoading || !selectedFileId || !isGapiLoaded || !googleDriveService.isSignedIn()}
                >
                  選択したバックアップを復元
                </Button>
              </>
            ) : (
              <Typography>
                バックアップファイルがありません。まずはバックアップを作成してください。
              </Typography>
            )}
          </>
        )}
      </Paper>

      {/* 復元確認ダイアログ */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>データ復元の確認</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {overwriteData 
              ? '既存のデータをすべて削除して、バックアップから復元します。この操作は元に戻せません。'
              : 'バックアップからデータを復元します。既存のデータとマージされます。'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            キャンセル
          </Button>
          <Button onClick={handleRestore} color="secondary" variant="contained">
            復元する
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}; 