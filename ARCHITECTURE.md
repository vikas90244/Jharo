# Architecture Diagram 🏗️

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Jharo Reading Workspace                  │
│                    Full-Stack Authentication System              │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│       FRONTEND           │         │        BACKEND           │
│    Next.js 15 + React    │ ◄─────► │    Django + DRF          │
│      localhost:3000      │  HTTP   │    localhost:8000        │
└──────────────────────────┘         └──────────────────────────┘
```

---

## Frontend Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        App Layout                               │
│                      (layout.tsx)                               │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃                   QueryProvider                          ┃  │
│  ┃              (React Query - Server State)                ┃  │
│  ┃  ┌────────────────────────────────────────────────────┐  ┃  │
│  ┃  │              AuthProvider                          │  ┃  │
│  ┃  │   ┌────────────────────────────────────────┐      │  ┃  │
│  ┃  │   │  • Fetches current user                │      │  ┃  │
│  ┃  │   │  • Auto-refreshes tokens (4 min)       │      │  ┃  │
│  ┃  │   │  • Provides auth context               │      │  ┃  │
│  ┃  │   │  • Manages loading states              │      │  ┃  │
│  ┃  │   └────────────────────────────────────────┘      │  ┃  │
│  ┃  │                                                    │  ┃  │
│  ┃  │   ┌────────────────────────────────────────┐      │  ┃  │
│  ┃  │   │           Pages & Routes               │      │  ┃  │
│  ┃  │   │                                        │      │  ┃  │
│  ┃  │   │  PUBLIC                                │      │  ┃  │
│  ┃  │   │  └─ /                                  │      │  ┃  │
│  ┃  │   │     Landing page                       │      │  ┃  │
│  ┃  │   │                                        │      │  ┃  │
│  ┃  │   │  GUEST ONLY (wrapped in GuestRoute)    │      │  ┃  │
│  ┃  │   │  ├─ /login                             │      │  ┃  │
│  ┃  │   │  │  Login page                         │      │  ┃  │
│  ┃  │   │  └─ /register                          │      │  ┃  │
│  ┃  │   │     Registration page                  │      │  ┃  │
│  ┃  │   │                                        │      │  ┃  │
│  ┃  │   │  PROTECTED (wrapped in ProtectedRoute) │      │  ┃  │
│  ┃  │   │  └─ /library                           │      │  ┃  │
│  ┃  │   │     Main app page                      │      │  ┃  │
│  ┃  │   └────────────────────────────────────────┘      │  ┃  │
│  ┃  └────────────────────────────────────────────────────┘  ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
└────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        REGISTRATION FLOW                         │
└─────────────────────────────────────────────────────────────────┘

User                    Frontend                    Backend
  │                        │                           │
  ├──── Visit /register ──►│                           │
  │                        │                           │
  ├──── Fill form ────────►│                           │
  │                        │                           │
  │                        ├── POST /auth/register/ ──►│
  │                        │   { email, password }     │
  │                        │                           │
  │                        │◄── 201 Created ───────────┤
  │                        │   { message }             │
  │                        │                           │
  │                        │                           ├── Send email
  │                        │                           │
  │◄─── Email sent ────────┤                           │
  │                        │                           │
  ├──── Click link ───────────────────────────────────►│
  │     /verify/:uid/:token                           │
  │                        │                           │
  │                        │                           ├── Verify token
  │                        │                           ├── Activate user
  │                        │                           │
  │                        │◄── 200 OK ────────────────┤
  │◄─── Verified ──────────┤                           │
  │                        │                           │
  └──── Redirect /login ──►│                           │


┌─────────────────────────────────────────────────────────────────┐
│                           LOGIN FLOW                             │
└─────────────────────────────────────────────────────────────────┘

User                    Frontend                    Backend
  │                        │                           │
  ├──── Visit /login ─────►│                           │
  │                        │                           │
  │◄─── If authenticated ──┤                           │
  │     Redirect /library  │                           │
  │                        │                           │
  ├──── Enter credentials ►│                           │
  │                        │                           │
  │                        ├── POST /auth/login/ ─────►│
  │                        │   { email, password }     │
  │                        │                           │
  │                        │                           ├── Authenticate
  │                        │                           ├── Generate JWT
  │                        │                           │
  │                        │◄── 200 OK ────────────────┤
  │                        │   Set-Cookie: access      │
  │                        │   Set-Cookie: refresh     │
  │                        │                           │
  │                        ├── GET /auth/me/ ─────────►│
  │                        │   Cookie: access          │
  │                        │                           │
  │                        │◄── 200 OK ────────────────┤
  │                        │   { user data }           │
  │                        │                           │
  │◄─── Redirect /library ─┤                           │
  │                        │                           │


┌─────────────────────────────────────────────────────────────────┐
│                      AUTO-REFRESH FLOW                           │
└─────────────────────────────────────────────────────────────────┘

Frontend Timer               Frontend                    Backend
      │                        │                           │
      ├─── Every 4 min ────────►│                           │
      │                        │                           │
      │                        ├── POST /auth/refresh/ ───►│
      │                        │   Cookie: refresh         │
      │                        │                           │
      │                        │                           ├── Validate
      │                        │                           ├── New access
      │                        │                           │
      │                        │◄── 200 OK ────────────────┤
      │                        │   Set-Cookie: access      │
      │                        │   { message }             │
      │                        │                           │
      │                        ├── Refetch user ──────────►│
      │                        │                           │
      │                        │◄── User data ─────────────┤
      │                        │                           │
      └──────────────────────► Continue seamlessly


┌─────────────────────────────────────────────────────────────────┐
│                         LOGOUT FLOW                              │
└─────────────────────────────────────────────────────────────────┘

User                    Frontend                    Backend
  │                        │                           │
  ├──── Click logout ─────►│                           │
  │                        │                           │
  │                        ├── POST /auth/logout/ ────►│
  │                        │   Cookie: access          │
  │                        │   Cookie: refresh         │
  │                        │                           │
  │                        │                           ├── Clear cookies
  │                        │                           │
  │                        │◄── 200 OK ────────────────┤
  │                        │   Delete-Cookie: access   │
  │                        │   Delete-Cookie: refresh  │
  │                        │                           │
  │                        ├── Clear user data         │
  │                        ├── Clear queries           │
  │                        │                           │
  │◄─── Redirect / ────────┤                           │
  │                        │                           │
```

