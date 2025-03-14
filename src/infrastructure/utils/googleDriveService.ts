import { BackupService } from './backupService';

/**
 * Google Drive APIとの連携を管理するサービスクラス
 */
export class GoogleDriveService {
  private readonly CLIENT_ID = process.env.REACT_APP_GOOGLE_DRIVE_CLIENT_ID;
  private readonly API_KEY = process.env.REACT_APP_GOOGLE_DRIVE_API_KEY;
  private readonly DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
  private readonly SCOPES = 'https://www.googleapis.com/auth/drive.file';
  
  private isInitialized = false;
  private isAuthenticated = false;
  
  /**
   * Google API クライアントの初期化
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Google APIをロード
      await this.loadGoogleAPI();
      
      // API ClientとAuth2を初期化
      await new Promise<void>((resolve, reject) => {
        window.gapi.client.init({
          apiKey: this.API_KEY,
          clientId: this.CLIENT_ID,
          discoveryDocs: this.DISCOVERY_DOCS,
          scope: this.SCOPES
        }).then(() => {
          this.isInitialized = true;
          // 認証状態を更新
          this.isAuthenticated = window.gapi.auth2.getAuthInstance().isSignedIn.get();
          resolve();
        }).catch((error: any) => {
          console.error('Google API初期化エラー:', error);
          reject(new Error('Google API初期化に失敗しました'));
        });
      });
    } catch (error) {
      console.error('Google Drive API初期化エラー:', error);
      throw new Error('Google Drive APIの初期化に失敗しました');
    }
  }
  
  /**
   * Google APIをロード
   */
  private loadGoogleAPI(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Google APIがすでにロード済みの場合
      if (window.gapi) {
        window.gapi.load('client:auth2', {
          callback: () => resolve(),
          onerror: () => reject(new Error('Google APIのロードに失敗しました')),
        });
      } else {
        reject(new Error('Google APIが利用できません'));
      }
    });
  }
  
  /**
   * Google アカウントにサインイン
   */
  async signIn(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      await window.gapi.auth2.getAuthInstance().signIn();
      this.isAuthenticated = true;
    } catch (error) {
      console.error('Googleサインインエラー:', error);
      throw new Error('Googleアカウントへのサインインに失敗しました');
    }
  }
  
  /**
   * Google アカウントからサインアウト
   */
  async signOut(): Promise<void> {
    if (!this.isInitialized) return;
    
    try {
      await window.gapi.auth2.getAuthInstance().signOut();
      this.isAuthenticated = false;
    } catch (error) {
      console.error('Googleサインアウトエラー:', error);
      throw new Error('Googleアカウントからのサインアウトに失敗しました');
    }
  }
  
  /**
   * 認証状態を確認
   */
  isSignedIn(): boolean {
    return this.isAuthenticated;
  }
  
  /**
   * データをGoogle Driveにバックアップ
   * @param backupService バックアップサービス
   * @param fileName ファイル名
   */
  async backupToGoogleDrive(backupService: BackupService, fileName: string = 'echoes_backup.json'): Promise<string> {
    if (!this.isInitialized || !this.isAuthenticated) {
      await this.signIn();
    }
    
    try {
      // バックアップデータを取得
      const backupData = await backupService.exportUserData();
      
      // バックアップファイルのメタデータ
      const fileMetadata = {
        name: fileName,
        mimeType: 'application/json',
        parents: ['appDataFolder'] // アプリ専用フォルダに保存
      };
      
      // 既存の同名ファイルを検索
      const existingFile = await this.findFile(fileName);
      
      let response;
      if (existingFile) {
        // 既存ファイルを更新
        response = await window.gapi.client.drive.files.update({
          fileId: existingFile.id,
          media: {
            mimeType: 'application/json',
            body: backupData
          }
        });
      } else {
        // 新規ファイルとして作成
        response = await window.gapi.client.drive.files.create({
          resource: fileMetadata,
          media: {
            mimeType: 'application/json',
            body: backupData
          },
          fields: 'id'
        });
      }
      
      return response.result.id;
    } catch (error) {
      console.error('バックアップエラー:', error);
      throw new Error('Google Driveへのバックアップに失敗しました');
    }
  }
  
  /**
   * Google Driveからデータを復元
   * @param backupService バックアップサービス
   * @param fileId バックアップファイルのID（指定されない場合は最新のバックアップファイルを使用）
   * @param options インポートオプション
   */
  async restoreFromGoogleDrive(
    backupService: BackupService, 
    fileId?: string, 
    options = { overwrite: false }
  ): Promise<any> {
    if (!this.isInitialized || !this.isAuthenticated) {
      await this.signIn();
    }
    
    try {
      // ファイルIDが指定されていない場合は最新のバックアップファイルを検索
      if (!fileId) {
        const file = await this.findLatestBackupFile();
        if (!file) {
          throw new Error('バックアップファイルが見つかりません');
        }
        fileId = file.id;
      }
      
      // ファイルコンテンツを取得
      const response = await window.gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media'
      });
      
      // 復元処理を実行
      return await backupService.importUserData(JSON.stringify(response.result), options);
    } catch (error) {
      console.error('復元エラー:', error);
      throw new Error('Google Driveからの復元に失敗しました');
    }
  }
  
  /**
   * 最新のバックアップファイルを検索
   */
  private async findLatestBackupFile(): Promise<{id: string, name: string, modifiedTime: string} | null> {
    try {
      const response = await window.gapi.client.drive.files.list({
        spaces: 'appDataFolder',
        q: "name contains 'echoes_backup' and mimeType='application/json'",
        fields: 'files(id, name, modifiedTime)',
        orderBy: 'modifiedTime desc',
        pageSize: 1
      });
      
      const files = response.result.files;
      if (files && files.length > 0) {
        return files[0];
      }
      
      return null;
    } catch (error) {
      console.error('ファイル検索エラー:', error);
      throw new Error('バックアップファイルの検索に失敗しました');
    }
  }
  
  /**
   * ファイル名でファイルを検索
   * @param fileName ファイル名
   */
  private async findFile(fileName: string): Promise<{id: string} | null> {
    try {
      const response = await window.gapi.client.drive.files.list({
        spaces: 'appDataFolder',
        q: `name='${fileName}' and mimeType='application/json'`,
        fields: 'files(id)',
        pageSize: 1
      });
      
      const files = response.result.files;
      if (files && files.length > 0) {
        return files[0];
      }
      
      return null;
    } catch (error) {
      console.error('ファイル検索エラー:', error);
      throw new Error('ファイルの検索に失敗しました');
    }
  }
  
  /**
   * 利用可能なバックアップファイルのリストを取得
   */
  async listBackupFiles(): Promise<Array<{id: string, name: string, modifiedTime: string, size: string}>> {
    if (!this.isInitialized || !this.isAuthenticated) {
      await this.signIn();
    }
    
    try {
      const response = await window.gapi.client.drive.files.list({
        spaces: 'appDataFolder',
        q: "name contains 'echoes_backup' and mimeType='application/json'",
        fields: 'files(id, name, modifiedTime, size)',
        orderBy: 'modifiedTime desc'
      });
      
      return response.result.files || [];
    } catch (error) {
      console.error('ファイルリスト取得エラー:', error);
      throw new Error('バックアップファイルリストの取得に失敗しました');
    }
  }
}

// TypeScript型定義
declare global {
  interface Window {
    gapi: {
      load: (apiName: string, options: any) => void;
      client: {
        init: (options: any) => Promise<any>;
        drive: {
          files: {
            create: (options: any) => Promise<any>;
            update: (options: any) => Promise<any>;
            get: (options: any) => Promise<any>;
            list: (options: any) => Promise<any>;
          };
        };
      };
      auth2: {
        getAuthInstance: () => {
          isSignedIn: {
            get: () => boolean;
          };
          signIn: () => Promise<any>;
          signOut: () => Promise<any>;
        };
      };
    };
  }
} 