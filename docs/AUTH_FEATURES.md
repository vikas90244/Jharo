# Authentication Features

This document describes the authentication features implemented in Jharo.

## Features Overview

### 1. **Token Refresh Mechanism**
- Access tokens expire after 5 minutes
- Refresh tokens are valid for 7 days
- Automatic token refresh every 4 minutes when user is authenticated
- Seamless background refresh without user interaction

### 2. **State Persisting**
- Authentication state persists across page reloads
- User data is cached with React Query (5-minute stale time)
- Cookies are used for storing JWT tokens (httpOnly, secure in production)

### 3. **Initial UI Loading**
- Loading spinner shown while checking authentication status
- Prevents flash of unauthenticated content
- Smooth transitions between loading and content states

### 4. **Protected Routes**
- `/library` route requires authentication
- Unauthenticated users are redirected to `/login`
- Loading state shown during authentication check

### 5. **Guest Routes**
- `/login` and `/register` redirect authenticated users to `/library`
- Prevents logged-in users from accessing auth pages
- Loading state shown during authentication check

### 6. **Public Landing Page**
- `/` is a public page accessible to everyone
- Clean, minimal design following existing design patterns
- Call-to-action buttons for sign up and log in

## Architecture

### Frontend Components

1. **AuthProvider** (`components/auth/auth-provider.tsx`)
   - Wraps the entire app in `layout.tsx`
   - Fetches current user on mount
   - Manages automatic token refresh
   - Provides auth context to all components

2. **ProtectedRoute** (`components/auth/protected-route.tsx`)
   - Wraps protected pages (like `/library`)
   - Shows loading spinner while checking auth
   - Redirects to `/login` if not authenticated

3. **GuestRoute** (`components/auth/guest-route.tsx`)
   - Wraps auth pages (like `/login` and `/register`)
   - Shows loading spinner while checking auth
   - Redirects to `/library` if already authenticated

### Backend Endpoints

- `POST /auth/login/` - Login with email and password
- `POST /auth/register/` - Register new user
- `GET /auth/verify/:uid/:token/` - Verify email
- `POST /auth/refresh/` - Refresh access token
- `POST /auth/logout/` - Logout and clear cookies
- `GET /auth/me/` - Get current user (requires authentication)

### Token Flow

```
1. User logs in
   ↓
2. Backend sets access & refresh tokens in httpOnly cookies
   ↓
3. Frontend fetches user data with access token
   ↓
4. Every 4 minutes, frontend calls /auth/refresh/
   ↓
5. Backend validates refresh token and issues new access token
   ↓
6. Frontend continues to work with fresh access token
```

## Design Consistency

All new pages follow the existing design pattern:

- Color scheme from `styles/abstracts/_variables.scss`
- Typography using `font-reading` (Literata) for headings
- Minimal, paper-inspired aesthetic
- Consistent spacing and border-radius
- Smooth transitions and hover states

## Usage

### Protecting a New Page

```tsx
"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";

export default function YourPage() {
  return (
    <ProtectedRoute>
      <YourContent />
    </ProtectedRoute>
  );
}
```

### Using Auth State in Components

```tsx
"use client";

import { useAuth } from "@/components/auth/auth-provider";

export function YourComponent() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.email}</p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

### Logging Out

```tsx
import { useLogout } from "@/hooks/use-auth";

export function LogoutButton() {
  const logoutMutation = useLogout();

  return (
    <button
      onClick={() => logoutMutation.mutate()}
      disabled={logoutMutation.isPending}
    >
      {logoutMutation.isPending ? "Logging out..." : "Log out"}
    </button>
  );
}
```

## Security Considerations

- Access tokens are short-lived (5 minutes)
- Refresh tokens are longer-lived (7 days)
- All tokens stored in httpOnly cookies (not accessible via JavaScript)
- CSRF protection enabled in Django
- CORS configured to only allow requests from frontend domain
- Cookies use `SameSite=Lax` to prevent CSRF attacks
- In production, set `secure=True` for cookies (requires HTTPS)

## Environment Variables

Make sure these are set in your `.env` files:

**Backend** (`backend/.env`):
```
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```
