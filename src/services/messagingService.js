import axios from 'axios';
import { API_BASE_URL } from '../config.js';

class MessagingService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/data`;
  }

  // Get all conversations for a user
  async getConversations(userId) {
    try {
      const response = await axios.get(`${this.baseURL}/conversations/${userId}`, {
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
      const response = await axios.get(`${this.baseURL}/messages/get-messages?conversation_id=${conversationId}`, {
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
      const response = await axios.post(`${this.baseURL}/messages/send-message`, messageData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Subscribe to push notifications
  async subscribeToPush(subscription) {
    try {
      const response = await axios.post(`${this.baseURL}/subscribe`, { subscription }, {
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
      const response = await axios.post(`${this.baseURL}/unsubscribe`, { endpoint }, {
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
      const response = await axios.get(`${this.baseURL}/push-subscriptions/${userId}`, {
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
      const response = await axios.post(`${this.baseURL}/test-notification`, { 
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
