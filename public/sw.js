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
  
    if (event.notification.data?.conversation_id) {
      event.waitUntil(
        clients.openWindow(`/messages?conversationId=${event.notification.data.conversation_id}`)
      );
    } else if (event.notification.data?.listing_id) {
      event.waitUntil(
        clients.openWindow(`/products/${event.notification.data.listing_id}`)
      );
    } else {
      event.waitUntil(clients.openWindow("/messages"));
    }
  });
  