import axios from "axios";

const VAPID_PUBLIC_KEY =
  "BP0OJzfIv3gutn2bu2VbP3Y062ZYRhtLNiYxxDe_OM1aueh7bJKcx5S72UzsRs40kFsukwOxfV13oTUJo-3vOFU";

export async function subscribeUser() {
  if (!("serviceWorker" in navigator)) {
    console.error("Service workers not supported");
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.error("Notification permission denied");
    return;
  }

  const reg = await navigator.serviceWorker.ready;

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  try {
    await axios.post(
      "http://localhost:5000/api/data/subscribe",
      { subscription },
      { withCredentials: true }
    );
    console.log("User subscribed for push notifications:", subscription);
    return { success: true, subscription };
  } catch (err) {
    console.error("Failed to send subscription:", err);
    return { success: false, error: err.message };
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

  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();

  if (sub) {
    await sub.unsubscribe();

    try {
      await axios.post(
        "http://localhost:5000/api/data/unsubscribe",
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
