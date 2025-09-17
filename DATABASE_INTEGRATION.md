# Database Integration Guide

## Overview
The `reserve.jsx` component has been updated to fetch data from your backend database instead of using static data.

## Backend Requirements
Your backend should have the following endpoint running:
- **URL**: `http://localhost:5000/api/data/listing`
- **Method**: GET
- **Response**: Array of listing objects

## Expected Data Structure
The backend should return an array of objects with this structure:
```json
[
  {
    "id": 1,
    "title": "Apartment Name",
    "price_per_night": 150,
    "city": "Islamabad",
    "rating": 4.5,
    "reviews_count": 128,
    "image_url": "https://example.com/image.jpg",
    "host_name": "Host Name",
    "host_image": "https://example.com/host.jpg"
  }
]
```

## Testing the Integration

### 1. Start Your Backend Server
Make sure your backend is running on port 5000:
```bash
cd your-backend-directory
npm start
# or
node app.js
```

### 2. Test the API Endpoint
Test if your endpoint is working:
```bash
curl http://localhost:5000/api/data/listing
```

### 3. Check Browser Console
Open your React app and check the browser console for:
- "Backend response: [...]" - shows the raw data from your API
- "Using listing: {...}" - shows which listing is being used

### 4. Verify Data Display
The component will show:
- ✅ Green success indicator when data loads from database
- 🔄 Loading spinner while fetching data
- ⚠️ Error message if backend is unreachable
- 📊 Fallback data if no listings found

## Fallback Behavior
If the backend is unavailable or returns no data, the component will:
1. Show fallback data (Apartment in Islamabad)
2. Display an error message
3. Provide retry and refresh buttons

## Troubleshooting

### Common Issues:
1. **CORS Error**: Ensure your backend has CORS enabled
2. **Port Mismatch**: Verify backend runs on port 5000
3. **Database Connection**: Check if your database is connected
4. **Route Not Found**: Ensure `/api/data/listing` route exists

### Debug Steps:
1. Check browser console for error messages
2. Verify backend server is running
3. Test API endpoint directly with curl/Postman
4. Check backend logs for errors

## Adding More Listings
To add more listings, use your existing POST endpoint:
```bash
curl -X POST http://localhost:5000/api/data/listing \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Apartment",
    "price_per_night": 200,
    "city": "Rawalpindi"
  }'
```

## Notes
- The component automatically fetches data when it mounts
- Data is refreshed on page reload
- Fallback data ensures the UI always works
- Error handling provides user-friendly feedback

