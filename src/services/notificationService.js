import api from '../api';

export const sendBookingNotification = async (guestId, hostId, listingId, bookingId, listingTitle, checkIn, checkOut, guests) => {
  try {
    const response = await api.post('/api/data/notifications/send-booking', {
      guestId,
      hostId,
      listingId,
      bookingId,
      message: `New booking for "${listingTitle}" - Check-in: ${checkIn}, Check-out: ${checkOut}, Guests: ${guests}`,
      title: "New Booking Confirmed!",
      body: `A new booking has been made for your listing "${listingTitle}".`,
      data: {
        type: 'booking_confirmation',
        listing_id: listingId,
        listing_title: listingTitle,
        host_id: hostId,
        booking_id: bookingId,
        check_in: checkIn,
        check_out: checkOut,
        guests: guests
      }
    }, { 
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Booking notification sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to send booking notification:', error);
    return null;
  }
};
