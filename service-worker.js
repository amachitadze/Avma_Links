/// <reference lib="webworker" />

// Import the Sucrase transpiler
importScripts('https://unpkg.com/sucrase/dist/index.js');

const CACHE_NAME = 'resource-hub-cache-v11'; // Incremented version

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('Service Worker: Caching app shell and resources');

      const RELATIVE_URLS_TO_CACHE = [
        // App shell
        '', // For the root path
        'index.html',
        'manifest.json',
        'index.tsx', 
        'App.tsx',
        'types.ts',
        'constants.ts',
        // Components
        'components/AddLinkFab.tsx',
        'components/CategorySection.tsx',
        'components/ChromeBookmarksViewer.tsx',
        'components/ConfirmationModal.tsx',
        'components/TopActionMenu.tsx',
        'components/HamburgerMenu.tsx',
        'components/Header.tsx',
        'components/icons.tsx',
        'components/LinkCard.tsx',
        'components/LinkModal.tsx',
        'components/MoveModeControls.tsx',
        'components/SearchBar.tsx',
        'components/ViewControls.tsx',
      ];
      
      const ABSOLUTE_URLS_TO_CACHE = [
        'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
        'https://cdn.tailwindcss.com',
        'https://unpkg.com/sucrase/dist/index.js',
      ];
      
      // Construct full, absolute URLs from the SW's scope
      const urlsToCache = RELATIVE_URLS_TO_CACHE.map(relativeUrl => {
        return new URL(relativeUrl, self.registration.scope).href;
      }).concat(ABSOLUTE_URLS_TO_CACHE);

      // Use a Set to prevent duplicates (e.g., scope URL and scope URL + 'index.html')
      const uniqueUrlsToCache = [...new Set(urlsToCache)];
      
      console.log('Service Worker: Caching the following URLs:', uniqueUrlsToCache);
      
      try {
        await cache.addAll(uniqueUrlsToCache);
      } catch (error) {
        console.error('Failed to cache resources during install:', error);
        // Let the promise reject to indicate a failed installation
        throw error;
      }
    })
  );
});

self.addEventListener('activate', (event) => {
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