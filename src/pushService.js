import api from "./api";
import { SOCKET_URL, BACKEND_URL } from './config';
import { io } from 'socket.io-client';

const VAPID_PUBLIC_KEY = null; // fetch from backend dynamically

function isProductionOrigin() {
  try {
    if (typeof window === 'undefined') return false;
    const origin = window.location.origin || '';
    const isHttps = window.location.protocol === 'https:';
    const isLocalhost = /^(http:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
    return isHttps && !isLocalhost;
  } catch (_) {
    return false;
  }
}

export async function subscribeUser() {
  if (!("serviceWorker" in navigator)) {
    console.error("Service workers not supported");
    return { success: false, error: "Service workers not supported" };
  }
  // Allow registration on any origin but only subscribe if production

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.error("Notification permission denied");
      return { success: false, error: "Notification permission denied" };
    }

    // Ensure service worker is registered (path served from public/)
    const reg = await navigator.serviceWorker.register('/service-worker.js');
    await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    const existingSubscription = await reg.pushManager.getSubscription();
    if (existingSubscription) {
      console.log("User already subscribed for push notifications");
      return { success: true, subscription: existingSubscription };
    }

    // Fetch VAPID public key from backend
    const vapidResp = await api.get('/api/data/vapid-public-key', { withCredentials: true });
    const key = vapidResp?.data?.key;
    if (!key) throw new Error('No VAPID key from backend');

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    });

    // Send subscription to your production backend
    const response = await api.post(
      "/api/data/subscribe",
      { 
        subscription
      },
      { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log("User subscribed for push notifications:", subscription);
    console.log("Backend response:", response.data);
    return { success: true, subscription };
  } catch (err) {
    console.error("Failed to subscribe to push notifications:", err);
    console.error("Error details:", {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data
    });
    return { success: false, error: err.message };
  }
}

export async function initPushAndSocket(authToken, { joinConversationIds = [] } = {}) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;

  // 1) Register service worker (already ensured in subscribeUser, but safe to call)
  const reg = await navigator.serviceWorker.register('/service-worker.js');

  // 2) Get VAPID public key
  const { data } = await api.get('/api/data/vapid-public-key', { withCredentials: true });
  const key = data?.key;
  if (!key) throw new Error('No VAPID key');

  // 3) Subscribe
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(key),
  });

  // 4) Save subscription
  await api.post('/api/data/subscribe', { subscription: sub }, { withCredentials: true });

  // 5) Socket.io
  const socket = io(SOCKET_URL || BACKEND_URL, { withCredentials: true, transports: ['websocket', 'polling'] });
  joinConversationIds.forEach(id => socket.emit('join-room', String(id)));
  socket.on('message', payload => {
    console.log('socket message', payload);
  });

  return { reg, sub, socket };
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

  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();

  if (sub) {
    await sub.unsubscribe();

    try {
      await api.post(
        "/api/data/unsubscribe",
        { endpoint: sub.endpoint },
        { withCredentials: true }
      );
      console.log("User unsubscribed");
    } catch (err) {
      console.error("Failed to unsubscribe:", err);
    }
  } else {
    console.log("No active subscription found");
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
