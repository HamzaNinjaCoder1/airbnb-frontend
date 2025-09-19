/**
 * Utility functions for testing push notifications
 * Only available in development mode
 */

import { sendBookingNotification } from '../services/notificationService';

/**
 * Test booking notification with sample data
 * Only works in development mode
 */
export async function testBookingNotification() {
  if (import.meta.env.PROD) {
    console.warn('Notification testing is only available in development mode');
    return;
  }

  try {
    console.log('Testing booking notification...');
    
    const result = await sendBookingNotification(
      1, // hostId
      1, // listingId
      'Test Booking Notification',
      'This is a test notification for development',
      {
        check_in: '2025-01-01',
        check_out: '2025-01-05',
        guests: 2,
        url: `${window.location.origin}/messages`,
        kind: 'booking'
      }
    );
    
    console.log('Booking notification test result:', result);
    return result;
  } catch (error) {
    console.error('Booking notification test failed:', error);
    throw error;
  }
}

/**
 * Test service worker registration and push subscription
 * Only works in development mode
 */
export async function testPushSubscription() {
  if (import.meta.env.PROD) {
    console.warn('Push subscription testing is only available in development mode');
    return;
  }

  try {
    console.log('Testing push subscription...');
    
    // Check if service worker is registered
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      throw new Error('Service worker not registered');
    }
    
    // Check if push subscription exists
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      throw new Error('No push subscription found');
    }
    
    console.log('Push subscription test passed:', {
      endpoint: subscription.endpoint,
      keys: subscription.getKey ? {
        p256dh: subscription.getKey('p256dh') ? 'present' : 'missing',
        auth: subscription.getKey('auth') ? 'present' : 'missing'
      } : 'not available'
    });
    
    return subscription;
  } catch (error) {
    console.error('Push subscription test failed:', error);
    throw error;
  }
}

// Make test functions available globally in development
if (!import.meta.env.PROD) {
  window.testBookingNotification = testBookingNotification;
  window.testPushSubscription = testPushSubscription;
  console.log('Notification test functions available: testBookingNotification(), testPushSubscription()');
}
