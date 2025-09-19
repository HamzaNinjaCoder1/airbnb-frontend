import api from '../api';

// Safe thin wrapper aligning with production server endpoints
export const sendBookingNotification = async (payload) => {
  try {
    const response = await api.post('/api/data/notifications/send-booking', payload, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to send booking notification:', error);
    return null;
  }
};

export default { sendBookingNotification };
