import { useState, useEffect } from 'react';

/**
 * ローカルストレージに値を保存・取得するためのカスタムフック
 * @param key ローカルストレージのキー
 * @param initialValue 初期値
 * @returns [値, 値を設定する関数]
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // ローカルストレージから値を取得する関数
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // 初期値を設定
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // 値を設定し、ローカルストレージに保存する関数
  const setValue = (value: T) => {
    try {
      // 新しい値を状態にセット
      setStoredValue(value);
      
      // ローカルストレージに保存
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
        
        // ストレージイベントを発火して他のタブやウィンドウに通知
        const event = new Event('local-storage');
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // ウィンドウのストレージイベントを監視して、他のタブからの変更を反映
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        setStoredValue(JSON.parse(event.newValue) as T);
      }
    };
    
    // 同じタブ内でのイベントも監視
    const handleLocalEvent = () => {
      setStoredValue(readValue());
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleLocalEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleLocalEvent);
    };
  }, [key]);

  return [storedValue, setValue];
} 