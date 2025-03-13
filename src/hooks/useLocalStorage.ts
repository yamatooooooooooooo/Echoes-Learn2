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
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // 値を設定する関数
  const setValue = (value: T) => {
    try {
      const newValue = value instanceof Function ? value(storedValue) : value;
      window.localStorage.setItem(key, JSON.stringify(newValue));
      setStoredValue(newValue);
      window.dispatchEvent(new Event('local-storage'));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    setStoredValue(readValue());
  }, []);

  return [storedValue, setValue];
} 