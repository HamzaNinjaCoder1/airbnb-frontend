import api from '../api.js';
import { API_BASE_URL } from '../config.js';

class MessagingService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/data`;
  }

  // Get all conversations for a user
  async getConversations(userId) {
    try {
      const response = await api.get(`${this.baseURL}/conversations/${userId}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  // Get messages for a specific conversation
  async getMessages(conversationId) {
    try {
      const response = await api.get(`${this.baseURL}/messages/get-messages?conversation_id=${conversationId}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Send a message
  async sendMessage(messageData) {
    try {
      // Ensure all required fields are present and properly typed
      const payload = {
        message: String(messageData.message || ''),
        conversation_id: Number(messageData.conversation_id),
        receiver_id: Number(messageData.receiver_id),
        ...(messageData.client_temp_id && { client_temp_id: messageData.client_temp_id })
      };

      // Validate required fields
      if (!payload.message || !payload.conversation_id || !payload.receiver_id) {
        throw new Error('Missing required fields: message, conversation_id, and receiver_id are required');
      }

      // Avoid verbose logs in production
      if (typeof import.meta !== 'undefined' && import.meta.env && !import.meta.env.PROD) {
        console.log('Sending message with payload:', payload);
        console.log('API endpoint:', `${this.baseURL}/messages/send-message`);
      }

      const response = await api.post(`${this.baseURL}/messages/send-message`, payload, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (typeof import.meta !== 'undefined' && import.meta.env && !import.meta.env.PROD) {
        console.log('Message sent successfully:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      throw error;
    }
  }

  // Subscribe to push notifications
  async subscribeToPush(subscription) {
    try {
      const response = await api.post(`${this.baseURL}/subscribe`, { subscription }, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush(endpoint) {
    try {
      const response = await api.post(`${this.baseURL}/unsubscribe`, { endpoint }, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw error;
    }
  }

  // Get user's push subscription status
  async getPushSubscriptions(userId) {
    try {
      const response = await api.get(`${this.baseURL}/push-subscriptions/${userId}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching push subscriptions:', error);
      throw error;
    }
  }

  // Test notification endpoint
  async sendTestNotification(listingId, message) {
    try {
      const response = await api.post(`${this.baseURL}/test-notification`, { 
        listingId, 
        message 
      }, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const messagingService = new MessagingService();

export default messagingService;
