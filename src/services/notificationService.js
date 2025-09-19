import api from '../api';

// Validate and normalize payload to match backend schema exactly
function buildServerPayload(input) {
  const hostId = Number(input.hostId);
  const listingId = Number(input.listingId);
  const bookingId = input.bookingId != null ? Number(input.bookingId) : undefined;
  const guestId = input.guestId != null ? Number(input.guestId) : undefined;

  if (!hostId || hostId <= 0) throw new Error('sendBookingNotification: hostId is required and must be a positive number');
  if (!listingId || listingId <= 0) throw new Error('sendBookingNotification: listingId is required and must be a positive number');

  const title = String(input.title || '').trim();
  const body = String(input.body || '').trim();
  if (!title) throw new Error('sendBookingNotification: title is required');
  if (!body) throw new Error('sendBookingNotification: body is required');

  const data = input.data && typeof input.data === 'object' ? input.data : {};

  // Only send allowed fields to avoid backend 400 from strict validators
  const serverPayload = {
    hostId,
    listingId,
    title,
    body,
  };

  if (guestId) serverPayload.guestId = guestId;
  if (bookingId) serverPayload.bookingId = bookingId;
  if (Object.keys(data).length) serverPayload.data = data;

  return serverPayload;
}

// Safe thin wrapper aligning with production server endpoints
export const sendBookingNotification = async (payload) => {
  try {
    const serverPayload = buildServerPayload(payload);
    const response = await api.post(
      '/api/data/notifications/send-booking',
      serverPayload,
      { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to send booking notification:', error?.response?.data || error);
    return null;
  }
};

export default { sendBookingNotification };
