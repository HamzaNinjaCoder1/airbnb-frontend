self.addEventListener("push", function (event) {
    if (!event.data) return;
  
    const data = event.data.json();
  
    event.waitUntil(
      self.registration.showNotification(data.title || "New Message", {
        body: data.body,
        icon: data.icon || "/icons/chat-icon.png",
        data: data.data || {},
      })
    );
  });
  

self.addEventListener("notificationclick", function (event) {
    event.notification.close();
  
    if (event.notification.data?.conversation_id) {
      event.waitUntil(
        clients.openWindow(`/messages?conversationId=${event.notification.data.conversation_id}`)
      );
    } else {
      event.waitUntil(clients.openWindow("/"));
    }
  });
  