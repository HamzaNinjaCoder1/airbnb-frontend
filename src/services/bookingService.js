import axios from 'axios';
import { API_BASE_URL } from '../config.js';

class BookingService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/data`;
  }

  // Fetch booked date ranges for a specific listing
  async getBookedRanges(listingId) {
    try {
      console.log(`Making API call to: ${this.baseURL}/bookings/listing/${listingId}`);
      console.log(`Full URL: http://localhost:5000/api/data/bookings/listing/${listingId}`);
      console.log('Listing ID type:', typeof listingId);
      console.log('Listing ID value:', listingId);
      
      const response = await axios.get(`${this.baseURL}/bookings/listing/${listingId}`, {
        withCredentials: true
      });
      
      console.log('API Response status:', response.status);
      console.log('API Response data:', response.data);
      console.log('API Response headers:', response.headers);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching booked ranges:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      throw error;
    }
  }

  // Convert disabled dates from backend to Date objects for react-date-range
  convertDisabledDatesToDateObjects(disabledDatesArray) {
    if (!disabledDatesArray || !Array.isArray(disabledDatesArray)) {
      console.log('No disabled dates provided or disabledDatesArray is not an array');
      return [];
    }

    console.log('Converting disabled dates from backend:', disabledDatesArray);
    console.log('Number of disabled dates from backend:', disabledDatesArray.length);
    
    const dateObjects = disabledDatesArray.map(dateString => {
      const date = new Date(dateString);
      console.log(`Converting "${dateString}" to Date object:`, date);
      return date;
    });

    console.log('Converted date objects:', dateObjects);
    console.log('Total converted dates:', dateObjects.length);
    
    return dateObjects;
  }

  // Legacy method for backward compatibility (if needed)
  convertRangesToDisabledDates(ranges) {
    if (!ranges || !Array.isArray(ranges)) {
      console.log('No ranges provided or ranges is not an array');
      return [];
    }

    const disabledDates = [];
    
    console.log('Converting booking ranges to disabled dates:', ranges);
    
    ranges.forEach((range, index) => {
      if (range.start && range.end) {
        const startDate = new Date(range.start);
        const endDate = new Date(range.end);
        
        console.log(`Range ${index + 1}: ${range.start} to ${range.end}`);
        
        // Add all dates in the range (inclusive of both start and end)
        const currentDate = new Date(startDate);
        const rangeDates = [];
        
        while (currentDate <= endDate) {
          const dateToAdd = new Date(currentDate);
          disabledDates.push(dateToAdd);
          rangeDates.push(dateToAdd.toISOString().split('T')[0]);
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        console.log(`Disabled dates for range ${index + 1}:`, rangeDates);
      }
    });

    console.log('Total disabled dates:', disabledDates.length);
    console.log('All disabled dates:', disabledDates.map(d => d.toISOString().split('T')[0]));
    
    return disabledDates;
  }

  // Get booking info for a specific date (for hover tooltip)
  getBookingInfoForDate(date, ranges) {
    if (!ranges || !Array.isArray(ranges)) {
      return null;
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    for (const range of ranges) {
      if (range.start && range.end) {
        const startDate = new Date(range.start);
        const endDate = new Date(range.end);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        if (targetDate >= startDate && targetDate <= endDate) {
          return {
            checkIn: range.start,
            checkOut: range.end,
            isCheckIn: targetDate.getTime() === startDate.getTime(),
            isCheckOut: targetDate.getTime() === endDate.getTime()
          };
        }
      }
    }

    return null;
  }
}

export default new BookingService();
