# Authentication Flow Implementation

## Overview
This document describes the authentication flow implemented in the Airbnb frontend application.

## Components

### 1. AuthContext (src/AuthContext.jsx)
- **Purpose**: Central authentication state management
- **Features**:
  - User authentication status
  - Login/logout functionality
  - User data management
  - Automatic authentication check on app load

### 2. Header (src/Header.jsx)
- **Purpose**: Main navigation header with authentication-aware UI
- **Features**:
  - Shows "Log in" button for unauthenticated users
  - Shows "Become a host" button for authenticated users
  - Integrates with HostDialog for hosting functionality

### 3. HostDialog (src/HostDialog.jsx)
- **Purpose**: Dialog for selecting hosting type
- **Features**:
  - Only accessible to authenticated users
  - Shows hosting options (Home, Experience, Service)
  - Clean, focused interface

### 4. AuthPage (src/AuthPage.jsx)
- **Purpose**: Login and signup interface
- **Features**:
  - Email-based authentication
  - User registration flow
  - Integration with AuthContext

### 5. HostPage (src/HostPage.jsx)
- **Purpose**: Login page wrapper
- **Features**:
  - Redirects authenticated users to main page
  - Shows AuthPage for unauthenticated users

## Authentication Flow

### 1. Unauthenticated User Flow
1. User sees "Log in" button in header
2. Clicking "Log in" navigates to `/login` route
3. HostPage renders AuthPage component
4. User can login or signup
5. On successful authentication, user is redirected to main page

### 2. Authenticated User Flow
1. User sees "Become a host" button in header
2. Clicking "Become a host" opens HostDialog
3. User selects hosting type
4. Dialog closes and user can proceed with hosting setup

### 3. Authentication State Management
- AuthContext maintains global authentication state
- All components use `useAuth()` hook to access auth state
- Authentication status is checked on app initialization
- User data is stored in context and accessible throughout the app

## Key Features

### Security
- Authentication status checked on every protected action
- Automatic redirect for unauthenticated users
- Secure cookie-based authentication with backend

### User Experience
- Seamless navigation between authenticated and unauthenticated states
- Clear visual indicators of authentication status
- Smooth transitions and proper loading states

### Code Organization
- Centralized authentication logic in AuthContext
- Reusable authentication hooks
- Clean separation of concerns between components

## API Integration

The authentication system integrates with the backend API at `http://localhost:5000`:

- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration
- `GET /api/users/me` - Get current user info
- `POST /api/users/logout` - User logout

## Usage Examples

### Using Authentication in Components
```jsx
import { useAuth } from './AuthContext';

function MyComponent() {
  const { isAuthenticated, user, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome, {user.first_name}!</div>;
}
```

### Protected Routes
```jsx
function ProtectedComponent() {
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Component content
}
```

## Future Enhancements

1. **Token Refresh**: Implement automatic token refresh
2. **Remember Me**: Add persistent login functionality
3. **Social Login**: Integrate with Google, Facebook, etc.
4. **Two-Factor Authentication**: Add 2FA support
5. **Password Reset**: Implement password reset flow