---

## Component Hierarchy

```
app/
├── layout.tsx
│   └── QueryClientProvider
│       └── AuthProvider ........................ Manages auth state
│           ├── useCurrentUser() ............... Fetches user data
│           ├── useRefreshToken() .............. Auto-refresh timer
│           └── useAuth context ................ Available to all
│
├── page.tsx (/) ............................... Public landing
│   └── No auth wrapper
│
├── (auth)/
│   ├── login/page.tsx (/login) ............... Guest only
│   │   └── GuestRoute
│   │       ├── useAuth() ..................... Check if logged in
│   │       ├── If yes → /library
│   │       └── If no → Show login
│   │
│   ├── register/page.tsx (/register) ......... Guest only
│   │   └── GuestRoute
│   │       └── Same logic as login
│   │
│   └── verify/[uidb64]/[token]/page.tsx ...... Public
│       └── VerifyEmail component
│
└── library/page.tsx (/library) ............... Protected
    └── ProtectedRoute
        ├── useAuth() ......................... Check if logged in
        ├── If no → /login
        └── If yes → Show content
```

---

## Data Flow

```
┌────────────────────────────────────────────────────────────────┐
│                      AUTH STATE FLOW                            │
└────────────────────────────────────────────────────────────────┘

┌──────────────┐
│ User Actions │
└──────┬───────┘
       │
       ├─► Login ────────────┐
       ├─► Register ─────────┤
       ├─► Verify ───────────┤
       ├─► Logout ───────────┤
       └─► Auto-refresh ─────┤
                             │
                             ▼
                   ┌──────────────────┐
                   │  Auth Mutations  │
                   │  (React Query)   │
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │   API Calls      │
                   │   (fetch)        │
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │  Django Backend  │
                   │  • Authenticate  │
                   │  • Generate JWT  │
                   │  • Set Cookies   │
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │  Cookie Storage  │
                   │  • access token  │
                   │  • refresh token │
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │  React Query     │
                   │  Cache           │
                   │  • User data     │
                   │  • 5 min stale   │
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │  AuthProvider    │
                   │  Context         │
                   │  • user          │
                   │  • isLoading     │
                   │  • isAuth        │
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │  UI Components   │
                   │  • Show/hide     │
                   │  • Redirects     │
                   │  • User info     │
                   └──────────────────┘
```

---

## Security Layers

