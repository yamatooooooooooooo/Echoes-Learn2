const reportWebVitals = (onPerfEntry?: any) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then((webVitals) => {
      // 型安全でない方法で動的にプロパティにアクセス
      const vitalsModule = webVitals as any;
      if (vitalsModule.getCLS) vitalsModule.getCLS(onPerfEntry);
      if (vitalsModule.getFID) vitalsModule.getFID(onPerfEntry);
      if (vitalsModule.getFCP) vitalsModule.getFCP(onPerfEntry);
      if (vitalsModule.getLCP) vitalsModule.getLCP(onPerfEntry);
      if (vitalsModule.getTTFB) vitalsModule.getTTFB(onPerfEntry);
    }).catch(error => {
      console.error('Web Vitalsの読み込みに失敗しました:', error);
    });
  }
};

export default reportWebVitals; 