import { setupNotifications, disableNotifications } from '../push';

export async function enablePushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push not supported in this browser');
  }

  const result = await setupNotifications();
  if (!result.success) {
    throw new Error(result.message || 'Failed to enable notifications');
  }
  return true;
}
export async function disablePushNotifications() {
  await disableNotifications();
}

export function getNotificationStatus() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { supported: false, permission: 'unsupported' };
  }

  return {
    supported: true,
    permission: Notification.permission
  };
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    throw new Error('Notifications not supported');
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}
