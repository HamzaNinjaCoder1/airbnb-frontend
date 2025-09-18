self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
const FRONTEND_ORIGIN = 'https://airbnb-frontend-sooty.vercel.app';

self.addEventListener("push", function (event) {
    if (!event.data) return;
  
    const data = event.data.json();
  
    event.waitUntil(
      self.registration.showNotification(data.title || "New Message", {
        body: data.body,
        icon: data.icon || "/icons/chat-icon.png",
        image: data.image || data.listingImage,
        badge: data.badge || "/icons/badge-icon.png",
        tag: data.tag || "booking-notification",
        requireInteraction: data.requireInteraction || false,
        actions: data.actions || [
          {
            action: "view",
            title: "View Details",
            icon: "/icons/view-icon.png"
          },
          {
            action: "dismiss",
            title: "Dismiss",
            icon: "/icons/dismiss-icon.png"
          }
        ],
        data: data.data || {},
      })
    );
  });
  

self.addEventListener("notificationclick", function (event) {
    event.notification.close();
  
    if (event.action === "dismiss") {
      return;
    }
  
    // Always use production frontend origin
    const origin = FRONTEND_ORIGIN;
    const nData = event.notification.data || {};
    
    if (nData.conversation_id) {
      event.waitUntil(
        clients.openWindow(`${origin}/messages?conversationId=${nData.conversation_id}`)
      );
    } else if (nData.listing_id) {
      event.waitUntil(
        clients.openWindow(`${origin}/products/${nData.listing_id}`)
      );
    } else if (nData.type === 'booking_confirmation') {
      // For booking notifications, always redirect to messages page
      event.waitUntil(
        clients.openWindow(`${origin}/messages`)
      );
    } else {
      // Default redirect to messages page
      event.waitUntil(
        clients.openWindow(`${origin}/messages`)
      );
    }
  });
  