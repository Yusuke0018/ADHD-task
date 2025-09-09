const CACHE_NAME = 'sekki-task-v10';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './styles/base.css',
  './styles/sekki-backgrounds.css',
  './styles/animations.css',
  './styles/components.css',
  './styles/fitness.css',
  './js/app-simple.js',
  './js/sunTimeAPI.js',
  './js/data/sekki-data.js',
  './js/animations/seasonal-animations.js',
  './js/fitness-data.js',
  './js/fitness-core.js',
  './js/fitness-widget.js',
  './fitness.html',
  './js/fitness-app.js'
];

// インストール時にキャッシュ
self.addEventListener('install', event => {
  // 新しいバージョンをすぐにアクティブにする
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// フェッチ時の処理（ネットワークファースト戦略）
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // ネットワークから取得できた場合はキャッシュを更新
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // ネットワークエラーの場合はキャッシュから返す
        return caches.match(event.request);
      })
  );
});

// 古いキャッシュを削除
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  // すぐにコントロールを取得
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // 全てのクライアントをすぐに制御下に置く
      return self.clients.claim();
    })
  );
});
