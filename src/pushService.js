import api from "./api";

export async function subscribeUser() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.log("Push notifications not supported");
    return { success: false, error: "Push notifications not supported" };
  }

  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return { success: false, error: "Notification permission denied" };
    }

    // Register service worker
    const reg = await navigator.serviceWorker.register('/service-worker.js');
    await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    const existingSubscription = await reg.pushManager.getSubscription();
    if (existingSubscription) {
      console.log("User already subscribed for push notifications");
      return { success: true, subscription: existingSubscription };
    }

    // Get VAPID public key from backend
    const vapidResp = await api.get('/api/data/vapid-public-key', { withCredentials: true });
    const key = vapidResp?.data?.key;
    if (!key) {
      console.log("No VAPID key available from backend");
      return { success: false, error: "No VAPID key available" };
    }

    // Subscribe to push notifications
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    });

    // Send subscription to backend
    await api.post("/api/data/subscribe", { subscription }, { withCredentials: true });
    
    console.log("User subscribed for push notifications");
    return { success: true, subscription };
  } catch (err) {
    console.error("Failed to subscribe to push notifications:", err);
    return { success: false, error: err.message };
  }
}

export async function initPushAndSocket(authToken, { joinConversationIds = [] } = {}) {
  // This function is kept for compatibility but simplified
  // The main push subscription is handled by subscribeUser()
  try {
    const result = await subscribeUser();
    return result.success ? { reg: null, sub: result.subscription, socket: null } : null;
  } catch (error) {
    console.error('Failed to initialize push and socket:', error);
    return null;
  }
}

export async function checkNotificationPermission() {
  if (!("Notification" in window)) {
    return { supported: false, granted: false };
  }

  const permission = Notification.permission;
  return {
    supported: true,
    granted: permission === "granted",
    permission
  };
}

export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    return { success: false, error: "Notifications not supported" };
  }

  try {
    const permission = await Notification.requestPermission();
    return {
      success: permission === "granted",
      permission,
      granted: permission === "granted"
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function unsubscribeUser() {
  if (!("serviceWorker" in navigator)) return;

  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();

    if (sub) {
      await sub.unsubscribe();
      await api.post("/api/data/unsubscribe", { endpoint: sub.endpoint }, { withCredentials: true });
      console.log("User unsubscribed");
    } else {
      console.log("No active subscription found");
    }
  } catch (err) {
    console.error("Failed to unsubscribe:", err);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
