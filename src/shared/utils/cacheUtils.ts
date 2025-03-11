/**
 * インメモリキャッシュユーティリティ
 * Firestoreへのクエリ回数を削減するためのシンプルなキャッシュシステム
 */

interface CacheEntry<T> {
  value: T;
  expiry: number; // タイムスタンプ（ミリ秒）
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 60 * 1000; // デフォルトのTTL: 60秒
  
  /**
   * キャッシュからデータを取得する
   * @param key キャッシュキー
   * @returns キャッシュされた値、または undefined（キャッシュミス時）
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined; // キャッシュミス
    }
    
    const now = Date.now();
    if (entry.expiry < now) {
      // キャッシュが期限切れなら削除
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value as T;
  }
  
  /**
   * データをキャッシュに保存する
   * @param key キャッシュキー
   * @param value キャッシュする値
   * @param ttl キャッシュの有効期限（ミリ秒）。省略時はデフォルト値を使用
   */
  set<T>(key: string, value: T, ttl: number = this.defaultTTL): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }
  
  /**
   * キャッシュからデータを削除する
   * @param key キャッシュキー
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * 指定されたプレフィックスで始まるすべてのキャッシュエントリを削除する
   * @param prefix キャッシュキーのプレフィックス
   */
  deleteByPrefix(prefix: string): void {
    // Array.fromを使用してIterableをArrayに変換
    const keys = Array.from(this.cache.keys());
    
    for (const key of keys) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * キャッシュを完全にクリアする
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * 期限切れの全てのキャッシュエントリを削除する
   */
  cleanExpired(): void {
    const now = Date.now();
    // Array.fromを使用してIterableをArrayに変換
    const entries = Array.from(this.cache.entries());
    
    for (const [key, entry] of entries) {
      if (entry.expiry < now) {
        this.cache.delete(key);
      }
    }
  }
}

// シングルトンとして公開
export const cacheManager = new CacheManager(); 