// Enhanced Service Worker for Siraha Bazaar PWA
const CACHE_NAME = 'siraha-bazaar-v2';
const STATIC_CACHE = 'siraha-bazaar-static-v2';
const DYNAMIC_CACHE = 'siraha-bazaar-dynamic-v2';
const API_CACHE = 'siraha-bazaar-api-v2';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/assets/icon2.png',
  '/offline.html'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/products',
  '/api/stores',
  '/api/restaurants',
  '/api/categories'
];

// Install event - Cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      }),
      self.skipWaiting()
    ])
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Fetch event - Implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (request.url.includes('/api/')) {
    // API requests - Network First with fallback to cache
    event.respondWith(networkFirstWithFallback(request, API_CACHE));
  } else if (request.destination === 'image') {
    // Images - Cache First
    event.respondWith(cacheFirstWithFallback(request, DYNAMIC_CACHE));
  } else if (STATIC_ASSETS.some(asset => request.url.endsWith(asset))) {
    // Static assets - Cache First
    event.respondWith(cacheFirstWithFallback(request, STATIC_CACHE));
  } else {
    // Other requests - Network First with offline fallback
    event.respondWith(networkFirstWithOfflineFallback(request));
  }
});

// Network First strategy with cache fallback
async function networkFirstWithFallback(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(cacheName);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Cache First strategy with network fallback
async function cacheFirstWithFallback(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Failed to fetch:', request.url);
    throw error;
  }
}

// Network First with offline page fallback
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Professional push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const { title, body, icon, badge, actions, requireInteraction, data: notificationData, type } = data;

  // Professional notification options based on type
  const getNotificationOptions = (type) => {
    const baseOptions = {
      body,
      icon: icon || '/assets/icon2.png',
      badge: badge || '/assets/icon2.png',
      data: notificationData,
      tag: `siraha-${type || 'general'}-${Date.now()}`,
      timestamp: Date.now(),
      silent: false
    };

    switch (type) {
      case 'delivery_assignment':
        return {
          ...baseOptions,
          requireInteraction: true,
          vibrate: [300, 200, 300, 200, 300],
          actions: [
            { action: 'accept', title: '✅ Accept', icon: '/assets/icon2.png' },
            { action: 'view', title: '👁️ View Details', icon: '/assets/icon2.png' }
          ]
        };
      
      case 'order_update':
        return {
          ...baseOptions,
          requireInteraction: false,
          vibrate: [200, 100, 200],
          actions: [
            { action: 'track', title: '📍 Track Order', icon: '/assets/icon2.png' }
          ]
        };
      
      case 'promotion':
        return {
          ...baseOptions,
          requireInteraction: false,
          vibrate: [100, 50, 100],
          actions: [
            { action: 'view', title: '🛍️ View Offer', icon: '/assets/icon2.png' }
          ]
        };
      
      case 'delivery_status':
        return {
          ...baseOptions,
          requireInteraction: false,
          vibrate: [200, 100, 200],
          actions: [
            { action: 'track', title: '📍 Track Delivery', icon: '/assets/icon2.png' }
          ]
        };
      
      default:
        return baseOptions;
    }
  };

  const options = getNotificationOptions(type);
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const { action, data } = event;
  const { url, orderId, deliveryId } = data || {};

  let targetUrl = '/';

  // Handle notification actions
  switch (action) {
    case 'accept':
      targetUrl = `/delivery-partner/dashboard?action=accept&deliveryId=${deliveryId}`;
      break;
    case 'track':
      targetUrl = orderId ? `/orders/${orderId}/tracking` : '/';
      break;
    case 'view':
      targetUrl = url || '/';
      break;
    default:
      targetUrl = url || '/';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if a window is already open
        for (const client of clientList) {
          if (client.url === targetUrl && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open a new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle offline actions when network is restored
      handleBackgroundSync()
    );
  }
});

async function handleBackgroundSync() {
  // Handle any offline actions that need to be synced
  console.log('Background sync triggered');
  // This could handle offline cart updates, order submissions, etc.
}

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});