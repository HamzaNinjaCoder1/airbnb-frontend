self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch {}
  const title = data.title || 'New Notification';
  const options = {
    body: data.body || '',
    icon: data.icon || '/icons/notification.png',
    badge: data.badge || '/icons/notification.png',
    data: data.data || {},
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientsArr => {
    const hadWindow = clientsArr.some(windowClient => {
      if (windowClient.url.includes(url)) { windowClient.focus(); return true; }
      return false;
    });
    if (!hadWindow) return clients.openWindow(url);
  }));
});


