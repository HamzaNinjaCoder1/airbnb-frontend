# Backend Notification System Setup Instructions

## Overview
This document provides complete instructions for implementing the notification system on your backend at `https://dynamic-tranquility-production.up.railway.app` to work with the frontend at `https://airbnb-frontend-sooty.vercel.app`.

## VAPID Keys Configuration

### VAPID Public Key (Frontend)
```
BP0OJzfIv3gutn2bu2VbP3Y062ZYRhtLNiYxxDe_OM1aueh7bJKcx5S72UzsRs40kFsukwOxfV13oTUJo-3vOFU
```

### VAPID Private Key (Backend - Keep Secret)
You need to generate the corresponding private key. Use this command:
```bash
npx web-push generate-vapid-keys
```

## Required Backend Endpoints

### 1. VAPID Public Key Endpoint
**GET** `/api/data/vapid-public-key`

**Response:**
```json
{
  "success": true,
  "key": "BP0OJzfIv3gutn2bu2VbP3Y062ZYRhtLNiYxxDe_OM1aueh7bJKcx5S72UzsRs40kFsukwOxfV13oTUJo-3vOFU"
}
```

### 2. Subscribe to Push Notifications
**POST** `/api/data/subscribe`

**Request Body:**
```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "BEl62iUYgUivxIkv69yViEuiBIa40HI...",
      "auth": "tBHItJI5svbpez7KI4CCXg=="
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription saved successfully"
}
```

### 3. Unsubscribe from Push Notifications
**POST** `/api/data/unsubscribe`

**Request Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Unsubscribed successfully"
}
```

### 4. Send Booking Notification to Host
**POST** `/api/data/notifications/send-booking`

**Request Body:**
```json
{
  "guestId": 123,
  "hostId": 456,
  "listingId": 789,
  "bookingId": 789,
  "message": "New booking for \"Beautiful Apartment\" - Check-in: 2024-01-15, Check-out: 2024-01-18, Guests: 2",
  "title": "New Booking Confirmed!",
  "body": "A new booking has been made for your listing \"Beautiful Apartment\".",
  "data": {
    "type": "booking_confirmation",
    "listing_id": 789,
    "listing_title": "Beautiful Apartment",
    "host_id": 456,
    "booking_id": 789,
    "check_in": "2024-01-15",
    "check_out": "2024-01-18",
    "guests": 2
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent successfully"
}
```

## Backend Implementation Requirements

### 1. Install Required Dependencies
```bash
npm install web-push cors express
```

### 2. Database Schema for Push Subscriptions
```sql
CREATE TABLE push_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(endpoint)
);

CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
```

### 3. Backend Code Implementation

#### Environment Variables
```env
VAPID_PUBLIC_KEY=BP0OJzfIv3gutn2bu2VbP3Y062ZYRhtLNiYxxDe_OM1aueh7bJKcx5S72UzsRs40kFsukwOxfV13oTUJo-3vOFU
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_EMAIL=mailto:your-email@example.com
```

#### Push Notification Service
```javascript
const webpush = require('web-push');

// Configure VAPID details
webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Function to send push notification
async function sendPushNotification(subscription, payload) {
  try {
    const result = await webpush.sendNotification(subscription, JSON.stringify(payload));
    console.log('Push notification sent:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: error.message };
  }
}

// Function to get user's push subscriptions
async function getUserPushSubscriptions(userId) {
  // Query database for user's subscriptions
  const subscriptions = await db.query(
    'SELECT endpoint, p256dh_key, auth_key FROM push_subscriptions WHERE user_id = $1',
    [userId]
  );
  
  return subscriptions.rows.map(sub => ({
    endpoint: sub.endpoint,
    keys: {
      p256dh: sub.p256dh_key,
      auth: sub.auth_key
    }
  }));
}
```

#### API Endpoints Implementation

```javascript
// GET /api/data/vapid-public-key
app.get('/api/data/vapid-public-key', (req, res) => {
  res.json({
    success: true,
    key: process.env.VAPID_PUBLIC_KEY
  });
});

// POST /api/data/subscribe
app.post('/api/data/subscribe', async (req, res) => {
  try {
    const { subscription } = req.body;
    const userId = req.user.id; // Assuming user is authenticated
    
    // Save subscription to database
    await db.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh_key, auth_key) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (endpoint) 
       DO UPDATE SET user_id = $1, p256dh_key = $3, auth_key = $4, updated_at = CURRENT_TIMESTAMP`,
      [userId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth]
    );
    
    res.json({ success: true, message: 'Subscription saved successfully' });
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ success: false, error: 'Failed to save subscription' });
  }
});

// POST /api/data/unsubscribe
app.post('/api/data/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;
    
    await db.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);
    
    res.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ success: false, error: 'Failed to unsubscribe' });
  }
});

// POST /api/data/notifications/send-booking
app.post('/api/data/notifications/send-booking', async (req, res) => {
  try {
    const { hostId, title, body, data, message } = req.body;
    
    // Get host's push subscriptions
    const subscriptions = await getUserPushSubscriptions(hostId);
    
    if (subscriptions.length === 0) {
      return res.json({ 
        success: false, 
        message: 'Host has no push subscriptions' 
      });
    }
    
    // Prepare notification payload
    const payload = {
      title,
      body,
      icon: '/icons/notification.png',
      badge: '/icons/notification.png',
      data: {
        ...data,
        url: `https://airbnb-frontend-sooty.vercel.app/messages`
      }
    };
    
    // Send notification to all of host's devices
    const results = await Promise.allSettled(
      subscriptions.map(subscription => sendPushNotification(subscription, payload))
    );
    
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    
    res.json({
      success: true,
      message: `Notification sent to ${successCount}/${subscriptions.length} devices`
    });
    
  } catch (error) {
    console.error('Error sending booking notification:', error);
    res.status(500).json({ success: false, error: 'Failed to send notification' });
  }
});
```

## CORS Configuration

Make sure your backend allows requests from your frontend:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://airbnb-frontend-sooty.vercel.app',
    'http://localhost:3000' // For development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
```

## Testing the Implementation

### 1. Test VAPID Key Endpoint
```bash
curl https://dynamic-tranquility-production.up.railway.app/api/data/vapid-public-key
```

### 2. Test Subscription Endpoint
```bash
curl -X POST https://dynamic-tranquility-production.up.railway.app/api/data/subscribe \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "subscription": {
      "endpoint": "https://fcm.googleapis.com/fcm/send/test",
      "keys": {
        "p256dh": "test",
        "auth": "test"
      }
    }
  }'
```

### 3. Test Booking Notification
```bash
curl -X POST https://dynamic-tranquility-production.up.railway.app/api/data/notifications/send-booking \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "hostId": 1,
    "title": "Test Notification",
    "body": "This is a test notification",
    "data": {"type": "test"}
  }'
```

## Frontend Integration Points

The frontend will:
1. Call `/api/data/vapid-public-key` to get the VAPID key
2. Subscribe to push notifications using the VAPID key
3. Send subscription to `/api/data/subscribe`
4. Send booking notifications via `/api/data/notifications/send-booking`

## Security Considerations

1. **Authentication**: Ensure all endpoints require valid user authentication
2. **Rate Limiting**: Implement rate limiting for notification endpoints
3. **Input Validation**: Validate all incoming data
4. **Error Handling**: Don't expose sensitive information in error messages
5. **HTTPS Only**: Ensure all communication is over HTTPS

## Monitoring and Logging

1. Log all notification attempts (success/failure)
2. Monitor subscription counts per user
3. Track notification delivery rates
4. Set up alerts for high failure rates

This implementation will provide a complete push notification system for your Airbnb clone application.
