# Application Routes

## Public Routes
These routes are accessible to everyone (authenticated or not).

### `/` - Landing Page
- **Status**: Public
- **Description**: Main landing page with app introduction
- **Features**:
  - Hero section with app description
  - Sign up CTA button
  - Log in link
  - Minimal, paper-inspired design
- **Authenticated behavior**: Still accessible (doesn't redirect)

## Guest Routes
These routes are only for unauthenticated users. Authenticated users are redirected to `/library`.

### `/login` - Login Page
- **Status**: Guest only
- **Description**: User login page
- **Features**:
  - Email and password form
  - Validation with Zod
  - Error handling
  - Link to register page
- **On success**: Redirects to `/library`
- **If authenticated**: Redirects to `/library`

### `/register` - Registration Page
- **Status**: Guest only
- **Description**: User registration page
- **Features**:
  - Email, password, and confirm password form
  - Validation with Zod
  - Email verification flow
  - Link to login page
- **On success**: Sends verification email, redirects to login
- **If authenticated**: Redirects to `/library`

### `/verify/[uidb64]/[token]` - Email Verification
- **Status**: Public
- **Description**: Email verification page
- **Features**:
  - Automatic verification on page load
  - Success/error messages
  - Redirect to login on success

## Protected Routes
These routes require authentication. Unauthenticated users are redirected to `/login`.

### `/library` - User Library
- **Status**: Protected
- **Description**: User's reading library (main app page)
- **Features**:
  - Displays user email in header
  - Logout button
  - Empty state (ready for book list)
  - Header with app logo
- **If not authenticated**: Redirects to `/login`
- **If authenticated**: Shows library content

## API Routes (Backend)

### Authentication Endpoints

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/auth/register/` | POST | No | Register new user |
| `/auth/login/` | POST | No | Login with email/password |
| `/auth/verify/:uid/:token/` | GET | No | Verify email address |
| `/auth/refresh/` | POST | No (uses refresh cookie) | Refresh access token |
| `/auth/logout/` | POST | No | Clear auth cookies |
| `/auth/me/` | GET | Yes | Get current user info |

## Route Protection Summary

```
┌─────────────────────────────────────────────────────────┐
│                    Application Routes                    │
└─────────────────────────────────────────────────────────┘

PUBLIC (No redirect)
  / ........................... Landing Page

GUEST ONLY (Auth users → /library)
  /login ...................... Login Page
  /register ................... Registration Page
  /verify/[uid]/[token] ....... Email Verification

PROTECTED (Unauth users → /login)
  /library .................... User Library (Main App)

```

## Navigation Flow

```
┌──────────────┐
│   Landing    │ (Public)
│      /       │
└──────┬───────┘
       │
       ├─→ Sign up ──→ /register ──→ Email sent ──→ /login
       │
       └─→ Log in ───→ /login ─────→ Success ──────→ /library
                                                         │
                                                         │
                                      ┌──────────────────┘
                                      │
                                      ▼
                               ┌──────────────┐
                               │   Library    │ (Protected)
                               │   /library   │
                               └──────┬───────┘
                                      │
                                      └─→ Logout ──→ /

```

## Component Architecture

```
app/
├── layout.tsx
│   └── AuthProvider (Wraps entire app)
│       ├── Fetches current user
│       ├── Auto-refreshes tokens
│       └── Provides auth context
│
├── page.tsx (Landing - Public)
│
├── (auth)/
│   ├── login/page.tsx
│   │   └── GuestRoute
│   │       └── LoginForm
│   │
│   ├── register/page.tsx
│   │   └── GuestRoute
│   │       └── RegisterForm
│   │
│   └── verify/[uidb64]/[token]/page.tsx
│       └── VerifyEmail
│
└── library/page.tsx
    └── ProtectedRoute
        └── LibraryContent
```

## Auth Flow States

### Initial Load
```
1. App loads
2. AuthProvider fetches current user
3. Shows loading spinner (in Protected/Guest routes)
4. Once user data loads:
   - If authenticated → Show content or redirect to /library
   - If not authenticated → Show content or redirect to /login
```

### Login Flow
```
1. User visits /login
2. GuestRoute checks if already authenticated
3. If authenticated → Redirect to /library
4. If not → Show login form
5. User submits credentials
6. On success → Redirect to /library
7. AuthProvider fetches user data
8. User is now authenticated
```

### Auto Token Refresh
```
1. User is authenticated
2. Every 4 minutes:
   - AuthProvider calls /auth/refresh/
   - Backend validates refresh cookie
   - Backend sets new access token cookie
   - User continues seamlessly
```

### Logout Flow
```
1. User clicks "Log out" in /library
2. useLogout hook calls /auth/logout/
3. Backend clears cookies
4. Frontend clears user data
5. Redirect to /
```
