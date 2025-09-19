self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  try { 
    data = event.data ? event.data.json() : {}; 
  } catch (_) {}

  const title = data.title || 'Notification';
  const body = data.body || '';
  const icon = data.icon || '/icons/notification.svg';
  const badge = data.badge || '/icons/notification.svg';

  const options = {
    body,
    icon,
    badge,
    data: data.data || {},
    tag: (data.data && data.data.kind) || 'generic',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/messages';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      const client = clientsArr.find(c => c.url.includes(url) || c.visibilityState === 'visible');
      if (client) { 
        client.focus(); 
        client.navigate(url); 
        return; 
      }
      return clients.openWindow(url);
    })
  );
});