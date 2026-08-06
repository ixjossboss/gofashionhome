const CACHE_NAME = 'gof-luxury-cache-v3';

const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/robots.txt',
  '/src/main.tsx',
  '/src/index.css',
  '/src/assets/images/luxury_bespoke_bag_1784545528945.jpg',
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400&family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@300;400;500;600;700&display=swap'
];

// Custom luxury SVG placeholder for uncached images requested when offline
const OFFLINE_IMAGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none">
  <rect width="600" height="400" fill="#020617"/>
  <rect x="10" y="10" width="580" height="380" stroke="#D80064" stroke-width="1.5" stroke-dasharray="6 6" opacity="0.5"/>
  <circle cx="300" cy="170" r="32" fill="#0A235C" stroke="#D80064" stroke-width="2"/>
  <path d="M292 162 L308 178 M308 162 L292 178" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
  <text x="50%" y="235" dominant-baseline="middle" text-anchor="middle" fill="#FFFFFF" font-family="serif" font-size="15" font-weight="700" letter-spacing="2">GO FASHION HOME</text>
  <text x="50%" y="260" dominant-baseline="middle" text-anchor="middle" fill="#94A3B8" font-family="sans-serif" font-size="12">Offline Mode • Reconnect to view image</text>
</svg>`;

// Install Event - Pre-cache essential shells and static assets safely
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[GO Fashion Home ServiceWorker] Pre-caching core layout shell');
      return Promise.allSettled(
        STATIC_RESOURCES.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[ServiceWorker] Pre-cache skipped for:', url, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up obsolete caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[GO Fashion Home ServiceWorker] Cleared old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Smart Caching Orchestration (Network-First, Cache-First, or Offline Fallback)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (e.g. POST to Firestore/API)
  if (request.method !== 'GET') return;

  // 1. API Catalog Requests: Network-First with a cached offline fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return new Response(
              JSON.stringify({ 
                error: "Offline", 
                message: "You are currently offline or under weak network conditions." 
              }), 
              { headers: { 'Content-Type': 'application/json' }, status: 503 }
            );
          });
        })
    );
    return;
  }

  // 2. Heavy Images & Web Fonts: Cache-First strategy to guarantee instant high-fidelity loading
  const isImageDestination = request.destination === 'image' || /\.(png|jpg|jpeg|svg|webp|gif|ico)$/i.test(url.pathname);
  const isFontOrImageDomain = url.hostname.includes('unsplash.com') || 
                              url.hostname.includes('fonts.gstatic.com') ||
                              url.hostname.includes('fonts.googleapis.com');

  if (isImageDestination || isFontOrImageDomain) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Stale-While-Revalidate background refresh
          fetch(request).then((networkResponse) => {
            if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          }).catch(() => {/* Silent background sync fail when offline */});
          
          return cachedResponse;
        }

        // Fetch and cache for future instant displays (supports opaque cross-origin fonts/images)
        return fetch(request).then((networkResponse) => {
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => {
          // Return custom SVG placeholder if image fetch fails offline and isn't cached
          if (isImageDestination) {
            return new Response(OFFLINE_IMAGE_SVG, {
              headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store' }
            });
          }
          return new Response('', { status: 408, statusText: 'Offline Request Timeout' });
        });
      })
    );
    return;
  }

  // 3. Navigation Requests: Network-First with /index.html offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match('/index.html').then((cachedIndex) => {
            return cachedIndex || caches.match('/');
          });
        })
    );
    return;
  }

  // 4. Default App Shell/Assets: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {/* Offline fallback handles natively */});

      return cachedResponse || fetchPromise;
    })
  );
});

