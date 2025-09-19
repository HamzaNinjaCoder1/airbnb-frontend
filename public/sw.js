// Production service worker for push notifications
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  try {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Notification';
    const options = {
      body: data.body || '',
      icon: data.icon || '/icons/notification.svg',
      badge: data.badge || '/icons/notification.svg',
      data: data.data || {},
      requireInteraction: !!data.requireInteraction,
      silent: !!data.silent,
      actions: data.actions || []
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('SW push error:', e);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification && event.notification.data && event.notification.data.url)
    || '/messages';
  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    const client = allClients.find(c => c.url.includes(url));
    if (client) {
      return client.focus();
    } else {
      return self.clients.openWindow(url);
    }
  })());
});