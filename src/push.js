import { VAPID_PUBLIC_KEY, API_BASE } from './config';

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  if (window.location.protocol !== 'https:') return null;
  const reg = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;
  return reg;
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export async function enablePush(registration) {
  let permission = Notification.permission;
  if (permission === 'default') permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notification permission not granted');
  
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }
  return subscription;
}

export async function sendSubscriptionToBackend(subscription) {
  const res = await fetch(`${API_BASE}/api/data/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ subscription })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to save subscription');
  }
  return res.json();
}

export async function unsubscribeFromBackend(endpoint) {
  const res = await fetch(`${API_BASE}/api/data/unsubscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ endpoint })
  });
  if (!res.ok) throw new Error('Failed to unsubscribe');
  return res.json();
}

export async function setupNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { success: false, message: 'Push not supported in this browser' };
  }
  if (!VAPID_PUBLIC_KEY) {
    return { success: false, message: 'Missing VAPID public key' };
  }

  try {
    const reg = await registerServiceWorker();
    if (!reg) return { success: false, message: 'SW not available' };
    const sub = await enablePush(reg);
    await sendSubscriptionToBackend(sub);
    return { success: true };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Enable notifications failed:', e);
    return { success: false, message: e.message };
  }
}

export async function disableNotifications() {
  const reg = await navigator.serviceWorker.getRegistration();
  const subscription = await reg?.pushManager.getSubscription();
  if (subscription) {
    const endpoint = subscription.endpoint;
    await subscription.unsubscribe().catch(() => {});
    await fetch(`${API_BASE}/api/data/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ endpoint }),
    }).catch(() => {});
  }
}