```
┌────────────────────────────────────────────────────────────────┐
│                       SECURITY ARCHITECTURE                     │
└────────────────────────────────────────────────────────────────┘

Layer 1: Transport
├─ HTTPS (production)
├─ CORS configuration
└─ Allowed origins only

Layer 2: Cookies
├─ httpOnly (no JS access)
├─ Secure flag (production)
├─ SameSite=Lax
└─ Short expiration

Layer 3: Tokens
├─ JWT with signature
├─ Access: 5 minutes
├─ Refresh: 7 days
└─ HS256 algorithm

Layer 4: Backend
├─ Django authentication
├─ Password hashing (PBKDF2)
├─ CSRF protection
└─ Email verification

Layer 5: Frontend
├─ Protected routes
├─ Auth guards
├─ Loading states
└─ No sensitive data in localStorage
```

---

## File Structure

```
jharo/
│
├── backend/
│   ├── accounts/
│   │   ├── authentication.py ......... Cookie JWT auth
│   │   ├── views.py .................. Auth endpoints
│   │   ├── urls.py ................... URL routing
│   │   └── models.py ................. User models
│   │
│   └── config/
│       ├── settings.py ............... JWT config, CORS
│       └── urls.py ................... Root URL config
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx ................ AuthProvider wrapper
│   │   ├── page.tsx .................. Public landing
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx ........ Guest-only login
│   │   │   ├── register/page.tsx ..... Guest-only register
│   │   │   └── verify/.../page.tsx ... Email verification
│   │   │
│   │   └── library/page.tsx .......... Protected library
│   │
│   ├── components/
│   │   └── auth/
│   │       ├── auth-provider.tsx ..... Auth context
│   │       ├── protected-route.tsx ... Route guard (auth)
│   │       ├── guest-route.tsx ....... Route guard (guest)
│   │       ├── login-form.tsx ........ Login form
│   │       ├── register-form.tsx ..... Register form
│   │       └── verify-email.tsx ...... Verify component
│   │
│   ├── hooks/
│   │   └── use-auth.ts ............... Auth hooks
│   │
│   ├── lib/
│   │   └── feature/
│   │       └── auth.ts ............... Auth API calls
│   │
│   └── styles/
│       └── pages/
│           ├── _landing.scss ......... Landing styles
│           └── _library.scss ......... Library styles
│
└── docs/
    ├── AUTH_FEATURES.md .............. Feature docs
    ├── ROUTES.md ..................... Route structure
    ├── QUICK_START.md ................ Getting started
    ├── FEATURES_OVERVIEW.md .......... Feature details
    ├── IMPLEMENTATION_SUMMARY.md ..... What was built
    ├── CHECKLIST.md .................. Testing checklist
    └── ARCHITECTURE.md ............... This file
```

---

## API Endpoints

```
┌────────────────────────────────────────────────────────────────┐
│                        BACKEND API                              │
│                  http://localhost:8000                          │
└────────────────────────────────────────────────────────────────┘

POST   /api/auth/register/
       ├─ Body: { email, password }
       ├─ Response: { message }
       └─ Action: Create user, send verification email

GET    /api/auth/verify/:uid/:token/
       ├─ Params: uid (base64), token
       ├─ Response: { message }
       └─ Action: Activate user account

POST   /api/auth/login/
       ├─ Body: { email, password }
       ├─ Response: { message }
       ├─ Cookies: access, refresh
       └─ Action: Authenticate, set JWT cookies

POST   /api/auth/refresh/
       ├─ Cookie: refresh (required)
       ├─ Response: { message }
       ├─ Cookie: access (new)
       └─ Action: Issue new access token

POST   /api/auth/logout/
       ├─ Cookie: access, refresh
       ├─ Response: { message }
       ├─ Action: Clear cookies
       └─ Cookies: deleted

GET    /api/auth/me/
       ├─ Cookie: access (required)
       ├─ Response: { id, username, email, ... }
       └─ Action: Return current user data
```

---

## State Management

```
┌────────────────────────────────────────────────────────────────┐
│                     STATE ARCHITECTURE                          │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│   Server State      │
│   (React Query)     │
├─────────────────────┤
│ • Current user      │
│ • Cached 5 min      │
│ • Auto-refetch      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Auth Context      │
│   (React Context)   │
├─────────────────────┤
│ • user              │
│ • isLoading         │
│ • isAuthenticated   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Cookie Storage    │
│   (Browser)         │
├─────────────────────┤
│ • access token      │
│ • refresh token     │
│ • httpOnly          │
│ • Secure            │
└─────────────────────┘
```

---

This architecture provides:
✅ Secure authentication
✅ Seamless user experience
✅ Scalable structure
✅ Clean separation of concerns
✅ Production-ready foundation
