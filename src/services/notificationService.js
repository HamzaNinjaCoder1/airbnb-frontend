import api from '../api';

// Safe thin wrapper aligning with production server endpoints
export const sendBookingNotification = async (hostId, listingId, title, body, data) => {
  try {
    const payload = {
      hostId: hostId,
      listingId: listingId,
      title: title || 'New Booking Confirmed!',
      body: body || 'A new booking was made.',
      data: data || {}
    };

    const response = await api.post('/api/data/notifications/send-booking', payload, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to send booking notification:', error);
    throw error; // Re-throw to allow caller to handle
  }
};

export default { sendBookingNotification };
