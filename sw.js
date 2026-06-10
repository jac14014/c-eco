
// ============================================
// c-ECO STRUCTURAL REVIEW ENGINE — SERVICE WORKER
// Version 2.6.0 | June 2026
// ============================================
const CACHE_NAME = 'c-eco-review-v2-6-0';
const STATIC_CACHE = 'c-eco-static-v2-6-0';
const DYNAMIC_CACHE = 'c-eco-dynamic-v2-6-0';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/fellowship/fellowship-app.html',
  '/fellowship/fellowship-portal.html',
  '/offline.html',
  '/manifest.json',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.jpg'
];

// ============================================
// INSTALL — Cache static assets
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing c-ECO Review Engine...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] Cache failed:', err);
      })
  );
});

// ============================================
// ACTIVATE — Clean old caches
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name.startsWith('c-eco-') &&
                name !== STATIC_CACHE &&
                name !== DYNAMIC_CACHE;
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activated');
        return self.clients.claim();
      })
  );
});

// ============================================
// FETCH — Cache strategies
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip API calls (don't cache backend)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Skip external URLs
  if (url.origin !== self.location.origin) {
    return;
  }

  // Strategy: Cache First for static assets
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Strategy: Network First for HTML pages
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Default: Stale While Revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// ============================================
// CACHE STRATEGIES
// ============================================
function isStaticAsset(request) {
  const staticExtensions = [
    '.css', '.js', '.png', '.jpg', '.jpeg', '.svg',
    '.woff', '.woff2', '.ttf', '.ico'
  ];
  return staticExtensions.some(ext => request.url.endsWith(ext));
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  try {
    const response = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    return new Response('Offline — Asset unavailable', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    // Offline fallback page
    return caches.match('/offline.html');
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then(c => c.put(request, response.clone()));
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

// ============================================
// PUSH NOTIFICATIONS (future)
// ============================================
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const options = {
    body: data.body || 'Structural review update available.',
    icon: '/assets/icons/icon-192.png',
    badge: '/assets/icons/icon-72.png',
    tag: data.tag || 'c-eco-review',
    requireInteraction: true,
    data: { url: data.url || '/fellowship/fellowship-app.html' }
  };
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'c-ECO Review Engine',
      options
    )
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/fellowship/fellowship-app.html')
  );
});

// ============================================
// BACKGROUND SYNC (future)
// ============================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-submissions') {
    event.waitUntil(syncPendingSubmissions());
  }
});

async function syncPendingSubmissions() {
  console.log('[SW] Background sync triggered');
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'SYNC_PENDING' });
  });
}

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] c-ECO Structural Review Engine v2.6.0 loaded');
