import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/data';

/**
 * Check if a host ID exists in the listings
 * @param {string|number} hostId - The host ID to check
 * @returns {Promise<{exists: boolean, listing?: object}>}
 */
export const checkHostListing = async (hostId) => {
  try {
    console.log(`Checking if host ID ${hostId} exists in listings...`);
    
    const response = await axios.post(`${API_BASE_URL}/host/listing`, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token is stored in localStorage
      }
    });

    console.log('Host listing check response:', response.data);

    if (response.data.success) {
      if (response.data.message === "Listing exists") {
        console.log(`Host ID ${hostId} has existing listing:`, response.data.data);
        return { exists: true, listing: response.data.data };
      } else if (response.data.message === "New draft listing created") {
        console.log(`Host ID ${hostId} had no listing, created new draft:`, response.data.data);
        return { exists: false, listing: response.data.data };
      }
    }

    return { exists: false };
  } catch (error) {
    console.error('Error checking host listing:', error);
    
    // If it's an authentication error, the user might not be logged in
    if (error.response?.status === 401) {
      console.log('User not authenticated, cannot check host listing');
      return { exists: false, error: 'not_authenticated' };
    }
    
    return { exists: false, error: error.message };
  }
};

/**
 * Get host listing images to check if host has any listings
 * @param {string|number} hostId - The host ID to check
 * @returns {Promise<{hasListings: boolean, listings?: array}>}
 */
export const getHostListings = async (hostId) => {
  try {
    console.log(`Getting listings for host ID ${hostId}...`);
    
    const response = await axios.get(`${API_BASE_URL}/listings/HostListingImages?hostId=${hostId}`);

    console.log('Host listings response:', response.data);

    if (response.data.success && response.data.data && response.data.data.length > 0) {
      console.log(`Host ID ${hostId} has ${response.data.data.length} listing(s):`, response.data.data);
      return { hasListings: true, listings: response.data.data };
    }

    console.log(`Host ID ${hostId} has no listings`);
    return { hasListings: false, listings: [] };
  } catch (error) {
    console.error('Error getting host listings:', error);
    return { hasListings: false, error: error.message };
  }
};
