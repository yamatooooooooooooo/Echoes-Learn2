// このファイルはあえて分離したService Workerのコードです
// より詳細な情報は以下のリンクを参照してください: https://cra.link/PWA

// プロダクション環境でService Workerを有効にするために、'register' を呼び出します。
// これにより、既存のクライアントに対してリソースがキャッシュされ、オフラインでも動作するようになります。

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] はIPv6のlocalhostアドレスです
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8はlocalhostと見なされます
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
};

export function register(config?: Config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL || '', window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // PUBLIC_URLが別オリジンの場合、Service Workerは動作しません。
      // CDNを使用している場合などに該当します。
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL || ''}/service-worker.js`;

      if (isLocalhost) {
        // これはlocalhostで実行しています。Service Workerがまだ存在するか確認しましょう。
        checkValidServiceWorker(swUrl, config);

        // localhostの場合、追加のログを出力して開発者に有益な情報を提供します。
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'このウェブアプリはService Workerによって最初にキャッシュされていて、' +
              'オフラインで使用できます。'
          );
        });
      } else {
        // localhostではないので、直接Service Workerを登録します
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl: string, config?: Config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // この時点で、以前にキャッシュされたコンテンツが取得されましたが、
              // 新しいService Workerがコントロールを持っています。
              console.log(
                '新しいコンテンツが利用可能になり、ページがロードされたときに表示されます。'
              );

              // コールバックを実行
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // この時点で、すべてがプリキャッシュされました。
              // オフライン使用に最適なタイミングです。
              console.log('コンテンツはオフライン使用のためにキャッシュされています。');

              // コールバックを実行
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Service Workerの登録中にエラーが発生しました:', error);
    });
}

function checkValidServiceWorker(swUrl: string, config?: Config) {
  // Service Workerが見つからないか、エラーが発生した場合はページをリロードします
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Service Workerが存在し、JSファイルが正しく提供されていることを確認します
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // Service Workerが見つかりません。おそらく別のアプリです。ページをリロードします。
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service Workerが見つかりました。通常どおり続行します。
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('インターネット接続がありません。アプリはオフラインモードで実行されています。');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
