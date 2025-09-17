import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventListeners = new Map();
  }

  connect() {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    this.socket = io('http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinRoom(roomId) {
    if (!this.socket) return;
    // Allow emit even if not yet connected; socket.io will buffer emits
    this.socket.emit('join-room', roomId);
    console.log('Joined room:', roomId);
  }

  leaveRoom(roomId) {
    if (!this.socket) return;
    this.socket.emit('leave-room', roomId);
    console.log('Left room:', roomId);
  }

  onMessage(callback) {
    if (!this.socket) return;
    // Primary channel
    this.socket.on('message', callback);
    // Common alternate event names some backends use
    this.socket.on('new-message', callback);
    this.socket.on('chat-message', callback);
  }

  onTyping(callback) {
    if (this.socket) {
      this.socket.on('typing', callback);
    }
  }

  onStopTyping(callback) {
    if (this.socket) {
      this.socket.on('stop-typing', callback);
    }
  }

  emitTyping(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', { conversationId });
    }
  }

  emitStopTyping(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('stop-typing', { conversationId });
    }
  }

  // Emit a new chat message
  emitMessage(messageData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('message', messageData);
    }
  }

  // Remove event listeners
  removeListener(event, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        // Remove all listeners for the event if no callback is provided
        this.socket.off(event);
      }
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;

