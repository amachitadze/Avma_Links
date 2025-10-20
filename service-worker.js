/// <reference lib="webworker" />

// Import the Sucrase transpiler
importScripts('https://unpkg.com/sucrase/dist/index.js');

const CACHE_NAME = 'resource-hub-cache-v12'; // Incremented version to ensure SW update

self.addEventListener('install', (event) => {
  // By calling skipWaiting(), the new service worker activates immediately
  // once it has finished installing. This makes updates faster and more reliable.
  // Caching will be handled dynamically by the fetch event handler instead of
  // upfront, which prevents the entire installation from failing.
  console.log('Service Worker: Installing...');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    }).then(() => {
        // claim() is crucial. It allows an active service worker to set itself
        // as the controller for all clients within its scope immediately.
        console.log('Service Worker: Claiming clients...');
        return self.clients.claim();
    })
  );
});

const transpile = (sourceCode) => {
  try {
    return self.sucrase.transform(sourceCode, {
      transforms: ['typescript', 'jsx'],
    }).code;
  } catch (e) {
    console.error('Sucrase transformation failed:', e);
    return `console.error("Failed to transform code:", "${e.message}");`;
  }
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // For TS/TSX files from our origin, use a network-first strategy, then transpile.
  if (url.origin === self.location.origin && (url.pathname.endsWith('.tsx') || url.pathname.endsWith('.ts'))) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network request failed.');
          }
          const resClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, resClone));
          return response.text();
        })
        .catch(() => caches.match(request).then(res => {
          if (!res) throw new Error('File not found in cache.');
          return res.text();
        }))
        .then(sourceCode => new Response(transpile(sourceCode), {
          headers: { 'Content-Type': 'application/javascript' }
        }))
        .catch(error => {
            console.error(`Failed to serve ${url.pathname}:`, error);
            return new Response('File not found', { status: 404 });
        })
    );
    return;
  }

  // For HTML navigation, use a network-first strategy.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const cacheCopy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, cacheCopy));
          }
          return response;
        })
        .catch(() => caches.match(request).then(response => {
          if (response) return response;
          // Fallback to the cached index.html using its full, absolute path.
          const indexUrl = new URL('index.html', self.registration.scope).href;
          return caches.match(indexUrl);
        }))
    );
    return;
  }

  // For all other requests (CSS, fonts, external JS), use a cache-first strategy.
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, cacheCopy);
          });
        }
        return networkResponse;
      });
    })
  );
});