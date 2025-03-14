/**
 * パフォーマンス最適化のためのユーティリティ関数
 */
import React, { useEffect, useRef, useCallback, useState, useMemo, DependencyList, ComponentType } from 'react';
import { PERF_CONFIG } from '../config';

/**
 * デバウンス関数 - 連続して発生するイベントを指定時間後に一度だけ実行
 * @param fn 実行する関数
 * @param delay 遅延時間（ミリ秒）
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T, 
  delay = PERF_CONFIG.DEBOUNCE_INTERVAL
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * スロットル関数 - 指定した間隔でのみ関数実行を許可
 * @param fn 実行する関数
 * @param limit 制限時間（ミリ秒）
 */
export const throttle = <T extends (...args: any[]) => any>(
  fn: T, 
  limit = PERF_CONFIG.THROTTLE_INTERVAL
): ((...args: Parameters<T>) => void) => {
  let lastFunc: NodeJS.Timeout;
  let lastRan: number;
  
  return function(...args: Parameters<T>) {
    if (!lastRan) {
      fn(...args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if (Date.now() - lastRan >= limit) {
          fn(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

/**
 * デバウンスフックを提供
 * @param fn 実行する関数
 * @param delay 遅延時間（ミリ秒）
 * @param deps 依存配列
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  fn: T, 
  delay = PERF_CONFIG.DEBOUNCE_INTERVAL,
  deps: DependencyList = []
): ((...args: Parameters<T>) => void) => {
  const callback = useCallback(fn, deps);
  
  const debouncedCallback = useMemo(
    () => debounce(callback, delay),
    [callback, delay]
  );
  
  return debouncedCallback;
};

/**
 * スロットルフックを提供
 * @param fn 実行する関数
 * @param limit 制限時間（ミリ秒）
 * @param deps 依存配列
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  fn: T, 
  limit = PERF_CONFIG.THROTTLE_INTERVAL,
  deps: DependencyList = []
): ((...args: Parameters<T>) => void) => {
  const callback = useCallback(fn, deps);
  
  const throttledCallback = useMemo(
    () => throttle(callback, limit),
    [callback, limit]
  );
  
  return throttledCallback;
};

/**
 * 値のデバウンスを行うフック
 * @param value デバウンスする値
 * @param delay 遅延時間（ミリ秒）
 */
export const useDebounceValue = <T>(value: T, delay = PERF_CONFIG.DEBOUNCE_INTERVAL): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

/**
 * 前回のレンダリングで使用した値をメモリに保持する
 * @param value 記憶する値
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
};

/**
 * IntersectionObserver APIを使用した要素の表示監視フック
 * @param options IntersectionObserver オプション
 */
export const useIntersectionObserver = (
  options: IntersectionObserverInit = { threshold: 0.1 }
) => {
  const [ref, setRef] = useState<Element | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  
  useEffect(() => {
    if (ref) {
      if (observer.current) {
        observer.current.disconnect();
      }
      
      observer.current = new IntersectionObserver(([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      }, options);
      
      observer.current.observe(ref);
    }
    
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [ref, options]);
  
  return { ref: setRef, isIntersecting };
};

/**
 * リソースプリフェッチ関数 - 事前にリソースを読み込む
 * @param url プリフェッチするURL
 * @param type リソースタイプ
 */
export const prefetchResource = (url: string, type: 'image' | 'style' | 'script' = 'image'): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      if (type === 'image') {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
      } else if (type === 'style') {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = url;
        link.onload = () => resolve();
        link.onerror = reject;
        document.head.appendChild(link);
      } else if (type === 'script') {
        const script = document.createElement('link');
        script.rel = 'preload';
        script.as = 'script';
        script.href = url;
        script.onload = () => resolve();
        script.onerror = reject;
        document.head.appendChild(script);
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * キャッシュを管理するためのユーティリティクラス
 */
export class MemoryCache<T> {
  private cache: Map<string, { value: T; expiry: number }> = new Map();
  
  /**
   * キャッシュに値を設定
   * @param key キー
   * @param value 値
   * @param ttl 有効期限（ミリ秒）
   */
  set(key: string, value: T, ttl = PERF_CONFIG.MEMO_TTL): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }
  
  /**
   * キャッシュから値を取得
   * @param key キー
   */
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // 有効期限切れの場合、キャッシュから削除
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  /**
   * キャッシュから値を削除
   * @param key キー
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * キャッシュをクリア
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * 有効期限切れのキャッシュをクリア
   */
  clearExpired(): void {
    const now = Date.now();
    // 反復可能なエントリーのリスト化で対応
    Array.from(this.cache.entries()).forEach(([key, item]) => {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    });
  }
}

// グローバルキャッシュインスタンス
export const globalCache = new MemoryCache<any>();

/**
 * 関数の結果をメモ化するためのユーティリティ
 * @param fn メモ化する関数
 * @param getKey キーを生成する関数
 * @param ttl 有効期限（ミリ秒）
 */
export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  getKey: (...args: Parameters<T>) => string = (...args) => JSON.stringify(args),
  ttl = PERF_CONFIG.MEMO_TTL
): ((...args: Parameters<T>) => ReturnType<T>) => {
  const cache = new MemoryCache<ReturnType<T>>();
  
  return (...args: Parameters<T>): ReturnType<T> => {
    const key = getKey(...args);
    const cached = cache.get(key);
    
    if (cached !== null) {
      return cached;
    }
    
    const result = fn(...args);
    cache.set(key, result, ttl);
    return result;
  };
};

/**
 * ウィンドウサイズのリサイズを監視するフック
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  const handleResize = useThrottle(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }, 200);
  
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);
  
  return windowSize;
};

/**
 * リスト仮想化のための簡易ユーティリティ
 * @param items 全アイテムのリスト
 * @param visibleItems 一度に表示するアイテム数
 * @param itemHeight アイテムの高さ（ピクセル）
 */
export const useVirtualList = <T>(items: T[], visibleItems = 10, itemHeight = 50) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight));
  const endIndex = Math.min(items.length, startIndex + visibleItems);
  
  const visibleData = useMemo(() => {
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      style: { height: itemHeight, transform: `translateY(${(startIndex + index) * itemHeight}px)` }
    }));
  }, [items, startIndex, endIndex, itemHeight]);
  
  const handleScroll = useThrottle(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, 50);
  
  return {
    containerRef,
    containerProps: {
      onScroll: handleScroll,
      style: { height: visibleItems * itemHeight, overflowY: 'auto', position: 'relative' as const }
    },
    totalHeight,
    visibleData
  };
};

/**
 * コンポーネントのレンダリング時間を計測するHOC
 * 開発環境でのみ有効
 */
export const withPerformanceTracking = <P extends object>(
  Component: ComponentType<P>,
  componentName: string
): React.FC<P> => {
  const displayName = componentName || Component.displayName || Component.name || 'Component';
  
  const PerformanceTrackedComponent: React.FC<P> = (props) => {
    const startTime = useRef<number>();
    
    useEffect(() => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Performance] ${displayName} mounted`);
        return () => {
          console.log(`[Performance] ${displayName} unmounted`);
        };
      }
    }, []);
    
    useEffect(() => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Performance] ${displayName} rendered`);
      }
    });
    
    startTime.current = performance.now();
    
    const result = <Component {...props} />;
    
    if (process.env.NODE_ENV !== 'production' && startTime.current) {
      const endTime = performance.now();
      const renderTime = endTime - startTime.current;
      if (renderTime > 16) { // 60fpsに相当する16.67msを超えた場合に警告
        console.warn(`[Performance Warning] ${displayName} took ${renderTime.toFixed(2)}ms to render`);
      }
    }
    
    return result;
  };
  
  PerformanceTrackedComponent.displayName = `withPerformanceTracking(${displayName})`;
  
  return PerformanceTrackedComponent;
}; 