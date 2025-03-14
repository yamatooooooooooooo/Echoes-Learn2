import { 
  Firestore, 
  collection,
  getDocs,
  query,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  limit,
} from 'firebase/firestore';
import { Auth } from 'firebase/auth';

/**
 * Google Driveバックアップサービス
 * Firestoreデータのバックアップと復元を管理する
 */
export class BackupService {
  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {}

  /**
   * ユーザーデータをJSON形式でエクスポートする
   * @returns バックアップデータの文字列表現
   */
  async exportUserData(): Promise<string> {
    try {
      const userId = this.auth.currentUser?.uid;
      if (!userId) {
        throw new Error('ユーザーが認証されていません');
      }

      // バックアップするコレクションのリスト
      const collectionsToBackup = [
        'subjects',    // 科目データ
        'progress',    // 進捗記録
        'userSettings' // ユーザー設定
      ];

      // バックアップデータを格納するオブジェクト
      const backupData: any = {
        metadata: {
          userId: userId,
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        },
        collections: {}
      };

      // 各コレクションのデータを取得
      for (const collectionName of collectionsToBackup) {
        // userSettingsはユーザーIDがドキュメントIDとして使用されているため特別処理
        if (collectionName === 'userSettings') {
          const settingsDoc = doc(this.firestore, collectionName, userId);
          const settingsSnapshot = await getDocs(query(collection(this.firestore, collectionName), limit(1)));
          
          if (!settingsSnapshot.empty) {
            backupData.collections[collectionName] = [
              {
                id: settingsSnapshot.docs[0].id,
                data: settingsSnapshot.docs[0].data()
              }
            ];
          }
          continue;
        }

        // 通常のユーザーコレクション
        const collectionRef = collection(this.firestore, 'users', userId, collectionName);
        const querySnapshot = await getDocs(collectionRef);
        
        // ドキュメントデータを追加
        backupData.collections[collectionName] = [];
        querySnapshot.forEach(doc => {
          backupData.collections[collectionName].push({
            id: doc.id,
            data: doc.data()
          });
        });
      }

      // データをJSON文字列に変換
      return JSON.stringify(backupData, (key, value) => {
        // Timestamp型の値をISOフォーマットの日付文字列に変換
        if (value && typeof value === 'object' && value.toDate && typeof value.toDate === 'function') {
          return value.toDate().toISOString();
        }
        return value;
      }, 2);
    } catch (error) {
      console.error('データのエクスポート中にエラーが発生しました:', error);
      throw new Error(`バックアップの作成に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  }

  /**
   * JSONデータをFirestoreにインポートする
   * @param jsonData インポートするJSONデータ
   * @param options インポートオプション
   * @returns 処理結果の概要
   */
  async importUserData(jsonData: string, options: ImportOptions = { overwrite: false }): Promise<ImportResult> {
    try {
      const userId = this.auth.currentUser?.uid;
      if (!userId) {
        throw new Error('ユーザーが認証されていません');
      }

      // JSONデータをパース
      const backupData = JSON.parse(jsonData);
      
      // メタデータの検証
      if (!backupData.metadata || !backupData.collections) {
        throw new Error('不正なバックアップデータ形式です');
      }

      const result: ImportResult = {
        totalDocuments: 0,
        importedDocuments: 0,
        errors: []
      };

      // 上書きフラグが有効の場合は既存データを削除
      if (options.overwrite) {
        await this.cleanupUserData();
      }

      // 各コレクションのデータをインポート
      for (const collectionName in backupData.collections) {
        const documents = backupData.collections[collectionName];
        result.totalDocuments += documents.length;

        // userSettingsは特別処理
        if (collectionName === 'userSettings') {
          try {
            const settingsRef = doc(this.firestore, collectionName, userId);
            
            // 最初のドキュメントだけをインポート
            if (documents.length > 0) {
              // タイムスタンプや日付文字列をDate型に変換
              const data = this.convertTimestampsToDate(documents[0].data);
              await setDoc(settingsRef, data);
              result.importedDocuments++;
            }
          } catch (error) {
            console.error(`設定のインポート中にエラーが発生しました:`, error);
            result.errors.push(`設定のインポート失敗: ${error instanceof Error ? error.message : '不明なエラー'}`);
          }
          continue;
        }

        // 通常のユーザーコレクション
        try {
          const batch = writeBatch(this.firestore);
          let batchCount = 0;
          const BATCH_LIMIT = 400; // Firestoreのバッチ制限は500

          for (const document of documents) {
            // データの変換処理（タイムスタンプなど）
            const data = this.convertTimestampsToDate(document.data);
            
            const docRef = doc(this.firestore, 'users', userId, collectionName, document.id);
            batch.set(docRef, data);
            batchCount++;
            result.importedDocuments++;

            // バッチの制限に達したらコミット
            if (batchCount >= BATCH_LIMIT) {
              await batch.commit();
              batchCount = 0;
            }
          }

          // 残りのドキュメントをコミット
          if (batchCount > 0) {
            await batch.commit();
          }
        } catch (error) {
          console.error(`${collectionName}のインポート中にエラーが発生しました:`, error);
          result.errors.push(`${collectionName}のインポート失敗: ${error instanceof Error ? error.message : '不明なエラー'}`);
        }
      }

      return result;
    } catch (error) {
      console.error('データのインポート中にエラーが発生しました:', error);
      throw new Error(`復元に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  }

  /**
   * ユーザーデータを初期化（削除）する
   */
  private async cleanupUserData(): Promise<void> {
    const userId = this.auth.currentUser?.uid;
    if (!userId) {
      throw new Error('ユーザーが認証されていません');
    }

    const collectionsToCleanup = ['subjects', 'progress'];

    for (const collectionName of collectionsToCleanup) {
      const collectionRef = collection(this.firestore, 'users', userId, collectionName);
      const querySnapshot = await getDocs(collectionRef);
      
      const batch = writeBatch(this.firestore);
      let batchCount = 0;
      const BATCH_LIMIT = 400;

      querySnapshot.forEach(document => {
        batch.delete(document.ref);
        batchCount++;

        if (batchCount >= BATCH_LIMIT) {
          batch.commit();
          batchCount = 0;
        }
      });

      if (batchCount > 0) {
        await batch.commit();
      }
    }

    // userSettings は特別対応
    const settingsRef = doc(this.firestore, 'userSettings', userId);
    try {
      await deleteDoc(settingsRef);
    } catch (error) {
      console.warn('設定の削除中にエラーが発生しました:', error);
    }
  }

  /**
   * JSONデータからJavaScript Date型に変換
   */
  private convertTimestampsToDate(data: any): any {
    // オブジェクトでない場合はそのまま返す
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    // 配列の場合は各要素を再帰的に処理
    if (Array.isArray(data)) {
      return data.map(item => this.convertTimestampsToDate(item));
    }

    // オブジェクトの場合は各プロパティを再帰的に処理
    const result: any = {};
    for (const key in data) {
      const value = data[key];
      
      // ISO形式の日付文字列を日付オブジェクトに変換
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d+)?Z$/.test(value)) {
        result[key] = new Date(value);
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.convertTimestampsToDate(value);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }
}

/**
 * インポートオプション
 */
export interface ImportOptions {
  overwrite: boolean;  // 既存データを上書きするかどうか
}

/**
 * インポート結果
 */
export interface ImportResult {
  totalDocuments: number;     // 合計ドキュメント数
  importedDocuments: number;  // インポートされたドキュメント数
  errors: string[];           // エラーメッセージのリスト
} 